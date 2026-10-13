import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Globe, Rocket, ArrowUpRight, Users } from 'lucide-react';
import { CardSkeleton } from './components/SkeletonLoaders.jsx';
import RequireAuth, { requestSignIn } from './components/RequireAuth.jsx';
import api from '../shared/services/api';
import SubmitStartupModal from './components/SubmitStartupModal.jsx';
import { useAuth } from './AuthContext';

/**
 * Startup directory.
 *
 * Layout follows an editorial directory pattern: an off-white canvas, an
 * oversized headline, a pill search field, and a sparse card grid with generous
 * spacing. The colour language is the platform's own Kenya palette rather than
 * anything borrowed wholesale, so the page still reads as LUK Kenya.
 *
 * The directory and the submission form are both gated behind a session. The
 * gate is not only visual: the listing request is never issued until the visitor
 * is signed in, and the API rejects anonymous calls server-side.
 */

const StartupCard = ({ startup }) => (
    <article className="group flex flex-col h-full bg-white rounded-2xl border border-black/5 overflow-hidden hover:shadow-[0_12px_40px_-12px_rgba(30,41,59,0.18)] hover:-translate-y-0.5 transition-all">
        {startup.logo ? (
            <div className="h-44 bg-[#f7f5f2] flex items-center justify-center p-6 border-b border-black/5">
                <img
                    src={startup.logo}
                    alt={startup.name}
                    loading="lazy"
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
            </div>
        ) : (
            <div className="h-44 bg-[#f7f5f2] flex items-center justify-center border-b border-black/5">
                <span className="text-5xl font-black text-[#1e293b]/10 select-none">
                    {(startup.name || '?').charAt(0).toUpperCase()}
                </span>
            </div>
        )}

        <div className="p-6 flex-1 flex flex-col">
            {startup.industry && (
                <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#00a84f]">
                    {startup.industry}
                </span>
            )}

            <h3 className="mt-2 text-xl font-bold tracking-tight text-[#1e293b]">
                {startup.name}
            </h3>

            {startup.description && (
                <p className="mt-2.5 text-sm leading-relaxed text-gray-600 line-clamp-3">
                    {startup.description}
                </p>
            )}

            <dl className="mt-auto pt-5 space-y-2 text-sm text-gray-500">
                {startup.location && (
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#00a84f] shrink-0" />
                        <span>{startup.location}</span>
                    </div>
                )}
                {startup.fundingStage && (
                    <div className="flex items-center gap-2">
                        <Rocket size={14} className="text-[#00a84f] shrink-0" />
                        <span>{startup.fundingStage}</span>
                    </div>
                )}
            </dl>
        </div>

        {startup.websiteUrl && (
            <a
                href={startup.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 px-6 py-3.5 border-t border-black/5 text-sm font-semibold text-[#1e293b] hover:bg-[#f7f5f2] transition-colors"
            >
                Visit website
                <ArrowUpRight size={16} className="text-[#00a84f] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
        )}
    </article>
);

const Directory = () => {
    const { isAuthenticated } = useAuth();
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [sector, setSector] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Only fetch once there is a session to authenticate the request with.
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        let cancelled = false;
        (async () => {
            try {
                const data = await api.getStartups();
                if (cancelled) return;
                setStartups(Array.isArray(data) ? data.filter((s) => s.status !== 'rejected') : []);
            } catch (err) {
                if (!cancelled) setError(err.message || 'Could not load the directory.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [isAuthenticated]);

    // Sectors come from the data so the filter never lists something absent.
    const sectors = useMemo(() => {
        const set = new Set();
        startups.forEach((s) => s.industry && set.add(s.industry));
        return ['All', ...[...set].sort()];
    }, [startups]);

    const visible = useMemo(() => {
        const term = search.trim().toLowerCase();
        return startups.filter((s) => {
            if (sector !== 'All' && s.industry !== sector) return false;
            if (!term) return true;
            return [s.name, s.industry, s.description, s.location]
                .some((v) => (v || '').toLowerCase().includes(term));
        });
    }, [startups, search, sector]);

    return (
        <div className="bg-[#f7f5f2] min-h-screen">
            <Helmet>
                <title>Let Us Know Kenya | Startup Directory</title>
                <meta name="description" content="Discover rising startups, innovators, and entrepreneurs building the future in Kenya." />
                <meta property="og:title" content="LUK Kenya Startups" />
            </Helmet>

            {/* Masthead */}
            <header className="bg-[#1e293b] text-white">
                <div className="max-w-6xl mx-auto px-5 pt-20 pb-16 md:pt-28 md:pb-20">
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#00a84f]">
                        Kenya · Startup Directory
                    </span>
                    <h1 className="mt-5 text-[2.6rem] leading-[1.05] md:text-6xl font-bold tracking-tight max-w-3xl">
                        The companies building Kenya next
                    </h1>
                    <p className="mt-6 text-lg text-white/70 max-w-xl leading-relaxed">
                        Browse vetted Kenyan startups, and put yours in front of
                        investors, partners, and talent.
                    </p>
                </div>
            </header>

            {/* Controls */}
            <div className="sticky top-[72px] z-30 bg-[#f7f5f2]/90 backdrop-blur border-b border-black/5">
                <div className="max-w-6xl mx-auto px-5 py-4 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name, sector, or location"
                            aria-label="Search startups"
                            className="w-full bg-white rounded-full pl-12 pr-5 py-3 text-sm border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#00a84f] focus:border-transparent transition-all placeholder:text-gray-400"
                        />
                    </div>

                    {sectors.length > 1 && (
                        <select
                            value={sector}
                            onChange={(e) => setSector(e.target.value)}
                            aria-label="Filter by sector"
                            className="bg-white rounded-full px-5 py-3 text-sm border border-black/10 focus:outline-none focus:ring-2 focus:ring-[#00a84f]"
                        >
                            {sectors.map((s) => (
                                <option key={s} value={s}>{s === 'All' ? 'All sectors' : s}</option>
                            ))}
                        </select>
                    )}

                    <button
                        type="button"
                        onClick={() => (isAuthenticated ? setIsModalOpen(true) : requestSignIn())}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#00a84f] text-white font-semibold hover:bg-[#009540] hover:shadow-lg transition-all shrink-0"
                    >
                        <Rocket size={17} />
                        Submit yours
                    </button>
                </div>
            </div>

            {/* Results */}
            <main className="max-w-6xl mx-auto px-5 py-14">
                <div className="flex items-baseline justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold tracking-tight text-[#1e293b]">
                        {loading ? 'Loading' : `${visible.length} ${visible.length === 1 ? 'startup' : 'startups'}`}
                    </h2>
                    <span className="text-sm text-gray-500 hidden sm:inline">Verified submissions only</span>
                </div>

                {error ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm text-red-700">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
                    </div>
                ) : visible.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {visible.map((startup) => (
                            <StartupCard key={startup.id} startup={startup} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24">
                        <Users size={44} className="mx-auto text-[#1e293b]/15 mb-5" />
                        <h3 className="text-xl font-bold text-[#1e293b]">
                            {search || sector !== 'All' ? 'No matches' : 'No startups listed yet'}
                        </h3>
                        <p className="mt-2 text-gray-500 max-w-sm mx-auto text-sm">
                            {search || sector !== 'All'
                                ? 'Try a different search term or clear the sector filter.'
                                : 'Be the first to put your company on the directory.'}
                        </p>
                        {(search || sector !== 'All') && (
                            <button
                                type="button"
                                onClick={() => { setSearch(''); setSector('All'); }}
                                className="mt-6 text-sm font-semibold text-[#00a84f] hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </main>

            <SubmitStartupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

const StartupPage = () => (
    <RequireAuth
        title="Sign in to view the directory"
        description="The Kenyan startup directory is available to signed-in members only."
        benefits={[
            'Browse every approved startup across Kenya',
            'Submit your own company for review',
            'Be listed once an editor approves your submission'
        ]}
    >
        <Directory />
    </RequireAuth>
);

export default StartupPage;