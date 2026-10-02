import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    TrendingUp,
    TrendingDown,
    RefreshCw,
    Search,
    AlertTriangle,
    BarChart3,
    Activity,
    Info
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Cell,
    ReferenceLine
} from 'recharts';
import api from '../shared/services/api.js';
import { getSectorColor } from '../shared/data/constants.js';

const BRAND_RED = '#c41e3a';
const BRAND_GREEN = '#00a84f';
const SLATE = '#1e293b';
const SLATE_LIGHT = '#94a3b8';

const KES = (value, places = 2) => {
    if (value === null || value === undefined) return '--';
    return `KES ${Number(value).toLocaleString('en-KE', {
        minimumFractionDigits: places,
        maximumFractionDigits: places
    })}`;
};

const compactKES = (value) => {
    if (value === null || value === undefined) return '--';
    const n = Number(value);
    if (Math.abs(n) >= 1e9) return `KES ${(n / 1e9).toFixed(2)}B`;
    if (Math.abs(n) >= 1e6) return `KES ${(n / 1e6).toFixed(1)}M`;
    if (Math.abs(n) >= 1e3) return `KES ${(n / 1e3).toFixed(1)}K`;
    return `KES ${n.toFixed(0)}`;
};

const compactCount = (value) => {
    if (value === null || value === undefined) return '--';
    const n = Number(value);
    if (Math.abs(n) >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (Math.abs(n) >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
    return n.toLocaleString('en-KE');
};

const pct = (value) =>
    value === null || value === undefined ? '--' : `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(2)}%`;

const changeColor = (value) =>
    value === null || value === undefined ? SLATE_LIGHT : value > 0 ? BRAND_GREEN : value < 0 ? BRAND_RED : SLATE_LIGHT;

const shortDate = (iso) => {
    if (!iso) return '--';
    const [y, m, d] = iso.split('-');
    return `${d} ${new Date(Number(y), Number(m) - 1, Number(d)).toLocaleString('en-KE', { month: 'short' })}`;
};

/**
 * NSE occasionally publishes an open or high that disagrees with the traded
 * range. Clamping keeps the drawn range physically possible without altering
 * the reported price itself.
 */
const safeRange = (quote) => {
    const points = [quote.price, quote.high, quote.low].filter((v) => v !== null && v !== undefined);
    if (points.length === 0) return null;
    return {
        high: Math.max(...points),
        low: Math.min(...points),
        open: quote.open !== null && quote.open !== undefined ? Math.min(Math.max(quote.open, Math.min(...points)), Math.max(...points)) : null
    };
};

const ChartTooltip = ({ active, payload, label, valueFormatter }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg text-xs">
            <p className="font-semibold text-[#1e293b]">{label}</p>
            {payload.map((entry) => (
                <p key={entry.dataKey} className="mt-0.5" style={{ color: entry.color }}>
                    {entry.name}: {valueFormatter ? valueFormatter(entry.value) : entry.value}
                </p>
            ))}
        </div>
    );
};

const SectionCard = ({ title, subtitle, action, children, className = '' }) => (
    <section className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
        <div className="mb-4 flex items-start justify-between gap-3">
            <div>
                <h2 className="text-base font-bold text-[#1e293b]">{title}</h2>
                {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
            </div>
            {action}
        </div>
        {children}
    </section>
);

const ChangePill = ({ value }) => (
    <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
        style={{ color: changeColor(value), backgroundColor: `${changeColor(value)}18` }}
    >
        {value > 0 && <TrendingUp size={12} />}
        {value < 0 && <TrendingDown size={12} />}
        {pct(value)}
    </span>
);

const QuoteTable = ({ rows, onSelect, selectedTicker }) => {
    if (!rows.length) {
        return <p className="py-8 text-center text-sm text-gray-500">No counters match your search.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                        <th className="py-2 pr-3 font-semibold">Counter</th>
                        <th className="py-2 pr-3 font-semibold">Sector</th>
                        <th className="py-2 pr-3 text-right font-semibold">Price</th>
                        <th className="py-2 pr-3 text-right font-semibold">Change</th>
                        <th className="py-2 pr-3 text-right font-semibold">Volume</th>
                        <th className="py-2 text-right font-semibold">Turnover</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((quote) => {
                        const isSelected = quote.ticker === selectedTicker;
                        return (
                            <tr
                                key={quote.ticker}
                                onClick={() => onSelect(quote)}
                                className={`cursor-pointer border-b border-gray-100 transition-colors hover:bg-gray-50 ${isSelected ? 'bg-[#00a84f08]' : ''}`}
                            >
                                <td className="py-2.5 pr-3">
                                    <div className="font-semibold text-[#1e293b]">{quote.ticker}</div>
                                    <div className="text-xs text-gray-500">{quote.name}</div>
                                </td>
                                <td className="py-2.5 pr-3">
                                    <span
                                        className="inline-flex items-center gap-1.5 text-xs text-gray-600"
                                        style={{ color: getSectorColor(quote.sector) }}
                                    >
                                        <span
                                            className="inline-block h-2 w-2 rounded-full"
                                            style={{ backgroundColor: getSectorColor(quote.sector) }}
                                        />
                                        {quote.sector}
                                    </span>
                                </td>
                                <td className="py-2.5 pr-3 text-right font-medium tabular-nums">{KES(quote.price)}</td>
                                <td className="py-2.5 pr-3 text-right">
                                    <ChangePill value={quote.changePct} />
                                </td>
                                <td className="py-2.5 pr-3 text-right tabular-nums text-gray-600">
                                    {compactCount(quote.volume)}
                                </td>
                                <td className="py-2.5 text-right tabular-nums text-gray-600">
                                    {compactKES(quote.turnover)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const MarketPage = () => {
    const [overview, setOverview] = useState(null);
    const [history, setHistory] = useState([]);
    const [issuerHistory, setIssuerHistory] = useState([]);
    const [selected, setSelected] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState({ key: 'turnover', direction: 'desc' });
    const [sectorMetric, setSectorMetric] = useState('turnoverWeight');

    const load = useCallback(async ({ silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        try {
            const data = await api.getMarketOverview();
            setOverview(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Market data is unavailable right now.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    const loadHistory = useCallback(async () => {
        try {
            const data = await api.getMarketHistory({ days: 180 });
            setHistory(data.points || []);
        } catch (_) {
            setHistory([]);
        }
    }, []);

    useEffect(() => {
        load();
        loadHistory();
    }, [load, loadHistory]);

    useEffect(() => {
        if (!selected) {
            setIssuerHistory([]);
            return;
        }
        let cancelled = false;
        api
            .getMarketHistory({ ticker: selected.ticker, days: 180 })
            .then((data) => {
                if (!cancelled) setIssuerHistory(data.points || []);
            })
            .catch(() => {
                if (!cancelled) setIssuerHistory([]);
            });
        return () => {
            cancelled = true;
        };
    }, [selected]);

    const quotes = overview?.quotes || [];

    const visibleQuotes = useMemo(() => {
        const term = search.trim().toLowerCase();
        const filtered = term
            ? quotes.filter(
                (q) =>
                    q.ticker.toLowerCase().includes(term) ||
                    (q.name || '').toLowerCase().includes(term) ||
                    q.sector.toLowerCase().includes(term)
            )
            : quotes;

        const sorted = [...filtered].sort((a, b) => {
            const pick = (q) => {
                if (sort.key === 'ticker') return q.ticker.toLowerCase();
                if (sort.key === 'changePct') return q.changePct ?? -Infinity;
                if (sort.key === 'price') return q.price ?? 0;
                return q.turnover ?? -Infinity;
            };
            const av = pick(a);
            const bv = pick(b);
            if (typeof av === 'string' || typeof bv === 'string') {
                return sort.direction === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
            }
            return sort.direction === 'asc' ? av - bv : bv - av;
        });

        return sorted;
    }, [quotes, search, sort]);

    const sectorData = useMemo(() => {
        const rows = (overview?.sectors || []).filter((s) => s.sector !== 'Other' || s.count >= 3);
        return rows.map((s) => ({
            name: s.sector,
            change: s.avgChangePct ?? 0,
            weight: s.turnoverWeight ?? 0,
            count: s.count
        }));
    }, [overview]);

    const moversData = useMemo(() => {
        const rows = [
            ...(overview?.movers?.gainers || []),
            ...(overview?.movers?.losers || [])
        ];
        return rows.map((q) => ({ name: q.ticker, change: q.changePct ?? 0 }));
    }, [overview]);

    const breadthData = useMemo(() => {
        const b = overview?.breadth;
        if (!b) return [];
        return [
            { name: 'Advancing', value: b.advancing, color: BRAND_GREEN },
            { name: 'Unchanged', value: b.unchanged, color: SLATE_LIGHT },
            { name: 'Declining', value: b.declining, color: BRAND_RED }
        ];
    }, [overview]);

    const range = selected ? safeRange(selected) : null;

    return (
        <div className="animate-fade-in bg-gray-50 min-h-screen">
            <Helmet>
                <title>Let Us Know Kenya | NSE Market</title>
                <meta
                    name="description"
                    content="Live Nairobi Securities Exchange prices, market breadth and sector performance from official NSE data."
                />
            </Helmet>

            <div className="bg-gradient-to-br from-[#1e293b] via-[#c41e3a] to-[#1e293b] text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <BarChart3 size={26} />
                                <h1 className="text-3xl font-bold">NSE Market</h1>
                            </div>
                            <p className="mt-2 max-w-xl text-sm text-white/85">
                                Prices, breadth and sector performance for the Nairobi Securities Exchange, sourced from the
                                official NSE ticker service.
                            </p>
                            {overview && (
                                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                                    <span
                                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold"
                                        style={{
                                            backgroundColor:
                                                overview.meta.marketStatus === 'open' ? '#00a84f33' : '#ffffff1a'
                                        }}
                                    >
                                        <span
                                            className="inline-block h-2 w-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    overview.meta.marketStatus === 'open' ? BRAND_GREEN : SLATE_LIGHT
                                            }}
                                        />
                                        Market {overview.meta.marketStatus}
                                    </span>
                                    <span className="text-white/75">
                                        As of {shortDate(overview.meta.tradingDate)}
                                        {overview.meta.tradingTime ? ` \u00b7 ${overview.meta.tradingTime}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => {
                                load({ silent: true });
                                loadHistory();
                            }}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium transition-colors hover:bg-white/20 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing' : 'Refresh'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 space-y-6">
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-[#c41e3a33] bg-[#c41e3a0d] p-4 text-sm text-[#c41e3a]">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Market data unavailable</p>
                            <p className="mt-0.5 text-[#c41e3a99]">{error}</p>
                        </div>
                    </div>
                )}

                {loading && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
                        ))}
                    </div>
                )}

                {overview && (
                    <>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    {overview.composite?.label || 'Market composite'}
                                </p>
                                <p className="mt-1 text-2xl font-bold text-[#1e293b]">
                                    {overview.composite ? overview.composite.value.toFixed(2) : '--'}
                                </p>
                                <div className="mt-1">
                                    <ChangePill value={overview.composite?.changePct} />
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Market breadth</p>
                                <p className="mt-1 text-2xl font-bold text-[#1e293b]">
                                    {overview.breadth.advancing}
                                    <span className="text-base font-medium text-gray-400"> / </span>
                                    {overview.breadth.declining}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">Advancing / declining</p>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Turnover</p>
                                <p className="mt-1 text-2xl font-bold text-[#1e293b]">
                                    {compactKES(overview.totals.turnover)}
                                </p>
                                <p className="mt-1 text-xs text-gray-500">{compactCount(overview.totals.volume)} shares</p>
                            </div>

                            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Counters traded</p>
                                <p className="mt-1 text-2xl font-bold text-[#1e293b]">
                                    {overview.totals.traded}
                                    <span className="text-base font-medium text-gray-400"> / {overview.totals.listed}</span>
                                </p>
                                <p className="mt-1 text-xs text-gray-500">of listed counters</p>
                            </div>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <SectionCard
                                title="Market breadth"
                                subtitle="How the session split across all listed counters"
                            >
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={breadthData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<ChartTooltip />} cursor={{ fill: '#0f172a08' }} />
                                        <Bar dataKey="value" name="Counters" radius={[6, 6, 0, 0]} maxBarSize={64}>
                                            {breadthData.map((entry) => (
                                                <Cell key={entry.name} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </SectionCard>

                            <SectionCard
                                title="Sector performance"
                                subtitle="Average move across each sector"
                                className="lg:col-span-2"
                                action={
                                    <div className="flex rounded-lg border border-gray-200 p-0.5">
                                        {[
                                            { key: 'turnoverWeight', label: 'Turnover' },
                                            { key: 'change', label: 'Avg change' }
                                        ].map((option) => (
                                            <button
                                                key={option.key}
                                                onClick={() => setSectorMetric(option.key)}
                                                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                                                    sectorMetric === option.key
                                                        ? 'bg-[#1e293b] text-white'
                                                        : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                }
                            >
                                {sectorData.length === 0 ? (
                                    <p className="py-16 text-center text-sm text-gray-500">No sector data available.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={260}>
                                        <BarChart data={sectorData} margin={{ top: 8, right: 8, bottom: 40, left: -8 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 10, fill: '#64748b' }}
                                                angle={-35}
                                                textAnchor="end"
                                                interval={0}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                axisLine={false}
                                                tickLine={false}
                                                tickFormatter={(v) => (sectorMetric === 'turnoverWeight' ? `${v}%` : `${v}%`)}
                                            />
                                            <Tooltip
                                                content={
                                                    <ChartTooltip
                                                        valueFormatter={(v) =>
                                                            sectorMetric === 'turnoverWeight' ? `${v}% of turnover` : pct(v)
                                                        }
                                                    />
                                                }
                                                cursor={{ fill: '#0f172a08' }}
                                            />
                                            <ReferenceLine y={0} stroke="#cbd5e1" />
                                            <Bar dataKey={sectorMetric} radius={[4, 4, 0, 0]} maxBarSize={46}>
                                                {sectorData.map((entry) => (
                                                    <Cell
                                                        key={entry.name}
                                                        fill={
                                                            sectorMetric === 'turnoverWeight'
                                                                ? getSectorColor(entry.name)
                                                                : changeColor(entry.change)
                                                        }
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </SectionCard>
                        </div>

                        <div className="grid gap-6 lg:grid-cols-3">
                            <SectionCard title="Top movers" subtitle="Biggest gainers and losers by percentage" className="lg:col-span-2">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={moversData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                                        <Tooltip content={<ChartTooltip valueFormatter={(v) => pct(v)} />} cursor={{ fill: '#0f172a08' }} />
                                        <ReferenceLine y={0} stroke="#cbd5e1" />
                                        <Bar dataKey="change" name="Change" radius={[4, 4, 0, 0]} maxBarSize={40}>
                                            {moversData.map((entry) => (
                                                <Cell key={entry.name} fill={changeColor(entry.change)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </SectionCard>

                            <SectionCard title="Most active" subtitle="Highest turnover" className="lg:col-span-1">
                                <ul className="divide-y divide-gray-100">
                                    {(overview.movers.mostActive || []).map((quote) => (
                                        <li key={quote.ticker} className="flex items-center justify-between py-2.5">
                                            <div>
                                                <p className="text-sm font-semibold text-[#1e293b]">{quote.ticker}</p>
                                                <p className="text-xs text-gray-500">{quote.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium tabular-nums">{compactKES(quote.turnover)}</p>
                                                <ChangePill value={quote.changePct} />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </SectionCard>
                        </div>

                        <SectionCard
                            title="Market trend"
                            subtitle="Price-weighted composite, rebased to 100"
                            action={
                                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                                    <Activity size={14} />
                                    {history.length} trading day{history.length === 1 ? '' : 's'} recorded
                                </span>
                            }
                        >
                            {history.length > 1 ? (
                                <ResponsiveContainer width="100%" height={280}>
                                    <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                        <XAxis
                                            dataKey="date"
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            tickFormatter={shortDate}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                                        <Tooltip content={<ChartTooltip valueFormatter={(v) => Number(v).toFixed(2)} />} />
                                        <ReferenceLine y={100} stroke="#cbd5e1" strokeDasharray="4 4" />
                                        <Line type="monotone" dataKey="value" name="Composite" stroke={SLATE} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex flex-col items-center gap-2 py-14 text-center">
                                    <Info size={22} className="text-gray-400" />
                                    <p className="text-sm font-medium text-[#1e293b]">No stored history yet</p>
                                    <p className="max-w-md text-xs text-gray-500">
                                        NSE's public ticker feed only publishes a live snapshot, so the trend line is built as
                                        the market is synced. Run the market sync to begin collecting daily closes.
                                    </p>
                                </div>
                            )}
                        </SectionCard>

                        {selected && (
                            <SectionCard
                                title={`${selected.ticker} \u00b7 ${selected.name}`}
                                subtitle={`${selected.sector} \u00b7 closing ${KES(selected.price)}`}
                                action={
                                    <button
                                        onClick={() => setSelected(null)}
                                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                }
                            >
                                <div className="mb-5 grid gap-4 sm:grid-cols-4">
                                    {[
                                        { label: 'Open', value: range?.open !== null && range?.open !== undefined ? KES(range.open) : '--' },
                                        { label: 'Day high', value: range ? KES(range.high) : '--' },
                                        { label: 'Day low', value: range ? KES(range.low) : '--' },
                                        { label: 'Volume', value: compactCount(selected.volume) }
                                    ].map((item) => (
                                        <div key={item.label} className="rounded-lg bg-gray-50 p-3">
                                            <p className="text-xs text-gray-500">{item.label}</p>
                                            <p className="mt-0.5 text-sm font-semibold text-[#1e293b]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {issuerHistory.length > 1 ? (
                                    <ResponsiveContainer width="100%" height={240}>
                                        <LineChart data={issuerHistory} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                tickFormatter={shortDate}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                                            <Tooltip content={<ChartTooltip valueFormatter={(v) => KES(v)} />} />
                                            <Line type="monotone" dataKey="close" name="Close" stroke={BRAND_GREEN} strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <p className="py-10 text-center text-sm text-gray-500">
                                        No recorded price history for {selected.ticker} yet.
                                    </p>
                                )}
                            </SectionCard>
                        )}

                        <SectionCard
                            title="All counters"
                            subtitle={`${visibleQuotes.length} of ${quotes.length} listed`}
                            action={
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="relative">
                                        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Search counter or sector"
                                            className="w-56 rounded-lg border border-gray-200 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-[#00a84f]"
                                        />
                                    </div>
                                    <select
                                        value={`${sort.key}:${sort.direction}`}
                                        onChange={(e) => {
                                            const [key, direction] = e.target.value.split(':');
                                            setSort({ key, direction });
                                        }}
                                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-[#00a84f]"
                                    >
                                        <option value="turnover:desc">Sort: turnover</option>
                                        <option value="changePct:desc">Sort: top gainers</option>
                                        <option value="changePct:asc">Sort: top losers</option>
                                        <option value="price:desc">Sort: highest price</option>
                                        <option value="price:asc">Sort: lowest price</option>
                                        <option value="ticker:asc">Sort: A\u2013Z</option>
                                    </select>
                                </div>
                            }
                        >
                            <QuoteTable rows={visibleQuotes} onSelect={setSelected} selectedTicker={selected?.ticker} />
                        </SectionCard>

                        <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-xs leading-relaxed text-gray-600">
                            <p className="font-semibold text-[#1e293b]">About this data</p>
                            <p className="mt-1">
                                Quotes come from the official NSE ticker service at{' '}
                                <span className="font-mono">{overview.meta.source}</span> and are refreshed on request.
                                {overview.composite?.note}
                            </p>
                            <p className="mt-1">{overview.meta.indexNote}</p>
                            <p className="mt-1">
                                Prices are indicative and provided for information only, and are not investment advice.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MarketPage;