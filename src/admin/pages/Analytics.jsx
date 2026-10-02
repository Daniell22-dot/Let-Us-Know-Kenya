import React, { useEffect, useMemo, useState } from 'react';
import {
    BarChart, TrendingUp, Users, MousePointerClick, Info, Loader2
} from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

/**
 * Platform analytics, computed from data the platform actually records.
 *
 * This page previously displayed invented figures -- 45.2K page views, 12.8K
 * visitors, a 4m 32s average session -- alongside a decorative bar chart that
 * had no data behind it. Nothing was wired to any source, so those numbers were
 * fiction presented in an analytics screen.
 *
 * The only real traffic signal available is the activity log, which records a
 * page_view event per route change and click events on interactive elements.
 * Everything below is counted from that log, and where the log has no data the
 * page says so rather than substituting a plausible number.
 *
 * Average session duration is deliberately absent: it cannot be derived from
 * per-page-view events, because the log stores no session identity and no
 * duration. Reporting a guess would repeat the problem this page was rewritten
 * to fix.
 */

const WINDOWS = [
    { days: 7, label: 'Last 7 days' },
    { days: 30, label: 'Last 30 days' },
    { days: 90, label: 'Last 90 days' }
];

const withinWindow = (iso, days) => {
    if (!iso) return false;
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    return new Date(iso).getTime() >= cutoff;
};

const StatCard = ({ label, value, icon: Icon, hint }) => (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <div className="w-10 h-10 bg-[#00a84f]/10 rounded-lg flex items-center justify-center mb-3">
            <Icon size={18} className="text-[#00a84f]" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-[#1e293b] mt-0.5">{value}</p>
        {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
);

const Analytics = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);
    const [error, setError] = useState('');
    const [content, setContent] = useState({ blogs: [], podcasts: [] });

    const load = async () => {
        setLoading(true);
        setError('');
        // The endpoint caps at 1000 rows, which is the most the log will serve.
        const [activity, blogs, podcasts] = await Promise.all([
            api.getActivity({ limit: 1000 }).catch(() => []),
            api.getBlogs().catch(() => []),
            api.getPodcasts().catch(() => [])
        ]);
        setLogs(Array.isArray(activity) ? activity : []);
        setContent({
            blogs: Array.isArray(blogs) ? blogs : [],
            podcasts: Array.isArray(podcasts) ? podcasts : []
        });
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const stats = useMemo(() => {
        const window = logs.filter((l) => withinWindow(l.createdAt, days));
        const views = window.filter((l) => l.action === 'page_view');
        const clicks = window.filter((l) => l.action === 'click');
        // An IP address is the only visitor identifier the log holds.
        const uniqueVisitors = new Set(
            views.map((v) => v.ipAddress).filter(Boolean)
        ).size;

        const byDay = new Map();
        views.forEach((v) => {
            const day = v.createdAt ? v.createdAt.slice(0, 10) : null;
            if (!day) return;
            byDay.set(day, (byDay.get(day) || 0) + 1);
        });

        const byPage = new Map();
        views.forEach((v) => {
            const page = v.pageUrl || '(unknown)';
            byPage.set(page, (byPage.get(page) || 0) + 1);
        });

        return {
            views: views.length,
            clicks: clicks.length,
            uniqueVisitors,
            days: [...byDay.entries()].sort((a, b) => a[0].localeCompare(b[0])),
            topPages: [...byPage.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
            maxDay: Math.max(1, ...byDay.values())
        };
    }, [logs, days]);

    const engagement = useMemo(() => {
        const blogViews = content.blogs.reduce((sum, b) => sum + (b.views ?? 0), 0);
        const upvotes = content.blogs.reduce((sum, b) => sum + (b.upvotes ?? 0), 0);
        const downvotes = content.blogs.reduce((sum, b) => sum + (b.downvotes ?? 0), 0);
        const plays = content.podcasts.reduce((sum, p) => sum + (p.plays ?? 0), 0);
        return { blogViews, upvotes, downvotes, plays };
    }, [content]);

    const pageColumns = [
        { key: 'page', header: 'Page' },
        {
            key: 'count',
            header: 'Views',
            render: (row) => <span className="font-bold text-[#00a84f]">{row.count.toLocaleString()}</span>
        },
        {
            key: 'share',
            header: 'Share',
            render: (row) => (
                <div className="flex items-center gap-2 min-w-[140px]">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#00a84f] rounded-full"
                            style={{ width: `${stats.views ? (row.count / stats.views) * 100 : 0}%` }}
                        />
                    </div>
                    <span className="text-xs text-gray-500 w-10 text-right">
                        {stats.views ? ((row.count / stats.views) * 100).toFixed(1) : 0}%
                    </span>
                </div>
            )
        }
    ];

    const peak = stats.maxDay;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Platform Analytics"
                description="Traffic counted from the activity log, which records a page view on every route change."
                count={logs.length}
            >
                <select
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-[#00a84f]"
                >
                    {WINDOWS.map((w) => (
                        <option key={w.days} value={w.days}>{w.label}</option>
                    ))}
                </select>
            </PageHeader>

            {error && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
            )}

            {loading ? (
                <div className="h-40 flex items-center justify-center text-gray-400">
                    <Loader2 className="animate-spin" size={28} />
                </div>
            ) : (
                <>
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
                        <Info size={16} className="mt-0.5 shrink-0" />
                        <p>
                            Every figure below is counted from recorded activity. Average session duration is not
                            shown because the log stores no session identity or duration, so it cannot be measured
                            honestly.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <StatCard label="Page views" value={stats.views.toLocaleString()} icon={TrendingUp} hint={`Last ${days} days`} />
                        <StatCard label="Unique visitors" value={stats.uniqueVisitors.toLocaleString()} icon={Users} hint="Distinct IP addresses" />
                        <StatCard label="Interactions" value={stats.clicks.toLocaleString()} icon={MousePointerClick} hint="Logged clicks" />
                        <StatCard label="Podcast plays" value={engagement.plays.toLocaleString()} icon={BarChart} hint="All time" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <StatCard label="Article views" value={engagement.blogViews.toLocaleString()} icon={TrendingUp} hint="All time" />
                        <StatCard label="Article upvotes" value={engagement.upvotes.toLocaleString()} icon={Users} hint="All time" />
                        <StatCard label="Article downvotes" value={engagement.downvotes.toLocaleString()} icon={Users} hint="All time" />
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <h3 className="font-bold text-[#1e293b] mb-1">Daily page views</h3>
                        <p className="text-sm text-gray-500 mb-5">Last {days} days</p>

                        {stats.days.length === 0 ? (
                            <p className="text-sm text-gray-500 py-8 text-center">
                                No page views have been recorded in this period yet.
                            </p>
                        ) : (
                            <div className="flex items-end gap-1.5 h-40">
                                {stats.days.map(([day, count]) => (
                                    <div key={day} className="flex-1 flex flex-col items-center gap-1 group min-w-[3px]">
                                        <div
                                            className="w-full bg-[#00a84f] rounded-t hover:bg-[#009540] transition-colors"
                                            style={{ height: `${Math.max(3, (count / peak) * 100)}%` }}
                                            title={`${day}: ${count} view${count === 1 ? '' : 's'}`}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="font-bold text-[#1e293b] mb-3">Most visited pages</h3>
                        <ContentTable
                            columns={pageColumns}
                            rows={stats.topPages.map(([page, count]) => ({ page, count }))}
                            rowKey={(row) => row.page}
                            pageSize={10}
                            emptyTitle="No page views recorded"
                            emptyHint="Traffic appears here once visitors browse the public site."
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default Analytics;