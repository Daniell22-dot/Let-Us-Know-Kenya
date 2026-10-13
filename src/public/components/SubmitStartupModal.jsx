import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Rocket, Building2, Globe, TrendingUp, Info, CheckCircle2, Loader2, LogIn } from 'lucide-react';
import api from '../../shared/services/api';
import { requestSignIn } from './RequireAuth';

const EMPTY_FORM = {
    name: '',
    industry: '',
    fundingStage: 'Pre-seed',
    description: '',
    websiteUrl: '',
    logo: '',
};

/**
 * Startup submission dialog.
 *
 * Two problems this had to resolve:
 *
 * 1. The panel used `overflow-hidden` with no maximum height, inside an overlay
 *    that centred its content with flexbox and could not scroll. On a short
 *    viewport the form is taller than the window, so flex centring pushed the
 *    top of the dialog above the fold where a fixed overlay cannot be scrolled
 *    to. The heading and first fields were effectively unreachable, and the
 *    dialog appeared to "only show once you scrolled". The overlay now scrolls
 *    and the panel has a bounded height with its own scroll area.
 *
 * 2. It rendered inside the page section that contains the trigger. Portalling
 *    to document.body guarantees it is positioned against the viewport and
 *    cannot be caught by an ancestor's stacking or overflow context.
 */
const SubmitStartupModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState(null);
    const [sessionExpired, setSessionExpired] = useState(false);
    const nameRef = useRef(null);

    // Stop the page behind scrolling while the dialog is open, and restore the
    // original position rather than resetting to the top on close.
    useEffect(() => {
        if (!isOpen) return undefined;

        const { body } = document;
        const previousOverflow = body.style.overflow;
        const previousPadding = body.style.paddingRight;

        // Compensate for the removed scrollbar so the layout does not jump.
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

        return () => {
            body.style.overflow = previousOverflow;
            body.style.paddingRight = previousPadding;
        };
    }, [isOpen]);

    // Escape closes, and focus lands in the first field so keyboard and screen
    // reader users are not left behind on the page underneath.
    useEffect(() => {
        if (!isOpen) return undefined;

        const onKeyDown = (event) => {
            if (event.key === 'Escape') onClose?.();
        };
        document.addEventListener('keydown', onKeyDown);
        nameRef.current?.focus();

        return () => document.removeEventListener('keydown', onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleChange = (field) => (event) =>
        setFormData((prev) => ({ ...prev, [field]: event.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);
        setSessionExpired(false);

        try {
            await api.submitStartup({
                ...formData,
                status: 'pending' // Ensure it's pending for admin review
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData(EMPTY_FORM);
            }, 3000);
        } catch (err) {
            // Submission is session-gated, so a token that expired while the form
            // was open surfaces here as a 401. Offer sign-in instead of showing
            // the API's terse "No token provided!".
            if (err.status === 401 || err.status === 403) {
                setSessionExpired(true);
                setStatus('error');
                return;
            }
            setError(err.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    const modal = (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="submit-startup-title"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
        >
            {/* min-h-full + items-center centres the panel while still allowing
                the overlay itself to scroll when the dialog is taller than the
                viewport, which stops the top being pushed out of reach. */}
            <div className="min-h-full flex items-center justify-center p-4">
                <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                    >
                        <X size={20} />
                    </button>

                    {status === 'success' ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-green-100 text-[#00a84f] rounded-full flex items-center justify-center">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800">Application Received!</h2>
                            <p className="text-gray-600 max-w-xs mx-auto">
                                Thank you for sharing your vision. Our team will review your application and notify you once it's featured on the platform.
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-6 px-8 py-2 bg-[#00a84f] text-white rounded-lg font-semibold hover:bg-[#008a42] transition-colors"
                            >
                                Got it
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <div className="bg-gradient-to-r from-[#1e293b] to-[#00a84f] p-8 text-white">
                                <Rocket className="mb-3 text-white/80" size={32} />
                                <h2 id="submit-startup-title" className="text-2xl font-bold">Showcase Your Startup</h2>
                                <p className="text-white/80 text-sm mt-1">Join the network of Kenya's most promising innovators.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                {sessionExpired ? (
                                    <div className="p-4 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-200 space-y-3">
                                        <p>Your session expired while this form was open. Sign in again to submit your application.</p>
                                        <button
                                            type="button"
                                            onClick={() => { onClose(); requestSignIn(); }}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00a84f] text-white font-semibold hover:bg-[#008a42] transition-colors"
                                        >
                                            <LogIn size={15} />
                                            Sign in
                                        </button>
                                    </div>
                                ) : (
                                    error && (
                                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                            {error}
                                        </div>
                                    )
                                )}

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                            <Building2 size={12} /> Startup Name *
                                        </label>
                                        <input
                                            ref={nameRef}
                                            required
                                            type="text"
                                            placeholder="e.g. M-Pesa Hub"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                            value={formData.name}
                                            onChange={handleChange('name')}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                            <TrendingUp size={12} /> Industry *
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Fintech, Agritech"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                            value={formData.industry}
                                            onChange={handleChange('industry')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                        <Info size={12} /> Short Description *
                                    </label>
                                    <textarea
                                        required
                                        rows="3"
                                        placeholder="Tell us what you are building and why it matters..."
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                        value={formData.description}
                                        onChange={handleChange('description')}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                            <TrendingUp size={12} /> Funding Stage
                                        </label>
                                        <select
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                            value={formData.fundingStage}
                                            onChange={handleChange('fundingStage')}
                                        >
                                            <option value="Idea">Idea Stage</option>
                                            <option value="Pre-seed">Pre-seed</option>
                                            <option value="Seed">Seed</option>
                                            <option value="Series A+">Series A+</option>
                                            <option value="Bootstrapped">Bootstrapped</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                            <Globe size={12} /> Website URL
                                        </label>
                                        <input
                                            type="url"
                                            placeholder="https://mystartup.co.ke"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                            value={formData.websiteUrl}
                                            onChange={handleChange('websiteUrl')}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                        <Globe size={12} /> Logo / Thumbnail URL
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Link to your brand image"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                        value={formData.logo}
                                        onChange={handleChange('logo')}
                                    />
                                    <p className="text-[10px] text-gray-400">Optional: Provide a publicly accessible URL for your logo.</p>
                                </div>

                                <button
                                    disabled={status === 'loading'}
                                    type="submit"
                                    className="w-full py-3 bg-[#00a84f] text-white rounded-xl font-bold hover:bg-[#008a42] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            Submit Application
                                            <Rocket size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
};

export default SubmitStartupModal;