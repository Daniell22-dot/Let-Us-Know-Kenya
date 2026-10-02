import React, { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { ConfirmDialog } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const ReviewsAdmin = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [entity, setEntity] = useState(ALL);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [notice, setNotice] = useState('');

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.getReviews();
                if (!cancelled) setReviews(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const entities = useMemo(() => {
        const set = new Set();
        reviews.forEach((r) => r.entityType && set.add(r.entityType));
        return [ALL, ...[...set].sort()];
    }, [reviews]);

    const visible = useMemo(
        () => reviews.filter((r) => entity === ALL || r.entityType === entity),
        [reviews, entity]
    );

    const handleDelete = async (review) => {
        setDeleting(true);
        try {
            await api.deleteReview(review.id);
            setReviews((prev) => prev.filter((r) => r.id !== review.id));
            setDeleteTarget(null);
        } catch (err) {
            setNotice(err.message || 'Failed to delete that review.');
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'comment',
            header: 'Review',
            render: (row) => (
                <span className="text-gray-700 max-w-md block truncate">{row.comment || row.text || '—'}</span>
            )
        },
        {
            key: 'rating',
            header: 'Rating',
            render: (row) => (
                <span className="inline-flex items-center gap-1 text-[#c41e3a] font-bold">
                    <Star size={13} fill="currentColor" />
                    {row.rating ?? '—'}
                </span>
            )
        },
        {
            key: 'entityType',
            header: 'Applies to',
            render: (row) => <span className="text-xs font-semibold text-gray-500">{row.entityType || '—'}</span>
        },
        {
            key: 'author',
            header: 'By',
            render: (row) => row.author || 'Anonymous'
        },
        {
            key: 'createdAt',
            header: 'Posted',
            render: (row) => (
                <span className="text-xs text-gray-400">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Reviews"
                description="User-submitted reviews. Removing one deletes it from the public site."
                count={visible.length}
            />

            {notice && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{notice}</div>
            )}

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={Star}
                emptyTitle="No reviews yet"
                emptyHint="Reviews left by visitors will appear here for moderation."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search reviews...',
                    options: [{ key: 'entity', value: entity, onChange: setEntity, options: entities }]
                }}
                actions={{ onDelete: (row) => setDeleteTarget(row) }}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete review"
                message="This permanently removes the review from the platform."
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                busy={deleting}
            />
        </div>
    );
};

export default ReviewsAdmin;