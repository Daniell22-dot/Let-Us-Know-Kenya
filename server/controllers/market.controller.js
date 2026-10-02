const { Op } = require('sequelize');
const db = require('../models');
const MarketIssuer = db.marketIssuers;
const MarketSnapshot = db.marketSnapshots;
const { fetchMarketSnapshot } = require('../services/nse.service');
const { getIssuerMeta } = require('../data/nse-issuers');

const num = (value) => {
    if (value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const round = (value, places = 2) =>
    value === null ? null : Number(value.toFixed(places));

const enrich = (quote) => {
    const meta = getIssuerMeta(quote.issuer);
    return {
        ticker: meta.ticker,
        name: meta.name,
        sector: meta.sector,
        price: quote.price,
        prevClose: quote.prevClose,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        changePct: round(quote.changePct),
        volume: quote.volume,
        turnover: quote.turnover
    };
};

/**
 * Price-weighted composite across every issuer that reports a previous close,
 * rebased so the previous session equals 100. This is calculated by us from the
 * constituent prices; it is deliberately not presented as the official NSE 20
 * or NSE 25 index level, which NSE publishes only through its paid feed.
 */
const buildComposite = (quotes) => {
    const eligible = quotes.filter((q) => q.prevClose && q.prevClose > 0);
    if (eligible.length === 0) return null;

    const current = eligible.reduce((sum, q) => sum + q.price, 0);
    const previous = eligible.reduce((sum, q) => sum + q.prevClose, 0);
    if (previous === 0) return null;

    const value = (current / previous) * 100;
    return {
        label: 'LUK Market Composite',
        value: round(value),
        changePct: round(value - 100),
        constituents: eligible.length,
        note: 'Price-weighted, rebased to 100. Calculated by Let Us Know Kenya from NSE prices. Not the official NSE 20 or NSE 25 index level.'
    };
};

const buildBreadth = (quotes) => {
    const withChange = quotes.filter((q) => q.changePct !== null);
    return {
        advancing: withChange.filter((q) => q.changePct > 0).length,
        declining: withChange.filter((q) => q.changePct < 0).length,
        unchanged: withChange.filter((q) => q.changePct === 0).length,
        total: withChange.length
    };
};

const buildSectors = (quotes) => {
    const grouped = new Map();

    quotes.forEach((quote) => {
        const bucket = grouped.get(quote.sector) || {
            sector: quote.sector,
            count: 0,
            changeSum: 0,
            changeCount: 0,
            turnover: 0,
            positive: 0,
            negative: 0
        };

        bucket.count += 1;
        bucket.turnover += quote.turnover || 0;

        if (quote.changePct !== null) {
            bucket.changeSum += quote.changePct;
            bucket.changeCount += 1;
            if (quote.changePct > 0) bucket.positive += 1;
            if (quote.changePct < 0) bucket.negative += 1;
        }

        grouped.set(quote.sector, bucket);
    });

    const rows = Array.from(grouped.values())
        .map((bucket) => ({
            sector: bucket.sector,
            count: bucket.count,
            turnover: round(bucket.turnover),
            avgChangePct: bucket.changeCount
                ? round(bucket.changeSum / bucket.changeCount)
                : null,
            advancing: bucket.positive,
            declining: bucket.negative
        }))
        .sort((a, b) => (b.avgChangePct ?? -Infinity) - (a.avgChangePct ?? -Infinity));

    const grandTurnover = rows.reduce((sum, row) => sum + (row.turnover || 0), 0);

    return rows.map((row) => ({
        ...row,
        turnoverWeight: grandTurnover
            ? round((row.turnover / grandTurnover) * 100)
            : 0
    }));
};

const byTurnoverDesc = (a, b) => (b.turnover || 0) - (a.turnover || 0);
const byChangeDesc = (a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity);

const getOverview = async (req, res) => {
    try {
        const snapshot = await fetchMarketSnapshot();
        const quotes = snapshot.quotes.map(enrich);
        const traded = quotes.filter((q) => q.volume !== null && q.volume > 0);

        res.json({
            meta: {
                source: snapshot.source,
                marketStatus: snapshot.marketStatus,
                tradingDate: snapshot.tradingDate,
                tradingTime: snapshot.tradingTime,
                fetchedAt: snapshot.fetchedAt,
                indexNote: 'Official NSE 20 and NSE 25 index levels are sold by NSE as a paid data service and are not part of the free ticker feed.'
            },
            breadth: buildBreadth(quotes),
            totals: {
                listed: quotes.length,
                traded: traded.length,
                turnover: round(quotes.reduce((sum, q) => sum + (q.turnover || 0), 0)),
                volume: quotes.reduce((sum, q) => sum + (q.volume || 0), 0)
            },
            composite: buildComposite(quotes),
            sectors: buildSectors(quotes),
            movers: {
                gainers: [...quotes].filter((q) => q.changePct !== null).sort(byChangeDesc).slice(0, 6),
                losers: [...quotes]
                    .filter((q) => q.changePct !== null)
                    .sort((a, b) => (a.changePct ?? Infinity) - (b.changePct ?? Infinity))
                    .slice(0, 6),
                mostActive: [...quotes].sort(byTurnoverDesc).slice(0, 6)
            },
            quotes
        });
    } catch (err) {
        res.status(503).json({ message: err.message || 'Market data is temporarily unavailable.' });
    }
};

const getHistory = async (req, res) => {
    try {
        const ticker = req.query.ticker ? String(req.query.ticker).toUpperCase() : null;
        const days = Math.min(Math.max(Number(req.query.days) || 90, 1), 730);

        const latest = await MarketSnapshot.max('tradingDate');
        if (!latest) {
            return res.status(404).json({
                message: 'No market history has been recorded yet.',
                detail: 'History is built as the market is synced. Run the market sync to start collecting it.'
            });
        }

        const cutoff = new Date(`${latest}T00:00:00Z`);
        cutoff.setUTCDate(cutoff.getUTCDate() - (days - 1));

        const rows = await MarketSnapshot.findAll({
            where: { tradingDate: { [Op.gte]: cutoff.toISOString().slice(0, 10) } },
            order: [['tradingDate', 'ASC']]
        });

        const dates = Array.from(new Set(rows.map((r) => r.tradingDate)));
        const dateSet = new Set(dates);

        if (ticker) {
            const series = rows
                .filter((row) => row.ticker === ticker && dateSet.has(row.tradingDate))
                .sort((a, b) => a.tradingDate.localeCompare(b.tradingDate))
                .map((row) => ({
                    date: row.tradingDate,
                    close: num(row.close),
                    open: num(row.open),
                    high: num(row.high),
                    low: num(row.low),
                    volume: num(row.volume),
                    turnover: num(row.turnover)
                }));

            if (series.length === 0) {
                return res.status(404).json({
                    message: 'No stored history for this counter yet.',
                    detail: 'History is recorded as the market is synced. Run the market sync to start building it.'
                });
            }

            return res.json({ scope: 'issuer', ticker, points: series });
        }

        const compositeByDate = dates.map((date) => {
            const sameDay = rows.filter((row) => row.tradingDate === date);
            let previousSum = 0;
            let currentSum = 0;
            let constituents = 0;
            let turnover = 0;

            sameDay.forEach((row) => {
                const prev = num(row.prevClose);
                const close = num(row.close);
                if (prev && prev > 0 && close !== null) {
                    previousSum += prev;
                    currentSum += close;
                    constituents += 1;
                }
                turnover += num(row.turnover) || 0;
            });

            const value = previousSum ? (currentSum / previousSum) * 100 : null;
            return {
                date,
                value: round(value),
                changePct: value === null ? null : round(value - 100),
                constituents,
                turnover: round(turnover)
            };
        }).filter((point) => point.value !== null);

        res.json({
            scope: 'market',
            label: 'LUK Market Composite',
            note: 'Price-weighted composite rebased to 100, calculated from stored NSE closes.',
            points: compositeByDate
        });
    } catch (err) {
        res.status(500).json({ message: err.message || 'Could not load market history.' });
    }
};

/**
 * Pulls the live feed and records it. Exposed as an admin-only route so the
 * dashboard can be refreshed deliberately, and reusable from a scheduler.
 */
const sync = async (req, res) => {
    try {
        const snapshot = await fetchMarketSnapshot({ force: true });
        const tradingDate = snapshot.tradingDate || new Date().toISOString().slice(0, 10);
        const capturedAt = new Date();
        const tickers = [];

        await Promise.all(
            snapshot.quotes.map(async (quote) => {
                const meta = getIssuerMeta(quote.issuer);
                tickers.push(meta.ticker);

                const issuer = await MarketIssuer.findOne({ where: { ticker: meta.ticker } });
                if (!issuer) {
                    await MarketIssuer.create({ ...meta, active: true });
                    return;
                }

                const updates = {};
                // The seed list only fills gaps. A sector that has been
                // corrected in the database is never overwritten, otherwise
                // every sync would undo the correction.
                if (issuer.sector === 'Other' && meta.sector !== 'Other') {
                    updates.sector = meta.sector;
                }
                if ((!issuer.name || issuer.name === meta.ticker) && meta.name && meta.name !== meta.ticker) {
                    updates.name = meta.name;
                }
                if (issuer.active === false) updates.active = true;

                if (Object.keys(updates).length > 0) await issuer.update(updates);
            })
        );

        const rows = snapshot.quotes.map((quote) => ({
            ticker: quote.issuer,
            tradingDate,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            prevClose: quote.prevClose,
            volume: quote.volume,
            turnover: quote.turnover,
            changePct: quote.changePct,
            capturedAt
        }));

        await MarketSnapshot.bulkCreate(rows, {
            // Postgres needs the conflict target spelled out, otherwise
            // Sequelize throws instead of generating ON CONFLICT.
            upsertKeys: ['ticker', 'tradingDate'],
            updateOnDuplicate: [
                'open', 'high', 'low', 'close', 'prevClose',
                'volume', 'turnover', 'changePct', 'capturedAt'
            ]
        });

        await MarketIssuer.destroy({ where: { ticker: { [Op.notIn]: tickers } }, silent: true });

        res.json({
            message: `Synced ${rows.length} counters for ${tradingDate}.`,
            tradingDate,
            marketStatus: snapshot.marketStatus,
            quotes: rows.length
        });
    } catch (err) {
        res.status(503).json({ message: err.message || 'Market sync failed.' });
    }
};

module.exports = { getOverview, getHistory, sync };