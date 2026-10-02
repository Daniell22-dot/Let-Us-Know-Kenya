import React, { useEffect, useMemo, useState } from 'react';
import { History, RefreshCw } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const ActivityAdmin = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [action, setAction] = useState(ALL);

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getActivity({ limit: 500 });
            setLogs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching activity:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const actions = useMemo(() => {
        const set = new Set();
        logs.forEach((l) => l.action && set.add(l.action));
        return [ALL, ...[...set].sort()];
    }, [logs]);

    const visible = useMemo(
        () => logs.filter((l) => action === ALL || l.action === action),
        [logs, action]
    );

    const columns = [
        {
            key: 'action',
            header: 'Action',
            render: (row) => <span className="font-semibold text-[#1e293b]">{row.action}</span>
        },
        { key: 'details', header: 'Details', render: (row) => (
            <span className="text-gray-600 max-w-sm block truncate">{row.details || '—'}</span>
        ) },
        { key: 'pageUrl', header: 'Page', className: 'text-xs text-gray-500' },
        { key: 'userId', header: 'User', className: 'text-xs text-gray-500' },
        {
            key: 'createdAt',
            header: 'When',
            render: (row) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Activity Log"
                description="Audit trail of actions recorded across the platform."
                count={visible.length}
            >
                <button
                    onClick={load}
                    className="inline-flex items-center gap-2 border border-gray-300 bg-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                    <RefreshCw size={15} /> Refresh
                </button>
            </PageHeader>
            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                pageSize={30}
                emptyIcon={History}
                emptyTitle="No activity recorded"
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search actions, details, pages...',
                    options: [{ key: 'action', value: action, onChange: setAction, options: actions }]
                }}
            />
        </div>
    );
};

export default ActivityAdmin;