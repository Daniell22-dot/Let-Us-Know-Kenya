import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';

/**
 * Page title block used at the top of every admin section.
 * Keeps the heading, description and primary action aligned identically.
 */
export const PageHeader = ({ title, description, count, children }) => (
    <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-[#1e293b] flex items-center gap-3">
                {title}
                {count !== undefined && count !== null && (
                    <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {count.toLocaleString()}
                    </span>
                )}
            </h2>
            {description && <p className="text-sm text-gray-600 mt-1 max-w-2xl">{description}</p>}
        </div>
        {children}
    </div>
);

/** Primary "add" button used in page headers. */
export const AddButton = ({ onClick, children = 'Add' }) => (
    <button
        onClick={onClick}
        className="bg-[#00a84f] text-white px-5 py-3 rounded-lg font-bold hover:bg-[#009540] hover:shadow-lg transition-all"
    >
        {children}
    </button>
);

/** Labelled input/select/textarea pair. */
export const Field = ({ label, required, hint, children, className = '' }) => (
    <div className={className}>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        {children}
        {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
);

const controlClass =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00a84f]';

export const Input = (props) => <input {...props} className={`${controlClass} ${props.className || ''}`} />;
export const Textarea = (props) => <textarea {...props} className={`${controlClass} resize-y ${props.className || ''}`} />;
export const Select = ({ children, ...props }) => (
    <select {...props} className={`${controlClass} bg-white ${props.className || ''}`}>
        {children}
    </select>
);

/**
 * Modal wrapper with a sticky header and footer. Body content is supplied by the
 * caller as a <form> so each page keeps control of its own fields.
 */
export const AdminModal = ({ open, title, onClose, children, onSubmit, saving, submitLabel = 'Save', width = 'max-w-2xl', error }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
            <div className={`bg-white rounded-xl shadow-2xl w-full ${width} my-8`}>
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-xl z-10">
                    <h3 className="text-lg font-bold text-[#1e293b]">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Close">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="p-6 space-y-4">{children}</div>
                    {error && <p className="px-6 pb-2 text-sm text-red-600">{error}</p>}
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#00a84f] text-white rounded-lg text-sm font-semibold hover:bg-[#009540] flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {saving ? 'Saving...' : submitLabel}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/** Small inline stat used on detail panels. */
export const Detail = ({ label, children }) => (
    <div>
        <dt className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">{label}</dt>
        <dd className="text-sm text-gray-800 mt-0.5">{children || '—'}</dd>
    </div>
);
