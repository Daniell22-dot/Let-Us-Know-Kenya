import React, { useMemo, useState } from 'react';
import {
    Search, ChevronLeft, ChevronRight, Inbox, Pencil, Trash2,
    Eye, Check, X, AlertTriangle
} from 'lucide-react';

/**
 * Shared table used by every admin list page.
 *
 * Every admin page was hand-rolling the same search box, status badge, delete
 * confirmation and empty state. With the resources dataset at 1,368 rows a plain
 * list is unusable, so search and client-side pagination live here and every page
 * gets them for free.
 *
 * Paging is done in the browser on purpose. The public endpoints return the whole
 * collection, and adding server-side pagination to each controller is a larger
 * change. This keeps the admin usable today; the table renders at most one page
 * of rows regardless of collection size.
 */

const STATUS_STYLES = {
    published: 'bg-[#00a84f]/10 text-[#00a84f] border-[#00a84f]/20',
    approved: 'bg-[#00a84f]/10 text-[#00a84f] border-[#00a84f]/20',
    active: 'bg-[#00a84f]/10 text-[#00a84f] border-[#00a84f]/20',
    draft: 'bg-gray-100 text-gray-600 border-gray-200',
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    rejected: 'bg-red-100 text-red-600 border-red-200',
    admin: 'bg-[#1e293b]/10 text-[#1e293b] border-[#1e293b]/20',
    user: 'bg-gray-100 text-gray-600 border-gray-200',
    featured: 'bg-[#c41e3a]/10 text-[#c41e3a] border-[#c41e3a]/20'
};

export const StatusBadge = ({ value, label }) => {
    if (value === null || value === undefined || value === '') return null;
    const key = String(value).toLowerCase().replace(/\s+/g, '-');
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${STATUS_STYLES[key] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
            {label || String(value).replace(/_/g, ' ')}
        </span>
    );
};

export const EmptyState = ({ icon: Icon = Inbox, title, hint }) => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-14 h-14 bg-[#00a84f]/10 rounded-full flex items-center justify-center mb-4">
            <Icon size={26} className="text-[#00a84f]" />
        </div>
        <p className="font-bold text-[#1e293b]">{title}</p>
        {hint && <p className="text-sm text-gray-500 mt-1 max-w-md">{hint}</p>}
    </div>
);

