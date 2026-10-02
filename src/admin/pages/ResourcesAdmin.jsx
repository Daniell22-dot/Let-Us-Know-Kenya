import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Star, Filter } from 'lucide-react';
import api from '../../shared/services/api';
import { StatusBadge } from '../components/ContentTable';
import ContentTable, { ConfirmDialog } from '../components/ContentTable';
import ResourceForm from '../components/ResourceForm';
import { PageHeader, AddButton } from '../components/AdminUI';
import { RESOURCE_CATEGORIES } from '../../shared/data/constants';
import { countyNames } from '../../shared/data/kenyaCounties';

const ALL = 'All';

const ResourcesAdmin = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [county, setCounty] = useState(ALL);
    const [category, setCategory] = useState(ALL);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [onlyFeatured, setOnlyFeatured] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.getResources();
                if (!cancelled) setResources(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching resources:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    // Derive the filter lists from the data itself. Hardcoding them meant options
    // drifted out of step with what was actually stored.
    const categories = useMemo(() => {
        const set = new Set();
        resources.forEach((r) => r.category && set.add(r.category));
        return [...set].sort();
    }, [resources]);

    const visible = useMemo(() => resources.filter((r) => {
        if (county !== ALL && r.region !== county) return false;
        if (category !== ALL && r.category !== category) return false;
        if (onlyFeatured && !r.featured) return false;
        return true;
    }), [resources, county, category, onlyFeatured]);

    const openNew = () => { setEditing(null); setFormError(''); setFormOpen(true); };
    const openEdit = (resource) => { setEditing(resource); setFormError(''); setFormOpen(true); };

    const handleSave = async (form) => {
        setFormError('');
        if (!form.name || !form.name.trim()) {
            setFormError('Name is required.');
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                const updated = await api.updateResource(editing.id, form);
                setResources((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...updated } : r)));
            } else {
                const created = await api.createResource(form);
                setResources((prev) => [{ ...form, ...created }, ...prev]);
            }
            setFormOpen(false);
        } catch (err) {
            setFormError(err.message || 'Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const toggleFeatured = async (resource) => {
        const next = !resource.featured;
        setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, featured: next } : r)));
        try {
            await api.updateResource(resource.id, { featured: next });
        } catch (err) {
            setResources((prev) => prev.map((r) => (r.id === resource.id ? { ...r, featured: !next } : r)));
            console.error('Failed to update featured flag:', err);
        }
    };

    const handleDelete = async (resource) => {
        setDeleting(true);
        try {
            await api.deleteResource(resource.id);
            setResources((prev) => prev.filter((r) => r.id !== resource.id));
            setDeleteTarget(null);
        } catch (err) {
            console.error('Failed to delete resource:', err);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Resource',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-[#1e293b]">{row.name}</span>
                    {row.featured && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c41e3a] bg-[#c41e3a]/10 px-2 py-0.5 rounded-full">
                            <Star size={11} fill="currentColor" /> Featured
                        </span>
                    )}
                    {row.geonameId && (
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded" title="Generated from an external source">
                            {row.geonameId.startsWith('curated:') ? 'curated' : 'imported'}
                        </span>
                    )}
                </div>
            )
        },
        { key: 'region', header: 'County', render: (row) => (
            <span className="inline-flex items-center gap-1 text-gray-600">
                <MapPin size={13} className="text-[#00a84f]" /> {row.region || '—'}
            </span>
        ) },
        { key: 'category', header: 'Category', render: (row) => <StatusBadge value={row.category} /> },
        { key: 'type', header: 'Type', className: 'text-gray-500' }
    ];

    const validCategories = RESOURCE_CATEGORIES.natural;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Resources"
                description="Every natural resource on the platform, grouped by county. Featured resources are highlighted on the public Resources page."
                count={visible.length}
            >
                <AddButton onClick={openNew}>Add Resource</AddButton>
            </PageHeader>

            {/* Category health: flags imported records sitting outside the taxonomy. */}
            {(() => {
                const stray = categories.filter((c) => !validCategories.includes(c));
                if (stray.length === 0) return null;
                return (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                        <Filter size={16} className="mt-0.5 shrink-0" />
                        <p>
                            <span className="font-semibold">{stray.length} categor{stray.length === 1 ? 'y' : 'ies'} outside the standard taxonomy:</span>{' '}
                            {stray.join(', ')}. These will not appear in the public Resources filters.
                        </p>
                    </div>
                );
            })()}

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                pageSize={25}
                emptyIcon={MapPin}
                emptyTitle="No resources yet"
                emptyHint="Add a resource, or run the seeder to load the Kenya dataset."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search resources, counties, categories...',
                    options: [
                        { key: 'county', value: county, onChange: setCounty, options: [ALL, ...countyNames] },
                        { key: 'category', value: category, onChange: setCategory, options: [ALL, ...categories] }
                    ]
                }}
                actions={{
                    onEdit: openEdit,
                    onDelete: (row) => setDeleteTarget(row),
                    extra: [
                        {
                            key: 'featured',
                            title: resource => (resource.featured ? 'Remove from featured' : 'Mark as featured'),
                            icon: <Star size={16} />,
                            className: 'border-gray-200 text-gray-400 hover:text-[#c41e3a] hover:bg-[#c41e3a]/10',
                            onClick: toggleFeatured
                        }
                    ]
                }}
            />

            <ResourceForm
                open={formOpen}
                resource={editing}
                onClose={() => setFormOpen(false)}
                onSave={handleSave}
                saving={saving}
                error={formError}
            />

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete resource"
                message={`This permanently removes "${deleteTarget?.name || ''}". This cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                busy={deleting}
            />
        </div>
    );
};

export default ResourcesAdmin;