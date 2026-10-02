import api from '../services/api';

const ADMIN_TOKEN_KEY = 'luk_admin_token';
const ADMIN_USER_KEY = 'luk_admin_user';

/**
 * Admin session management.
 *
 * This previously compared the entered password against credentials compiled
 * into the JavaScript bundle and minted a fake token from Date.now(), so
 * "authentication" was a pure UI illusion with no server round-trip. Authorisation
 * is now decided entirely by the API, which verifies a real JWT and checks the
 * user's role.
 */

export const getStoredUser = () => {
    try {
        const raw = localStorage.getItem(ADMIN_USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (_) {
        return null;
    }
};

export const checkAuth = () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const user = getStoredUser();
    return !!(token && user && user.role === 'admin');
};

export const login = async (email, password) => {
    try {
        const result = await api.login({ email, password });
        const user = result.user;

        if (!user || user.role !== 'admin') {
            // Do not store the token: this account has no admin rights.
            return { success: false, error: 'This account does not have admin access.' };
        }

        localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        return { success: true, token: result.token, user };
    } catch (err) {
        return { success: false, error: err.message || 'Sign in failed.' };
    }
};

/**
 * Re-checks the stored token against the API. The stored role is only a UI
 * hint -- it is never used to make an authorisation decision.
 */
export const verifySession = async () => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return null;

    try {
        const user = await api.getProfile(token);
        if (!user || user.role !== 'admin') {
            logout();
            return null;
        }
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
        return user;
    } catch (_) {
        logout();
        return null;
    }
};

export const logout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
};

export const getCurrentUser = getStoredUser;
