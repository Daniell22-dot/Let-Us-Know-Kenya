import React, { useState, useEffect } from 'react';
import { Star, Send, Trash2, User, MessageSquare } from 'lucide-react';
import api from '../../shared/services/api';
import { useAuth } from '../AuthContext';

const StarRating = ({ value, onChange, readOnly = false }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
            <button
                key={star}
                type="button"
                disabled={readOnly}
                onClick={() => onChange && onChange(star)}
                className={`transition-transform ${!readOnly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
            >
                <Star
                    size={20}
                    className={star <= value ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                />
            </button>
        ))}
    </div>
);

const ReviewSection = ({ entityType, entityId }) => {
    const { user, isAuthenticated } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ author: '', rating: 0, comment: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Auto-fill author if logged in
        if (isAuthenticated && user?.username && !form.author) {
            setForm(prev => ({ ...prev, author: user.username }));
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        if (!entityId) return;
        const fetchReviews = async () => {
            try {
                const data = await api.getReviews(entityType, entityId);
                setReviews(data);
            } catch {
                // silent
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, [entityType, entityId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // The reviews API requires an authenticated user.
        if (!isAuthenticated) {
            setError('Please sign in to leave a review.');
            return;
        }

        if (form.rating === 0) { setError('Please select a rating.'); return; }
        if (!form.comment.trim()) { setError('Please write a comment.'); return; }
        setSubmitting(true);
        try {
            const newReview = await api.createReview({
                entityType,
                entityId,
                author: user.username,
                rating: form.rating,
                comment: form.comment.trim()
            });
            setReviews(prev => [newReview, ...prev]);
            setForm(prev => ({ ...prev, rating: 0, comment: '' }));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message || 'Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.deleteReview(id);
            setReviews(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            setError(err.message || 'Failed to delete review.');
        }
    };

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : null;

    const formatDate = (d) => {
        if (!d) return '';
        return new Date(d).toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <div className="mt-8 border-t border-gray-200 pt-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#00a84f]/10 rounded-lg flex items-center justify-center">
                        <MessageSquare size={20} className="text-[#00a84f]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Reviews & Feedback</h3>
                        {avgRating && (
                            <div className="flex items-center gap-2">
                                <StarRating value={Math.round(parseFloat(avgRating))} readOnly />
                                <span className="text-sm text-gray-500">{avgRating} · {reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Form */}
            <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                <p className="font-semibold text-gray-700 mb-4 text-sm">Leave your feedback</p>
                <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Your rating *</p>
                    <StarRating value={form.rating} onChange={(v) => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <input
                    type="text"
                    placeholder="Your name (optional)"
                    value={form.author}
                    onChange={(e) => setForm(f => ({ ...f, author: e.target.value }))}
                    className="w-full mb-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a84f]"
                />
                <textarea
                    placeholder="Share your thoughts..."
                    value={form.comment}
                    onChange={(e) => setForm(f => ({ ...f, comment: e.target.value }))}
                    rows={3}
                    className="w-full mb-3 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00a84f] resize-none"
                />
                {error && <p className="text-red-500 text-xs mb-3">{error}</p>}
                {success && <p className="text-[#00a84f] text-xs mb-3">✓ Review submitted successfully!</p>}
                <button
                    type="submit"
                    disabled={submitting}
                    className="bg-[#00a84f] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#00953f] transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                    <Send size={14} />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </form>

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-[#00a84f] border-t-transparent rounded-full animate-spin" />
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-4 group hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#00a84f] to-[#c41e3a] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        {(review.author || 'A')[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{review.author || 'Anonymous'}</p>
                                        <p className="text-gray-400 text-xs">{formatDate(review.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <StarRating value={review.rating} readOnly />
                                    {/* Deleting a review is an admin-only API
                                        operation, so don't offer the control to
                                        ordinary visitors. */}
                                    {isAdmin && (
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="p-1 text-gray-300 hover:text-red-400 transition-colors"
                                            title="Delete review"
                                            aria-label={`Delete review by ${review.author || 'Anonymous'}`}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-400">
                    <MessageSquare size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No reviews yet. Be the first!</p>
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
