import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, MapPin, Globe, Briefcase, TrendingUp, Rocket } from 'lucide-react';
import { CardSkeleton } from './components/SkeletonLoaders.jsx';
import api from '../shared/services/api';
import SubmitStartupModal from './components/SubmitStartupModal.jsx';

const StartupCard = ({ startup }) => (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col h-full">
        {startup.logo && (
            <div className="h-40 bg-gray-50 flex items-center justify-center p-4 border-b border-gray-100">
                <img src={startup.logo} alt={startup.name} className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
            </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
            <span className="text-xs font-bold text-[#c41e3a] uppercase tracking-wider mb-2 block">{startup.industry || 'Tech'}</span>
            <h3 className="text-xl font-bold text-[#1e293b] mb-2">{startup.name}</h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{startup.description}</p>

            <div className="mt-auto space-y-2 text-sm text-gray-500 pb-4 mb-4 border-b border-gray-100">
                {startup.location && (
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#00a84f]" />
                        <span>{startup.location}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#00a84f]" />
                    <span>Stage: {startup.fundingStage || 'Seed'}</span>
                </div>
            </div>

            {startup.websiteUrl && (
                <a href={startup.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-[#1e293b] text-sm font-semibold rounded-lg transition-colors border border-gray-200">
                    <Globe size={16} /> Visit Website
                </a>
            )}
        </div>
    </div>
);

const StartupPage = () => {
    const [startups, setStartups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchStartups = async () => {
            try {
                const data = await api.getStartups();
                // Depending on the API, it might return all or we might need to filter approved
                setStartups(data.filter(s => s.status !== 'rejected'));
            } catch (error) {
                console.error("Failed to load startups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStartups();
    }, []);

    const filteredStartups = startups.filter(s =>
        (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in bg-gray-50 min-h-screen">
            <Helmet>
                <title>Let Us Know Kenya | Startup Directory</title>
                <meta name="description" content="Discover rising startups, innovators, and entrepreneurs building the future in Kenya." />
                <meta property="og:title" content="LUK Kenya Startups" />
            </Helmet>

            <div className="bg-gradient-to-br from-[#1e293b] to-[#1e293b] text-white py-16 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Kenyan Startup Ecosystem</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">Discover and connect with innovative startups driving change across the region.</p>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-10">
                        <div className="max-w-md w-full relative">
                            <input
                                type="text"
                                placeholder="Search startups..."
                                className="w-full bg-white text-gray-800 rounded-full py-3 pl-12 pr-4 shadow-xl focus:outline-none focus:ring-2 focus:ring-[#00a84f] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#00a84f] hover:bg-[#008a42] text-white px-8 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-2"
                        >
                            <Rocket size={18} />
                            Submit Yours
                        </button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
                    </div>
                ) : filteredStartups.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStartups.map(startup => (
                            <StartupCard key={startup.id} startup={startup} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No startups found</h3>
                        <p className="text-gray-500">Try adjusting your search criteria.</p>
                    </div>
                )}
            </div>

            <SubmitStartupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default StartupPage;
