import React, { useState } from 'react';
import { X, Rocket, Building2, Globe, TrendingUp, Info, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../shared/services/api';

const SubmitStartupModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        fundingStage: 'Pre-seed',
        description: '',
        websiteUrl: '',
        logo: '',
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        try {
            await api.submitStartup({
                ...formData,
                status: 'pending' // Ensure it's pending for admin review
            });
            setStatus('success');
            setTimeout(() => {
                onClose();
                setStatus('idle');
                setFormData({ name: '', industry: '', fundingStage: 'Pre-seed', description: '', websiteUrl: '', logo: '' });
            }, 3000);
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>

                {status === 'success' ? (
                    <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 bg-green-100 text-[#00a84f] rounded-full flex items-center justify-center animate-bounce">
                            <CheckCircle2 size={40} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Application Received!</h2>
                        <p className="text-gray-600 max-w-xs mx-auto">
                            Thank you for sharing your vision. Our team will review your application and notify you once it's featured on the platform.
                        </p>
                        <button
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
                            <h2 className="text-2xl font-bold">Showcase Your Startup</h2>
                            <p className="text-white/80 text-sm mt-1">Join the network of Kenya's most promising innovators.</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5">
                                        <Building2 size={12} /> Startup Name *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. M-Pesa Hub"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                                        onChange={(e) => setFormData({ ...formData, fundingStage: e.target.value })}
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
                                        placeholder="https://mysstartup.co.ke"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#00a84f] focus:outline-none transition-all bg-gray-50"
                                        value={formData.websiteUrl}
                                        onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
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
                                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
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
    );
};

export default SubmitStartupModal;
