import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { BookOpen, Headphones, Trash2 } from 'lucide-react';
import api from '../shared/services/api';
import { Link } from 'react-router-dom';

const WatchlistPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const fetchWatchlist = async () => {
            try {
                const data = await api.getWatchlist();
                setItems(data);
            } catch (err) {
                console.error("Failed to load watchlist", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlist();
    }, [isAuthenticated]);

    const handleRemove = async (entityType, entityId) => {
        try {
            await api.removeFromWatchlist(entityType, entityId);
            setItems(items.filter(item => !(item.entityType === entityType && item.entityId === entityId)));
        } catch (err) {
            console.error("Failed to remove item", err);
            alert("Failed to remove item");
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm">
                    <BookOpen size={48} className="mx-auto mb-4 text-[#00a84f] opacity-50" />
                    <h2 className="text-xl font-bold text-[#1e293b] mb-2">Sign In Required</h2>
                    <p className="text-gray-500 text-sm mb-6">You must be logged in to view your saved items.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#00a84f] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#1e293b]">My Watchlist</h1>
                    <p className="text-gray-500 mt-2">Saved blogs, podcasts, and research projects.</p>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Your watchlist is empty</h3>
                        <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                            When you find an interesting article or podcast, click the save button to add it here.
                        </p>
                        <Link to="/" className="inline-block px-6 py-3 bg-[#00a84f] text-white rounded-xl font-semibold hover:bg-[#008a42] transition-colors">
                            Explore Content
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group relative">
                                <button
                                    onClick={() => handleRemove(item.entityType, item.entityId)}
                                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm z-10 transition-colors"
                                    title="Remove from watchlist"
                                >
                                    <Trash2 size={16} />
                                </button>

                                {item.details?.image || item.details?.thumbnail ? (
                                    <div className="h-40 overflow-hidden bg-gray-100">
                                        <img
                                            src={item.details.image || item.details.thumbnail}
                                            alt={item.details.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>
                                ) : (
                                    <div className="h-40 bg-gradient-to-br from-[#1e293b] to-[#00a84f] opacity-80" />
                                )}

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded bg-gray-100 text-gray-600 capitalize">
                                            {item.entityType}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
                                        {item.details?.title || 'Unknown Title'}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">
                                        {item.details?.excerpt || item.details?.description || item.details?.abstract || ''}
                                    </p>

                                    <Link
                                        to={`/${item.entityType}s`}
                                        className="mt-4 text-[#00a84f] text-sm font-semibold hover:underline block"
                                    >
                                        View {item.entityType} →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;
