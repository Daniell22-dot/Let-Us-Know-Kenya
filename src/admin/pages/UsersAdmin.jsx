import React, { useEffect, useMemo, useState } from 'react';
import { Users, ShieldCheck, ShieldOff, Info } from 'lucide-react';
import api from '../../shared/services/api';
import ContentTable, { StatusBadge, ConfirmDialog } from '../components/ContentTable';
import { PageHeader } from '../components/AdminUI';

const ALL = 'All';

const UsersAdmin = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState(ALL);
    const [roleTarget, setRoleTarget] = useState(null);
    const [notice, setNotice] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching users:', error);
            setNotice(error.message || 'Could not load users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const visible = useMemo(
        () => users.filter((u) => role === ALL || u.role === role),
        [users, role]
    );

    const changeRole = async (user) => {
        const next = user.role === 'admin' ? 'user' : 'admin';
        try {
            await api.updateUserRole(user.id, next);
            setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: next } : u)));
            setNotice(`${user.email} is now ${next === 'admin' ? 'an admin' : 'a standard user'}.`);
        } catch (err) {
            setNotice(err.message || 'Could not change that role.');
        } finally {
            setRoleTarget(null);
        }
    };

    const columns = [
        {
            key: 'email',
            header: 'Account',
            render: (row) => (
                <div>
                    <p className="font-semibold text-[#1e293b]">{row.name || row.username || row.email}</p>
                    <p className="text-xs text-gray-500">{row.email}</p>
                </div>
            )
        },
        { key: 'username', header: 'Username', className: 'text-gray-600' },
        { key: 'role', header: 'Role', render: (row) => <StatusBadge value={row.role} /> },
        {
            key: 'createdAt',
            header: 'Joined',
            render: (row) => (
                <span className="text-xs text-gray-400">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                </span>
            )
        }
    ];

    const adminCount = users.filter((u) => u.role === 'admin').length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Users"
                description="Every registered account. Admins can review or revoke admin access."
                count={visible.length}
            />

            {notice && (
                <div className="flex items-start gap-2 rounded-lg border border-[#00a84f]/30 bg-[#00a84f]/5 px-4 py-3 text-sm text-[#1e293b]">
                    <Info size={16} className="mt-0.5 shrink-0 text-[#00a84f]" />
                    <p>{notice}</p>
                </div>
            )}

            <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck size={16} className="text-[#00a84f]" />
                <span><span className="font-bold text-[#1e293b]">{adminCount}</span> administrator{adminCount === 1 ? '' : 's'} of {users.length} account{users.length === 1 ? '' : 's'}</span>
            </div>

            <ContentTable
                columns={columns}
                rows={visible}
                loading={loading}
                emptyIcon={Users}
                emptyTitle="No registered users"
                filters={{
                    search,
                    onSearch: setSearch,
                    searchPlaceholder: 'Search by name, username or email...',
                    options: [{ key: 'role', value: role, onChange: setRole, options: [ALL, 'admin', 'user'] }]
                }}
                actions={{
                    extra: [
                        {
                            key: 'role',
                            title: (u) => (u.role === 'admin' ? 'Revoke admin access' : 'Grant admin access'),
                            icon: (u) => (u.role === 'admin'
                                ? <ShieldOff size={16} />
                                : <ShieldCheck size={16} />),
                            className: 'border-gray-200 text-gray-400 hover:text-[#1e293b] hover:bg-gray-100',
                            onClick: (row) => setRoleTarget(row)
                        }
                    ]
                }}
            />

            <ConfirmDialog
                open={!!roleTarget}
                title={roleTarget?.role === 'admin' ? 'Revoke admin access' : 'Grant admin access'}
                message={
                    roleTarget?.role === 'admin'
                        ? `${roleTarget?.email} will no longer be able to access the admin dashboard.`
                        : `${roleTarget?.email} will be able to edit and delete all content.`
                }
                confirmLabel={roleTarget?.role === 'admin' ? 'Revoke' : 'Grant'}
                onConfirm={changeRole}
                onCancel={() => setRoleTarget(null)}
            />
        </div>
    );
};

export default UsersAdmin;