import React, { useEffect, useMemo, useState } from 'react';
import { Briefcase, Building, MapPin } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const JobsAdmin = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [type, setType] = useState(ALL);

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
        jobs.forEach((j) => (j.type || j.category) && set.add(j.type || j.category));
        return [ALL, ...[...set].sort()];
    }, [jobs]);

    const visible = useMemo(
        () => jobs.filter((j) => (type === ALL || (j.type || j.category) === type)),
        [jobs, type]
    );

    const columns = [
        { key: 'title', header: 'Title', render: (row) => <span className="font-semibold text-[#1e293b]">{row.title || row.name}</span> },
        { key: 'company', header: 'Company', render: (row) => (
            <span className="inline-flex items-center gap-1 text-gray-600"><Building size={13} /> {row.company || '—'}</span>
        ) },
        { key: 'type', header: 'Type', render: (row) => <StatusBadge value={row.type || row.category} /> },
        { key: 'location', header: 'Location', render: (row) => (
            <span className="inline-flex items-center gap-1 text-gray-600"><MapPin size={13} className="text-[#00a84f]" /> {row.location || '—'}</span>
        ) },
        { key: 'createdAt', header: 'Added', render: (row) => (
            <span className="text-xs text-gray-400">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
            </span>
        ) }
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Jobs"
                description="All job listings visible on the public Jobs board."
                count={visible.length}
            />
            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={Briefcase}
                emptyTitle="No job listings"
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search jobs, companies, locations...',
                    options: [{ key: 'type', value: type, onChange: setType, options: types }]
                }}
            />
        </div>
    );
};

export default JobsAdmin;