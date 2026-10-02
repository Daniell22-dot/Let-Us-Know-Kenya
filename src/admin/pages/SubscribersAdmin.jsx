import React, { useEffect, useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { ConfirmDialog } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const SubscribersAdmin = () => {
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.getSubscribers();
                if (!cancelled) setSubscribers(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching subscribers:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // The search box filters the visible set; keeping that client-side avoids a
    // round-trip per keystroke against Neon.
    const handleDelete = async (subscriber) => {
        setDeleting(true);
        try {
            await api.deleteSubscriber(subscriber.id);
            setSubscribers((prev) => prev.filter((s) => s.id !== subscriber.id));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'email',
            header: 'Email',
            render: (row) => <span className="font-semibold text-[#1e293b]">{row.email}</span>
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (row) => (
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                    row.isActive === false
                        ? 'bg-gray-100 text-gray-600 border-gray-200'
                        : 'bg-[#00a84f]/10 text-[#00a84f] border-[#00a84f]/20'
                }`}>
                    {row.isActive === false ? 'inactive' : 'active'}
                </span>
            )
        },
        {
            key: 'createdAt',
            header: 'Subscribed',
            render: (row) => (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Newsletter Subscribers"
                description="People who signed up for the newsletter."
                count={subscribers.length}
            />
            <ContentTable
                columns={columns}
                rows={subscribers}
                loading={loading}
                emptyIcon={Mail}
                emptyTitle="No subscribers yet"
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search by email...'
                }}
                actions={{ onDelete: (row) => setDeleteTarget(row) }}
            />
            <ConfirmDialog
                open={!!deleteTarget}
                title="Remove subscriber"
                message={`${deleteTarget?.email || 'This address'} will be removed from the mailing list.`}
                confirmLabel="Remove"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                busy={deleting}
            />
        </div>
    );
};

export default SubscribersAdmin;