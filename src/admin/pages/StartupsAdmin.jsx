import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Check, X, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge, ConfirmDialog } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const StartupsAdmin = () => {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [busyId, setBusyId] = useState(null);
    const [pendingAction, setPendingAction] = useState(null);
    const [notice, setNotice] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getStartups();
            setStartups(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching startups:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // A submission with no status has never been triaged, so it counts as pending.
    const visible = useMemo(
        () => startups.filter((s) => {
            const current = s.status || 'pending';
            return status === ALL || current === status;
        }),
        [startups, status]
    );

    const pendingCount = startups.filter((s) => !s.status || s.status === 'pending').length;

    const decide = async (startup, action) => {
        setBusyId(startup.id);
        setNotice('');
        try {
            // Use the status the server actually persisted rather than assuming
            // the write succeeded.
            const updated = action === 'approve'
                ? await api.approveStartup(startup.id)
                : await api.rejectStartup(startup.id);
            setStartups((prev) => prev.map((s) => (s.id === startup.id ? { ...s, ...updated } : s)));
        } catch (err) {
            setNotice(err.message || `Could not ${action} that submission.`);
            load();
        } finally {
            setBusyId(null);
            setPendingAction(null);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Startup',
            render: (row) => (
                <div>
                    <p className="font-semibold text-[#1e293b]">{row.name}</p>
                    {row.founder && <p className="text-xs text-gray-500">Founder: {row.founder}</p>}
                </div>
            )
        },
        { key: 'sector', header: 'Sector', render: (row) => <StatusBadge value={row.sector} /> },
        { key: 'stage', header: 'Stage', className: 'text-gray-600' },
        { key: 'location', header: 'Location', className: 'text-gray-600' },
        { key: 'funding', header: 'Funding', render: (row) => (
            <span className="text-gray-700 font-medium">{row.funding || '—'}</span>
        ) },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status || 'pending'} /> },
        {
            key: 'createdAt',
            header: 'Submitted',
            render: (row) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    const actionsFor = (row) => {
        const current = row.status || 'pending';
        const extra = [];
        if (current !== 'approved') {
            extra.push({
                key: 'approve',
                title: 'Approve submission',
                icon: busyId === row.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />,
                className: 'border-[#00a84f]/30 text-[#00a84f] hover:bg-[#00a84f]/10',
                onClick: () => setPendingAction({ row, action: 'approve' })
            });
        }
        if (current !== 'rejected') {
            extra.push({
                key: 'reject',
                title: 'Reject submission',
                icon: busyId === row.id ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />,
                className: 'border-gray-200 text-gray-500 hover:text-red-500 hover:bg-red-50',
                onClick: () => setPendingAction({ row, action: 'reject' })
            });
        }
        if (row.website) {
            extra.push({
                key: 'site',
                title: 'Open website',
                icon: <ExternalLink size={16} />,
                className: 'border-gray-200 text-gray-400 hover:text-[#1e293b] hover:bg-gray-100',
                onClick: () => window.open(row.website, '_blank', 'noopener,noreferrer')
            });
        }
        return { extra };
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Startup Submissions"
                description="Submissions from the public site, awaiting approval before they are listed."
                count={visible.length}
            >
                <div className="flex items-center gap-3">
                    {pendingCount > 0 && (
                        <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                            {pendingCount} pending
                        </span>
                    )}
                    <button
                        onClick={load}
                        className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 text-gray-600"
                    >
                        <RefreshCw size={15} /> Refresh
                    </button>
                </div>
            </PageHeader>

            {notice && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{notice}</div>
            )}

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={Briefcase}
                emptyTitle="No startup submissions"
                emptyHint="Submissions from the public site appear here for approval."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search startups, founders, sectors...',
                    options: [{ key: 'status', value: status, onChange: setStatus, options: [ALL, 'pending', 'approved', 'rejected'] }]
                }}
                actions={actionsFor}
            />

            <ConfirmDialog
                open={!!pendingAction}
                title={pendingAction?.action === 'approve' ? 'Approve startup' : 'Reject startup'}
                message={
                    pendingAction?.action === 'approve'
                        ? `${pendingAction?.row?.name} will be listed publicly on the Startups page.`
                        : `${pendingAction?.row?.name} will not be listed publicly.`
                }
                confirmLabel={pendingAction?.action === 'approve' ? 'Approve' : 'Reject'}
                onConfirm={() => decide(pendingAction.row, pendingAction.action)}
                onCancel={() => setPendingAction(null)}
                busy={busyId !== null}
            />
        </div>
    );
};

export default StartupsAdmin;