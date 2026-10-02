import React, { useEffect, useMemo, useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge, ConfirmDialog } from '../components/ContentTable';
import { PageHeader, AddButton, AdminModal, Field, Input, Textarea, Select } from '../components/AdminUI';

/**
 * Research projects.
 *
 * This is the only page that manages the Project model. A second "Projects"
 * page previously existed and edited the same table with fields the model does
 * not have, which meant two different shapes of the same data in the admin.
 */
const CATEGORIES = ['Spatial Ecology', 'Biodiversity', 'Climate Change', 'Urban Planning', 'Agriculture'];
const STATUSES = ['published', 'draft', 'pending'];

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
    title: '', category: CATEGORIES[0], abstract: '', authors: '',
    datePublished: today(), thumbnail: '', documentUrl: '', status: 'published'
});

const ResearchAdmin = () => {
    const [projects, setProjects] = useState([]);
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

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getProjects();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error fetching projects:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    // Any category already stored is offered too, so an older record can still
    // be filtered and kept rather than being invisible.
    const categoryOptions = useMemo(() => {
        const set = new Set(CATEGORIES);
        projects.forEach((p) => p.category && set.add(p.category));
        return ['All', ...[...set].sort()];
    }, [projects]);

    const visible = useMemo(
        () => projects.filter((p) =>
            (status === 'All' || p.status === status) &&
            (category === 'All' || p.category === category)
        ),
        [projects, status, category]
    );

    const openNew = () => {
        setEditing(null);
        setForm(emptyForm());
        setError('');
        setModalOpen(true);
    };

    const openEdit = (project) => {
        setEditing(project);
        setForm({
            title: project.title || '',
            category: project.category || CATEGORIES[0],
            abstract: project.abstract || '',
            authors: project.authors || '',
            datePublished: project.datePublished
                ? new Date(project.datePublished).toISOString().slice(0, 10)
                : today(),
            thumbnail: project.thumbnail || '',
            documentUrl: project.documentUrl || '',
            status: project.status || 'published'
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
            if (editing) {
                const updated = await api.updateProject(editing.id, form);
                setProjects((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...updated } : p)));
            } else {
                const created = await api.createProject(form);
                setProjects((prev) => [created, ...prev]);
            }
            setModalOpen(false);
        } catch (err) {
            setError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (project) => {
        setDeleting(true);
        try {
            await api.deleteProject(project.id);
            setProjects((prev) => prev.filter((p) => p.id !== project.id));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'title',
            header: 'Project',
            render: (row) => (
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded bg-[#00a84f]/10 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-[#00a84f]" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-[#1e293b]">{row.title}</p>
                        {row.abstract && <p className="text-xs text-gray-500 truncate max-w-sm">{row.abstract}</p>}
                    </div>
                </div>
            )
        },
        { key: 'category', header: 'Category', render: (row) => <StatusBadge value={row.category} /> },
        { key: 'authors', header: 'Authors', className: 'text-gray-600' },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        {
            key: 'datePublished',
            header: 'Published',
            render: (row) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {row.datePublished ? new Date(row.datePublished).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Research Projects"
                description="Academic and field research publications shown on the Research page."
                count={visible.length}
            >
                <AddButton onClick={openNew}>Add Project</AddButton>
            </PageHeader>

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={FileText}
                emptyTitle="No research projects yet"
                emptyHint="Add the first study to publish it on the Research page."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search titles, authors, abstracts...',
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
                            key: 'doc',
                            title: (p) => (p.documentUrl ? 'Open document' : 'No document uploaded'),
                            icon: <ExternalLink size={16} />,
                            className: 'border-gray-200 text-gray-400 hover:text-[#1e293b] hover:bg-gray-100',
                            onClick: (p) => {
                                if (p.documentUrl) window.open(p.documentUrl, '_blank', 'noopener,noreferrer');
                            }
                        }
                    ]
                }}
            />

            <AdminModal
                open={modalOpen}
                title={editing ? 'Edit Research Project' : 'New Research Project'}
                onClose={() => setModalOpen(false)}
                onSubmit={handleSave}
                saving={saving}
                submitLabel={editing ? 'Update Project' : 'Save Project'}
                error={error}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Project title" required className="md:col-span-2">
                        <Input {...set('title')} value={form.title} placeholder="e.g. Kenya Butterfly Urban Adaptation Study" />
                    </Field>

                    <Field label="Category">
                        <Select {...set('category')} value={form.category}>
                            {categoryOptions.filter((c) => c !== 'All').map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Authors">
                        <Input {...set('authors')} value={form.authors} placeholder="e.g. Jane Doe, John Smith" />
                    </Field>

                    <Field label="Date published">
                        <Input type="date" {...set('datePublished')} value={form.datePublished} />
                    </Field>

                    <Field label="Status" hint="Only published projects appear publicly.">
                        <Select {...set('status')} value={form.status}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                    </Field>

                    <Field label="Thumbnail URL" className="md:col-span-2">
                        <Input {...set('thumbnail')} value={form.thumbnail} placeholder="https://example.com/image.jpg" />
                    </Field>

                    <Field label="Document URL" className="md:col-span-2">
                        <Input {...set('documentUrl')} value={form.documentUrl} placeholder="https://example.com/study.pdf" />
                    </Field>

                    <Field label="Abstract / summary" required className="md:col-span-2">
                        <Textarea {...set('abstract')} value={form.abstract} rows={5} placeholder="Methodology and findings..." />
                    </Field>
                </div>
            </AdminModal>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete research project"
                message={`This permanently removes "${deleteTarget?.title || ''}".`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                busy={deleting}
            />
        </div>
    );
};

export default ResearchAdmin;