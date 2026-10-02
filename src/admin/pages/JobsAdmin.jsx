import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Building, MapPin, Users } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const JobsAdmin = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState(ALL);
    const [status, setStatus] = useState(ALL);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await api.getJobs();
                if (!cancelled) setJobs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching jobs:', error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const types = useMemo(() => {
        const set = new Set();
        jobs.forEach((j) => j.type && set.add(j.type));
        return [ALL, ...[...set].sort()];
    }, [jobs]);

    const statuses = useMemo(() => {
        const set = new Set();
        jobs.forEach((j) => j.status && set.add(j.status));
        return [ALL, ...[...set].sort()];
    }, [jobs]);

    const visible = useMemo(
        () => jobs.filter((j) =>
            (type === ALL || j.type === type) &&
            (status === ALL || j.status === status)
        ),
        [jobs, type, status]
    );

    const columns = [
        { key: 'title', header: 'Role', render: (row) => <span className="font-semibold text-[#1e293b]">{row.title}</span> },
        { key: 'company', header: 'Company', render: (row) => (
            <span className="inline-flex items-center gap-1 text-gray-600"><Building size={13} /> {row.company || '—'}</span>
        ) },
        { key: 'category', header: 'Category', render: (row) => <StatusBadge value={row.category} /> },
        { key: 'type', header: 'Type', render: (row) => <StatusBadge value={row.type} /> },
        { key: 'location', header: 'Location', render: (row) => (
            <span className="inline-flex items-center gap-1 text-gray-600"><MapPin size={13} className="text-[#00a84f]" /> {row.location || '—'}</span>
        ) },
        { key: 'salary', header: 'Salary', className: 'text-gray-600' },
        { key: 'applicants', header: 'Applicants', render: (row) => (
            <span className="inline-flex items-center gap-1 text-gray-600">
                <Users size={13} /> {row.applicants ?? 0}
            </span>
        ) },
        { key: 'status', header: 'Status', render: (row) => <StatusBadge value={row.status} /> },
        {
            key: 'posted',
            header: 'Posted',
            render: (row) => (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                    {row.posted ? new Date(row.posted).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Jobs"
                description="Job listings visible on the public Jobs board."
                count={visible.length}
            />
            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={Briefcase}
                emptyTitle="No job listings"
                emptyHint="Job listings will appear here once added."
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search roles, companies, locations...',
                    options: [
                        { key: 'type', value: type, onChange: setType, options: types },
                        { key: 'status', value: status, onChange: setStatus, options: statuses }
                    ]
                }}
            />
        </div>
    );
};

export default JobsAdmin;