export const ConfirmDialog = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel, busy }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                <div className="flex items-start gap-3 mb-5">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#1e293b]">{title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{message}</p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 disabled:opacity-60"
                    >
                        {busy ? 'Working...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * @param {object[]} columns  { key, header, render?, className?, width? }
 * @param {object[]} rows
 * @param {object}   actions { onEdit, onDelete, onView?, extra?: [{ key, icon, title, onClick }] }
 * @param {object}   filters { search, onSearch, options?: [{key,label,value,onChange}] }
 */
const ContentTable = ({
    columns = [],
    rows = [],
    actions = {},
    filters = {},
    loading = false,
    pageSize = 25,
    rowKey = (row) => row.id,
    emptyIcon,
    emptyTitle = 'Nothing here yet',
    emptyHint,
    onRowClick
}) => {
    const [page, setPage] = useState(1);
    const [pendingDelete, setPendingDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const search = (filters.search || '').trim().toLowerCase();

    const filtered = useMemo(() => {
        if (!search) return rows;
        return rows.filter((row) =>
            columns.some((col) => {
                const value = row[col.key];
                if (value === null || value === undefined) return false;
                if (Array.isArray(value)) return value.join(' ').toLowerCase().includes(search);
                return String(value).toLowerCase().includes(search);
            })
        );
    }, [rows, columns, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const visible = filtered.slice(start, start + pageSize);

    const hasActions = actions.onEdit || actions.onDelete || actions.onView || (actions.extra || []).length > 0;

    // Reset to the first page whenever the result set shrinks under a filter,
    // otherwise a search can land the admin on an empty page 7.
    React.useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    const runDelete = async () => {
        if (!pendingDelete) return;
        setDeleting(true);
        try {
            await actions.onDelete(pendingDelete);
            setPendingDelete(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="space-y-4">
            {(filters.search !== undefined || (filters.options || []).length > 0) && (
                <div className="flex flex-wrap items-center gap-3">
                    {filters.search !== undefined && (
                        <div className="relative flex-1 min-w-[240px]">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                value={filters.search}
                                onChange={(e) => { filters.onSearch(e.target.value); setPage(1); }}
                                placeholder={filters.searchPlaceholder || 'Search...'}
                                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00a84f]"
                            />
                        </div>
                    )}
                    {(filters.options || []).map((opt) => (
                        <select
                            key={opt.key}
                            value={opt.value}
                            onChange={(e) => { opt.onChange(e.target.value); setPage(1); }}
                            className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#00a84f] bg-white"
                        >
                            {opt.options.map((o) => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    ))}
                </div>
            )}

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="h-1 bg-[#00a84f]" />
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50/60">
                    <p className="text-sm text-gray-600">
                        <span className="font-bold text-[#1e293b]">{filtered.length.toLocaleString()}</span>
                        {search ? ` matching "${filters.search}"` : ' record' + (filtered.length === 1 ? '' : 's')}
                        {filtered.length !== rows.length && ` of ${rows.length.toLocaleString()}`}
                    </p>
                    {totalPages > 1 && (
                        <p className="text-xs text-gray-500">
                            Page {safePage} of {totalPages}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="p-14 flex flex-col items-center justify-center gap-3 text-gray-500">
                        <div className="w-8 h-8 border-4 border-gray-200 border-t-[#00a84f] rounded-full animate-spin" />
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : visible.length === 0 ? (
                    <EmptyState
                        icon={emptyIcon}
                        title={search ? 'No records match your search' : emptyTitle}
                        hint={search ? 'Try a different search term or clear the filters.' : emptyHint}
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col.key} className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">
                                            {col.header}
                                        </th>
                                    ))}
                                    {hasActions && (
                                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">
                                            Actions
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {visible.map((row) => {
                                    const key = rowKey(row);
                                    return (
                                        <tr
                                            key={key}
                                            onClick={onRowClick ? () => onRowClick(row) : undefined}
                                            className={`hover:bg-[#00a84f]/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                        >
                                            {columns.map((col) => (
                                                <td key={col.key} className={`px-5 py-3.5 text-sm text-gray-700 ${col.className || ''}`}>
                                                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                                                </td>
                                            ))}
                                            {hasActions && (
                                                <td className="px-5 py-3.5">
                                                    <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                                        {(actions.extra || []).map((item) => (
                                                            <button
                                                                key={item.key}
                                                                onClick={() => item.onClick(row)}
                                                                title={item.title}
                                                                className={`p-2 border rounded-lg transition-all ${item.className || 'border-gray-200 text-gray-400 hover:text-[#00a84f] hover:bg-[#00a84f]/10'}`}
                                                            >
                                                                {item.icon}
                                                            </button>
                                                        ))}
                                                        {actions.onView && (
                                                            <button
                                                                onClick={() => actions.onView(row)}
                                                                title="View"
                                                                className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:text-[#1e293b] hover:bg-gray-100 transition-all"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        )}
                                                        {actions.onEdit && (
                                                            <button
                                                                onClick={() => actions.onEdit(row)}
                                                                title="Edit"
                                                                className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:text-[#00a84f] hover:bg-[#00a84f]/10 transition-all"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>
                                                        )}
                                                        {actions.onDelete && (
                                                            <button
                                                                onClick={() => setPendingDelete(row)}
                                                                title="Delete"
                                                                className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:text-red-500 hover:bg-red-50 transition-all"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-sm text-gray-600 px-2">
                        Page {safePage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="p-2 rounded-lg border border-gray-300 bg-white disabled:opacity-40 hover:bg-gray-50"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            <ConfirmDialog
                open={!!pendingDelete}
                title="Delete record"
                message={`This permanently removes "${pendingDelete ? (pendingDelete.title || pendingDelete.name || pendingDelete.email || 'this record') : ''}". This cannot be undone.`}
                onConfirm={runDelete}
                onCancel={() => setPendingDelete(null)}
                busy={deleting}
            />
        </div>
    );
};

export default ContentTable;