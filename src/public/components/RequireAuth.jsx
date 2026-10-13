import React, { useEffect } from 'react';
import { Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../AuthContext';

/**
 * Event name used to ask the header to open the sign-in dialog.
 *
 * The sign-in modal lives in the Header, so a page deep in the tree has no direct
 * handle on it. Rather than lifting that state into a context that every page
 * would then depend on, a request is broadcast and the single listener in the
 * Header acts on it.
 */
export const AUTH_REQUEST_EVENT = 'luk:request-auth';

export const requestSignIn = () =>
    window.dispatchEvent(new CustomEvent(AUTH_REQUEST_EVENT, { detail: { view: 'login' } }));

/**
 * Gate that keeps a section hidden until the visitor signs in.
 *
 * The important part is what this deliberately does NOT do: it does not fetch
 * the protected data and then hide it. Nothing is requested until a session
 * exists, so the content never reaches an anonymous visitor's browser even
 * momentarily.
 */
const RequireAuth = ({ children, title, description, benefits = [] }) => {
    const { isAuthenticated } = useAuth();

    if (isAuthenticated) return children;

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-5 py-20 bg-[#f7f5f2]">
            <div className="w-full max-w-lg text-center">
                <div className="w-16 h-16 mx-auto mb-7 rounded-full bg-[#1e293b] flex items-center justify-center">
                    <Lock size={26} className="text-white" />
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1e293b] leading-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-4 text-base leading-relaxed text-gray-600">{description}</p>
                )}

                {benefits.length > 0 && (
                    <ul className="mt-8 space-y-3 text-left max-w-sm mx-auto">
                        {benefits.map((benefit) => (
                            <li key={benefit} className="flex items-start gap-3 text-sm text-gray-700">
                                <ShieldCheck size={16} className="text-[#00a84f] shrink-0 mt-0.5" />
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                )}

                <button
                    type="button"
                    onClick={requestSignIn}
                    className="mt-9 inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#00a84f] text-white font-semibold hover:bg-[#009540] hover:shadow-lg transition-all"
                >
                    <LogIn size={18} />
                    Sign in to continue
                </button>

                <p className="mt-4 text-xs text-gray-500">
                    New here? Create an account in seconds with the form that opens.
                </p>
            </div>
        </div>
    );
};

export default RequireAuth;