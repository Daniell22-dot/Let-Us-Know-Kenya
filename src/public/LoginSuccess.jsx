import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from '../shared/services/api';

const LoginSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        // The server places the JWT in the URL *fragment* (#token=...), which is
        // never transmitted to the server and never logged.
        const hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
        const params = new URLSearchParams(hash);
        const token = params.get('token');

        if (!token) {
            navigate('/', { replace: true });
            return;
        }

        // Validate the token against the API and take the identity from the
        // response. We must never accept a `user` object supplied in the URL:
        // the previous version read ?token=&user={"role":"admin"} and logged
        // anyone in as an administrator, which was a complete auth bypass.
        api.getProfile(token)
            .then((user) => {
                if (cancelled) return;
                if (!user || !user.id) throw new Error('Invalid session.');
                login(user, token);
                navigate('/', { replace: true });
            })
            .catch(() => {
                if (cancelled) return;
                setError('Sign-in could not be completed. Please try again.');
                setTimeout(() => navigate('/', { replace: true }), 2500);
            });

        return () => {
            cancelled = true;
        };
    }, [location, login, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
            {error ? (
                <>
                    <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Sign-in failed</h2>
                    <p className="text-gray-500">{error}</p>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 border-4 border-[#00a84f]/20 border-t-[#00a84f] rounded-full animate-spin mb-6"></div>
                    <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Finishing your sign-in...</h2>
                    <p className="text-gray-500">You will be redirected in just a moment.</p>
                </>
            )}
        </div>
    );
};

export default LoginSuccess;
