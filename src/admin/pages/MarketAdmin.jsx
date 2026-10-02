import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge } from '../components/ContentTable';
import { PageHeader, Detail } from '../components/AdminUI';

const fmtNum = (n) => (n === null || n === undefined ? '—' : Number(n).toLocaleString());
const fmtPct = (n) => (n === null || n === undefined ? '—' : `${Number(n) > 0 ? '+' : ''}${Number(n).toFixed(2)}%`);

/**
 * Market data operations. Lets an admin see exactly what the NSE feed returned,
 * trigger a sync, and inspect captured history, so the numbers on the public
 * dashboard are never a black box.
 */
const MarketAdmin = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [notice, setNotice] = useState('');
    const [error, setError] = useState('');
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('issuers');

    const loadOverview = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await api.getMarketOverview();
            setOverview(data);
        } catch (err) {
            setError(err.message || 'Could not reach the NSE feed.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadOverview(); }, []);

    const loadHistory = async () => {
        setHistoryLoading(true);
        try {
            const data = await api.getMarketHistory({ days: 30 });
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            setNotice(err.message || 'No market history captured yet. Run a sync first.');
        } finally {
            setHistoryLoading(false);
        }
    };

    const runSync = async () => {
        setSyncing(true);
        setNotice('');
        try {
            const result = await api.syncMarket();
            setNotice(
                `Sync complete: ${result?.stored ?? result?.inserted ?? 0} snapshots written for ${result?.capturedDate || 'today'}.`
            );
            loadHistory();
        } catch (err) {
            setNotice(err.message || 'Sync failed. Is the NSE feed reachable?');
        } finally {
            setSyncing(false);
        }
    };

    const issuers = overview?.movers ? [...overview.movers.gainers, ...overview.movers.losers] : [];

    const columns = [
        { key: 'ticker', header: 'Ticker', render: (row) => <span className="font-bold text-[#1e293b]">{row.ticker}</span> },
        { key: 'name', header: 'Issuer' },
        { key: 'sector', header: 'Sector', render: (row) => <StatusBadge value={row.sector} /> },
        {
            key: 'changePct',
            header: 'Change',
            render: (row) => (
                <span className={`font-bold ${Number(row.changePct) >= 0 ? 'text-[#00a84f]' : 'text-[#c41e3a]'}`}>
                    {fmtPct(row.changePct)}
                </span>
            )
        },
        { key: 'price', header: 'Price', render: (row) => fmtNum(row.price) },
        { key: 'volume', header: 'Volume', render: (row) => fmtNum(row.volume) }
    ];

    const historyColumns = [
        { key: 'ticker', header: 'Ticker' },
        { key: 'tradingDate', header: 'Trading date' },
        { key: 'close', header: 'Close', render: (row) => fmtNum(row.close) },
        { key: 'volume', header: 'Volume', render: (row) => fmtNum(row.volume) }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Market Data"
                description="Live NSE Kenya prices, plus the daily history captured for the public dashboard."
            >
                <button
                    onClick={runSync}
                    disabled={syncing}
                    className="inline-flex items-center gap-2 bg-[#00a84f] text-white px-5 py-3 rounded-lg font-bold hover:bg-[#009540] disabled:opacity-60 transition-all"
                >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                    {syncing ? 'Syncing...' : 'Sync now'}
                </button>
            </PageHeader>

            {notice && (
                <div className="rounded-lg border border-[#00a84f]/30 bg-[#00a84f]/5 px-4 py-3 text-sm text-[#1e293b]">
                    {notice}
                </div>
            )}
            {error && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="h-40 flex items-center justify-center text-gray-400">
                    <Loader2 className="animate-spin" size={28} />
                </div>
            ) : overview ? (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Quotes', value: fmtNum(overview.breadth?.total), hint: `${overview.breadth?.advancing ?? 0} up / ${overview.breadth?.declining ?? 0} down` },
                            { label: 'Market status', value: overview.status || '—', hint: overview.tradingDate || '' },
                            { label: 'Turnover', value: overview.turnover ? `KES ${fmtNum(Math.round(overview.turnover))}` : '—', hint: 'Total traded value' },
                            { label: 'LUK Composite', value: overview.composite?.value != null ? Number(overview.composite.value).toFixed(2) : '—', hint: fmtPct(overview.composite?.changePct) }
                        ].map((card) => (
                            <div key={card.label} className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{card.label}</p>
                                <p className="text-2xl font-bold text-[#1e293b] mt-1">{card.value}</p>
                                <p className="text-xs text-gray-400 mt-1">{card.hint}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 border-b border-gray-200">
                        {[['issuers', 'Top movers'], ['history', 'Captured history']].map(([key, label]) => (
                            <button
                                key={key}
                                onClick={() => { setView(key); if (key === 'history' && history.length === 0) loadHistory(); }}
                                className={`px-5 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${view === key ? 'border-[#00a84f] text-[#00a84f]' : 'border-transparent text-gray-500 hover:text-[#1e293b]'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {view === 'issuers' ? (
                        <ContentTable
                            columns={columns}
                            rows={issuers}
                            emptyIcon={TrendingUp}
                            emptyTitle="No movers available"
                            emptyHint="The NSE feed did not return data. Try syncing."
                            filters={{ search, onSearch: setSearch, searchPlaceholder: 'Search tickers, issuers, sectors...' }}
                        />
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    <span className="font-bold text-[#1e293b]">{history.length.toLocaleString()}</span> snapshots captured in the last 30 days
                                </p>
                                <button onClick={loadHistory} className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
                                    <RefreshCw size={14} /> Refresh
                                </button>
                            </div>
                            <ContentTable
                                columns={historyColumns}
                                rows={history}
                                loading={historyLoading}
                                emptyTitle="No history yet"
                                emptyHint="Run a sync to start building the composite's history."
                            />
                        </>
                    )}
                </>
            ) : null}
        </div>
    );
};

export default MarketAdmin;