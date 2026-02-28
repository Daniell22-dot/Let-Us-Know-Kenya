import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LoginSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const userStr = params.get('user');

        if (token && userStr) {
            try {
                const user = JSON.parse(decodeURIComponent(userStr));
                login(user, token);
                // Clear the URL and redirect to home
                navigate('/', { replace: true });
            } catch (error) {
                console.error('Error parsing user data from Google login:', error);
                navigate('/', { replace: true });
            }
        } else {
            navigate('/', { replace: true });
        }
    }, [location, login, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#00a84f]/20 border-t-[#00a84f] rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold text-[#1e293b] mb-2">Finishing your sign-in...</h2>
            <p className="text-gray-500">You will be redirected in just a moment.</p>
        </div>
    );
};

export default LoginSuccess;
