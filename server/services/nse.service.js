const NSE_TICKER_URL = 'https://nsenairobi.nse.co.ke/nseticker/api/v1/ticker';
const NSE_ORIGIN = 'https://www.nse.co.ke';
const NSE_REFERER = 'https://www.nse.co.ke/share-price/';
const DEFAULT_ISINNO = 'KE3000009674';
const REQUEST_TIMEOUT_MS = 12000;

const CACHE_TTL_MS = Number(process.env.NSE_CACHE_TTL_MS) || 60 * 1000;

let cache = { payload: null, fetchedAt: 0 };
let inFlight = null;

const toNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

const toText = (value) => (typeof value === 'string' ? value.trim() : '');

const parseNseDate = (raw) => {
    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(toText(raw));
    if (!match) return null;
    const [, day, month, year] = match;
    const iso = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const parsed = new Date(`${iso}T00:00:00Z`);
    return Number.isNaN(parsed.getTime()) ? null : iso;
};

const extractSnapshot = (payload) => {
    const message = payload?.message;
    if (!Array.isArray(message) || !Array.isArray(message[0]?.snapshot)) {
        if (typeof message === 'string') {
            throw new Error(`NSE rejected the request: ${message}`);
        }
        throw new Error('NSE returned an unexpected response shape.');
    }
    return message[0].snapshot;
};

const extractStatus = (payload) => {
    const message = payload?.message;
    const updated = Array.isArray(message) ? message[1]?.updated_at : null;
    return {
        marketStatus: toText(updated?.market_status) || 'unknown',
        tradingDate: parseNseDate(updated?.date),
        tradingTime: toText(updated?.time) || null
    };
};

/**
 * The feed lists several instruments under some issuer codes (for example the
 * KPLC ordinary and preference lines, or repeated rows for bonds). Keeping the
 * most heavily traded instrument per code gives one row per company and stops
 * the duplicate codes from double counting breadth and turnover.
 */
const dedupeByIssuer = (rows) => {
    const best = new Map();

    rows.forEach((row) => {
        const issuer = toText(row.issuer).toUpperCase();
        if (!issuer) return;

        const current = best.get(issuer);
        if (!current || (row.turnover ?? -1) > (current.turnover ?? -1)) {
            best.set(issuer, row);
        }
    });

    return Array.from(best.values());
};

const normalizeRow = (row) => {
    const issuer = toText(row.issuer).toUpperCase();
    const price = toNumber(row.price ?? row.ltp ?? row.today_close);
    if (!issuer || price === null) return null;

    const prevClose = toNumber(row.prev_price);
    const changePct = toNumber(row.change);

    return {
        issuer,
        price,
        prevClose,
        open: toNumber(row.today_open),
        high: toNumber(row.today_high),
        low: toNumber(row.today_low),
        close: toNumber(row.today_close) ?? price,
        volume: toNumber(row.volume),
        turnover: toNumber(row.turnover),
        changePct:
            changePct !== null
                ? changePct
                : prevClose && prevClose !== 0
                    ? Number((((price - prevClose) / prevClose) * 100).toFixed(2))
                    : null
    };
};

const requestPayload = async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
        const response = await fetch(NSE_TICKER_URL, {
            method: 'POST',
            headers: {
                // NSE only answers requests it believes come from its own site.
                // Browsers cannot set Origin, so this call has to stay server side.
                Origin: NSE_ORIGIN,
                Referer: NSE_REFERER,
                'Content-Type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                nopage: 'true',
                isinno: process.env.NSE_TICKER_ISINNO || DEFAULT_ISINNO
            }),
            signal: controller.signal
        });

        if (!response.ok) {
            throw new Error(`NSE responded with HTTP ${response.status}.`);
        }

        return await response.json();
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new Error('Timed out waiting for NSE.');
        }
        throw err;
    } finally {
        clearTimeout(timer);
    }
};

/**
 * Fetches the official NSE ticker snapshot. Concurrent callers share one
 * upstream request so a page of cards cannot fan out into dozens of hits.
 */
const fetchMarketSnapshot = async ({ force = false } = {}) => {
    const fresh = cache.payload && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
    if (fresh && !force) return cache.payload;
    if (inFlight) return inFlight;

    inFlight = (async () => {
        const payload = await requestPayload();
        const quotes = dedupeByIssuer(extractSnapshot(payload))
            .map(normalizeRow)
            .filter(Boolean);

        const result = {
            ...extractStatus(payload),
            source: 'NSE Kenya (nseticker)',
            fetchedAt: new Date().toISOString(),
            quotes
        };

        cache = { payload: result, fetchedAt: Date.now() };
        return result;
    })();

    try {
        return await inFlight;
    } finally {
        inFlight = null;
    }
};

const clearCache = () => {
    cache = { payload: null, fetchedAt: 0 };
};

module.exports = {
    fetchMarketSnapshot,
    clearCache,
    NSE_TICKER_URL,
    NSE_ORIGIN
};