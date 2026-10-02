import React, { useEffect, useMemo, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const ProjectsAdmin = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState(ALL);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.getProjects();
                if (!cancelled) setProjects(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const statuses = useMemo(() => {
        const set = new Set();
        projects.forEach((p) => p.status && set.add(p.status));
        return [ALL, ...[...set].sort()];
    }, [projects]);

    const visible = useMemo(
        () => projects.filter((p) => status === ALL || p.status === status),
        [projects, status]
    );

    const columns = [
        { key: 'title', header: 'Project', render: (row) => <span className="font-semibold text-[#1e293b]">{row.title || row.name}</span> },
        { key: 'category', header: 'Category', render: (row) => <StatusBadge value={row.category} /> },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        { key: 'organization', header: 'Organization', className: 'text-gray-600' },
        { key: 'createdAt', header: 'Added', render: (row) => (
            <span className="text-xs text-gray-400">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
            </span>
        ) }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Projects"
                description="Research and development projects published on the platform."
                count={visible.length}
            />
            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={FolderKanban}
                emptyTitle="No projects"
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search projects...',
                    options: [{ key: 'status', value: status, onChange: setStatus, options: statuses }]
                }}
            />
        </div>
    );
};

export default ProjectsAdmin;