import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Star, ThumbsUp, ThumbsDown, Eye } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge, ConfirmDialog } from '../components/ContentTable';
import { PageHeader, AddButton, AdminModal, Field, Input, Textarea, Select } from '../components/AdminUI';
import { CONTENT_CATEGORIES, buildCategoryOptions } from '../../shared/data/constants';

const STATUSES = ['published', 'draft', 'pending'];

const emptyForm = () => ({
    title: '', category: '', author: '', authorRole: '', excerpt: '',
    content: '', readTime: '', image: '', tags: '', status: 'published',
    featured: false, date: new Date().toISOString().slice(0, 10)
});

const toCsv = (tags) => (Array.isArray(tags) ? tags.join(', ') : tags || '');

const BlogAdmin = () => {
    const [posts, setPosts] = useState([]);
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
                const data = await api.getBlogs();
                if (!cancelled) setPosts(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error('Error fetching blog posts:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Categories come from the shared taxonomy plus anything already in use, so
    // the dropdown can never silently omit an existing post's category.
    const categoryOptions = useMemo(
        () => ['All', ...buildCategoryOptions(posts.map((p) => p.category), CONTENT_CATEGORIES)],
        [posts]
    );

    const visible = useMemo(
        () => posts.filter((p) =>
            (status === 'All' || p.status === status) &&
            (category === 'All' || p.category === category)
        ),
        [posts, status, category]
    );

    const openNew = () => {
        setEditing(null);
        setForm(emptyForm());
        setError('');
        setModalOpen(true);
    };

    const openEdit = (post) => {
        setEditing(post);
        setForm({
            title: post.title || '',
            category: post.category || '',
            author: post.author || '',
            authorRole: post.authorRole || '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            readTime: post.readTime || '',
            image: post.image || '',
            tags: toCsv(post.tags),
            status: post.status || 'published',
            featured: !!post.featured,
            date: post.date || new Date().toISOString().slice(0, 10)
        });
        setError('');
        setModalOpen(true);
    };

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.title.trim()) { setError('Title is required.'); return; }
        setSaving(true);
        try {
            const payload = {
                ...form,
                tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
            };
            if (editing) {
                const updated = await api.updateBlog(editing.id, payload);
                setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)));
            } else {
                const created = await api.createBlog(payload);
                setPosts((prev) => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (err) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleFeatured = async (post) => {
        const next = !post.featured;
        setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, featured: next } : p)));
        try {
            await api.updateBlog(post.id, { featured: next });
        } catch (err) {
            setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, featured: !next } : p)));
            setError(err.message || 'Could not update the featured flag.');
        }
    };

    const handleDelete = async (post) => {
        setDeleting(true);
        try {
            await api.deleteBlog(post.id);
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'title',
            header: 'Post',
            render: (row) => (
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#1e293b]">{row.title}</span>
                    {row.featured && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c41e3a] bg-[#c41e3a]/10 px-2 py-0.5 rounded-full">
                            <Star size={11} fill="currentColor" /> Featured
                        </span>
                    )}
                </div>
            )
        },
        { key: 'category', header: 'Category', render: (row) => <StatusBadge value={row.category} /> },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        {
            key: 'author',
            header: 'Author',
            render: (row) => (
                <div>
                    <p className="text-gray-700">{row.author || '—'}</p>
                    {row.authorRole && <p className="text-xs text-gray-400">{row.authorRole}</p>}
                </div>
            )
        },
        {
            key: 'views',
            header: 'Engagement',
            render: (row) => (
                <div className="flex items-center gap-3 text-xs text-gray-500 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1" title="Views">
                        <Eye size={13} /> {(row.views ?? 0).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#00a84f]" title="Upvotes">
                        <ThumbsUp size={13} /> {row.upvotes ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[#c41e3a]" title="Downvotes">
                        <ThumbsDown size={13} /> {row.downvotes ?? 0}
                    </span>
                </div>
            )
        },
        {
            key: 'date',
            header: 'Date',
            render: (row) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {row.date ? new Date(row.date).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Blog Posts"
                description="Every article on the platform, with its votes and views."
                count={visible.length}
            >
                <AddButton onClick={openNew}>New Post</AddButton>
            </PageHeader>

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={BookOpen}
                emptyTitle="No blog posts yet"
                emptyHint="Create the first article to get started."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search titles, authors, content...',
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
                title={editing ? 'Edit Blog Post' : 'New Blog Post'}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                saving={saving}
                submitLabel={editing ? 'Update Post' : 'Create Post'}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Title" required className="md:col-span-2">
                        <Input {...set('title')} value={form.title} placeholder="Post title" />
                    </Field>

                    <Field label="Category">
                        <Select {...set('category')} value={form.category}>
                            <option value="">Select category</option>
                            {categoryOptions.filter((c) => c !== 'All').map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Status" hint="Only published posts appear on the public site.">
                        <Select {...set('status')} value={form.status}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>

                    <Field label="Author">
                        <Input {...set('author')} value={form.author} placeholder="Author name" />
                    </Field>

                    <Field label="Author role">
                        <Input {...set('authorRole')} value={form.authorRole} placeholder="e.g. Senior Writer" />
                    </Field>

                    <Field label="Read time">
                        <Input {...set('readTime')} value={form.readTime} placeholder="e.g. 5 min read" />
                    </Field>

                    <Field label="Publish date">
                        <Input type="date" {...set('date')} value={form.date} />
                    </Field>

                    <Field label="Image URL" className="md:col-span-2">
                        <Input {...set('image')} value={form.image} placeholder="https://..." />
                    </Field>

                    <Field label="Tags" hint="Comma separated." className="md:col-span-2">
                        <Input {...set('tags')} value={form.tags} placeholder="kenya, technology, innovation" />
                    </Field>

                    <Field label="Excerpt" className="md:col-span-2">
                        <Textarea {...set('excerpt')} value={form.excerpt} rows={2} placeholder="Brief summary..." />
                    </Field>

                    <Field label="Content" className="md:col-span-2">
                        <Textarea {...set('content')} value={form.content} rows={8} placeholder="Full article content..." />
                    </Field>

                    <div className="md:col-span-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="blog-featured"
                            checked={form.featured}
                            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
                            className="accent-[#00a84f]"
                        />
                        <label htmlFor="blog-featured" className="text-sm text-gray-700">Featured post</label>
                    </div>
                </div>
            </AdminModal>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete blog post"
                message={`This permanently removes "${deleteTarget?.title || ''}" and its votes.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                busy={deleting}
            />
        </div>
    );
};

export default BlogAdmin;