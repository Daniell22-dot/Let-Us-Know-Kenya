import React, { useEffect, useMemo, useState } from 'react';
import { Headphones, Play, Star } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge, ConfirmDialog } from '../components/ContentTable';
import { PageHeader, AddButton, AdminModal, Field, Input, Textarea, Select } from '../components/AdminUI';
import { CONTENT_CATEGORIES, buildCategoryOptions } from '../../shared/data/constants';

const STATUSES = ['published', 'draft', 'pending'];

const emptyForm = () => ({
    title: '', host: '', description: '', length: '', category: '',
    audioUrl: '', thumbnail: '', tags: '', status: 'draft', featured: false
});

const toCsv = (tags) => (Array.isArray(tags) ? tags.join(', ') : tags || '');

const PodcastsAdmin = () => {
    const [podcasts, setPodcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('All');
    const [category, setCategory] = useState('All');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.getPodcasts();
                if (!cancelled) setPodcasts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching podcasts:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const categoryOptions = useMemo(
        () => ['All', ...buildCategoryOptions(podcasts.map((p) => p.category), CONTENT_CATEGORIES)],
        [podcasts]
    );

    const visible = useMemo(
        () => podcasts.filter((p) =>
            (status === 'All' || p.status === status) &&
            (category === 'All' || p.category === category)
        ),
        [podcasts, status, category]
    );

    const openNew = () => {
        setEditing(null);
        setForm(emptyForm());
        setError('');
        setModalOpen(true);
    };

    const openEdit = (podcast) => {
        setEditing(podcast);
        setForm({
            title: podcast.title || '',
            host: podcast.host || '',
            description: podcast.description || '',
            length: podcast.length || '',
            category: podcast.category || '',
            audioUrl: podcast.audioUrl || '',
            thumbnail: podcast.thumbnail || '',
            tags: toCsv(podcast.tags),
            status: podcast.status || 'draft',
            featured: !!podcast.featured
        });
        setError('');
        setModalOpen(true);
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Title is required.'); return; }
        if (!form.host.trim()) { setError('Host is required.'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
            };
            if (editing) {
                const updated = await api.updatePodcast(editing.id, payload);
                setPodcasts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)));
            } else {
                const created = await api.createPodcast(payload);
                setPodcasts((prev) => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (err) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleFeatured = async (podcast) => {
        const next = !podcast.featured;
        setPodcasts((prev) => prev.map((p) => (p.id === podcast.id ? { ...p, featured: next } : p)));
        try {
            await api.updatePodcast(podcast.id, { featured: next });
        } catch (err) {
            setPodcasts((prev) => prev.map((p) => (p.id === podcast.id ? { ...p, featured: !next } : p)));
            setError(err.message || 'Could not update the featured flag.');
        }
    };

    const handleDelete = async (podcast) => {
        setDeleting(true);
        try {
            await api.deletePodcast(podcast.id);
            setPodcasts((prev) => prev.filter((p) => p.id !== podcast.id));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'title',
            header: 'Episode',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        {row.thumbnail ? (
                            <img src={row.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#00a84f]/10 flex items-center justify-center">
                                <Headphones size={16} className="text-[#00a84f]" />
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#00a84f] rounded-full flex items-center justify-center">
                            <Play size={8} className="text-white" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#1e293b]">{row.title}</span>
                        {row.featured && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c41e3a] bg-[#c41e3a]/10 px-2 py-0.5 rounded-full">
                                <Star size={11} fill="currentColor" /> Featured
                            </span>
                        )}
                    </div>
                </div>
            )
        },
        { key: 'host', header: 'Host', className: 'text-gray-600' },
        { key: 'category', header: 'Category', render: (row) => <StatusBadge value={row.category} /> },
        {
            key: 'plays',
            header: 'Plays',
            render: (row) => <span className="font-semibold text-[#00a84f]">{(row.plays ?? 0).toLocaleString()}</span>
        },
        { key: 'length', header: 'Length', className: 'text-gray-600' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Podcasts"
                description="Episodes available in the podcast player, with play counts."
                count={visible.length}
            >
                <AddButton onClick={openNew}>New Podcast</AddButton>
            </PageHeader>

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={Headphones}
                emptyTitle="No podcasts yet"
                emptyHint="Add an episode to get started."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search episodes, hosts, descriptions...',
                    options: [
                        { key: 'status', value: status, onChange: setStatus, options: ['All', ...STATUSES] },
                        { key: 'category', value: category, onChange: setCategory, options: categoryOptions }
                    ]
                }}
                actions={{
                    onEdit: openEdit,
                    onDelete: setDeleteTarget,
                    extra: [
                        {
                            key: 'featured',
                            title: (p) => (p.featured ? 'Remove from featured' : 'Mark as featured'),
                            icon: <Star size={16} />,
                            className: 'border-gray-200 text-gray-400 hover:text-[#c41e3a] hover:bg-[#c41e3a]/10',
                            onClick: toggleFeatured
                        }
                    ]
                }}
            />

            <AdminModal
                open={modalOpen}
                title={editing ? 'Edit Podcast' : 'New Podcast'}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                saving={saving}
                submitLabel={editing ? 'Update Podcast' : 'Create Podcast'}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Title" required className="md:col-span-2">
                        <Input {...set('title')} value={form.title} placeholder="Podcast title" />
                    </Field>

                    <Field label="Host" required>
                        <Input {...set('host')} value={form.host} placeholder="Host name" />
                    </Field>

                    <Field label="Category">
                        <Select {...set('category')} value={form.category}>
                            <option value="">Select category</option>
                            {categoryOptions.filter((c) => c !== 'All').map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Duration">
                        <Input {...set('length')} value={form.length} placeholder="e.g. 45 min" />
                    </Field>

                    <Field label="Status" hint="Only published episodes appear publicly.">
                        <Select {...set('status')} value={form.status}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>

                    <Field label="Audio URL" className="md:col-span-2">
                        <Input {...set('audioUrl')} value={form.audioUrl} placeholder="https://..." />
                    </Field>

                    <Field label="Thumbnail URL" className="md:col-span-2">
                        <Input {...set('thumbnail')} value={form.thumbnail} placeholder="https://..." />
                    </Field>

                    <Field label="Tags" hint="Comma separated." className="md:col-span-2">
                        <Input {...set('tags')} value={form.tags} placeholder="kenya, business, technology" />
                    </Field>

                    <Field label="Description" className="md:col-span-2">
                        <Textarea {...set('description')} value={form.description} rows={4} placeholder="Episode description..." />
                    </Field>

                    <div className="md:col-span-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="podcast-featured"
                            checked={form.featured}
                            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                            className="accent-[#00a84f]"
                        />
                        <label htmlFor="podcast-featured" className="text-sm text-gray-700">Featured episode</label>
                    </div>
                </div>
            </AdminModal>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete podcast"
                message={`This permanently removes "${deleteTarget?.title || ''}".`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                busy={deleting}
            />
        </div>
    );
};

export default PodcastsAdmin;