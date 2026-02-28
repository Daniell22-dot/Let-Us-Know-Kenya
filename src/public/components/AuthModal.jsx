import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../AuthContext';
import api from '../../shared/services/api';

const AuthModal = ({ isOpen, onClose, initialView = 'login' }) => {
    const [view, setView] = useState(initialView); // 'login' or 'register'
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (view === 'login') {
                const response = await api.login({ email: formData.email, password: formData.password });
                login(response, response.token);
                onClose();
            } else {
                const response = await api.register(formData);
                login(response.user, response.token);
                onClose();
            }
        } catch (err) {
            setError(err.message || `Failed to ${view}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white rounded-2xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden animate-slide-up">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-20"
                >
                    <X size={20} />
                </button>

                {/* Header Decoration */}
                <div className="h-2 bg-gradient-to-r from-[#1e293b] via-[#c41e3a] to-[#00a84f]"></div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-[#1e293b] mb-2">
                            {view === 'login' ? 'Welcome Back' : 'Create an Account'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {view === 'login' ? 'Log in to save resources and leave reviews' : 'Join LUK Kenya to save your favorite content'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {view === 'register' && (
                            <div>
                                <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Username</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00a84f] focus:ring-2 focus:ring-[#00a84f]/20 outline-none transition-all"
                                        placeholder="johndoe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">
                                {view === 'login' ? 'Email or Username' : 'Email Address'}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#00a84f]">
                                    <Mail size={18} className="text-gray-400 group-focus-within:text-[#00a84f] transition-colors" />
                                </div>
                                <input
                                    type={view === 'login' ? 'text' : 'email'}
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00a84f] focus:ring-4 focus:ring-[#00a84f]/10 outline-none transition-all"
                                    placeholder={view === 'login' ? 'you@example.com or username' : 'you@example.com'}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#1e293b] mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-[#00a84f] focus:ring-2 focus:ring-[#00a84f]/20 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 mt-4 bg-[#00a84f] hover:bg-[#008a42] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#00a84f]/20"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {view === 'login' ? 'Sign In' : 'Create Account'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500 font-medium font-outfit">Or continue with</span>
                        </div>
                    </div>

                    {/* Google Login Button */}
                    <button
                        onClick={() => window.location.href = api.getGoogleAuthUrl()}
                        className="w-full py-3 bg-white border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-sm active:scale-[0.98] font-outfit"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span>Continue with Google</span>
                    </button>

                    <div className="mt-6 text-center text-sm font-medium text-gray-500">
                        {view === 'login' ? (
                            <p>Don't have an account? <button onClick={() => setView('register')} className="text-[#00a84f] hover:underline hover:text-[#008a42]">Sign up</button></p>
                        ) : (
                            <p>Already have an account? <button onClick={() => setView('login')} className="text-[#00a84f] hover:underline hover:text-[#008a42]">Log in</button></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthModal;
