import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Hydrate from localStorage on boot
        const storedToken = localStorage.getItem('luk_token');
        const storedUser = localStorage.getItem('luk_user');

        if (storedToken && storedUser) {
            setToken(storedToken);
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
        setLoading(false);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('luk_token', authToken);
        localStorage.setItem('luk_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('luk_token');
        localStorage.removeItem('luk_user');
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
