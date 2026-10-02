// Relative by default so requests are same-origin. In development Vite proxies
// /api to the API server (see vite.config.js); in production the app can be
// served behind the same host. The previous hardcoded
// 'http://localhost:5000/api/v1' bypassed that proxy, made CORS load-bearing on
// every single request, and made the app impossible to deploy anywhere.
const BASE_URL = `${import.meta.env.VITE_API_URL || ''}/api/v1`.replace(/\/+$/, '');

// Token keys. `luk_token` is the public visitor session; `luk_admin_token` is
// the admin panel session. Both are read so any authenticated call is
// authorised without every caller having to remember the header.
const TOKEN_KEYS = ['luk_admin_token', 'luk_token'];

const getToken = () => {
    for (const key of TOKEN_KEYS) {
        const value = localStorage.getItem(key);
        if (value) return value;
    }
    return null;
};

export class ApiError extends Error {
    constructor(message, status, body) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.body = body;
    }
}

/**
 * Single fetch wrapper: attaches the auth token, enforces a timeout, and
 * normalises error handling. Replaces ~26 hand-rolled copies of this logic.
 */
const request = async (path, { method = 'GET', body, auth = false, headers = {} } = {}) => {
    const token = getToken();
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const requestHeaders = { ...headers };
    if (token) requestHeaders['x-access-token'] = token;
    // Let the browser set the multipart Content-Type so the boundary is correct.
    if (body !== undefined && !isFormData) requestHeaders['Content-Type'] = 'application/json';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let response;
    try {
        response = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: requestHeaders,
            signal: controller.signal,
            ...(body === undefined ? {} : { body: isFormData ? body : JSON.stringify(body) })
        });
    } catch (err) {
        if (err.name === 'AbortError') {
            throw new ApiError('Request timed out. Please try again.', 0, null);
        }
        throw new ApiError('Could not reach the server. Is the API running?', 0, null);
    } finally {
        clearTimeout(timeout);
    }

    // 204 and other empty responses have no body to parse.
    const text = await response.text();
    let data = null;
    if (text) {
        try {
            data = JSON.parse(text);
        } catch (_) {
            data = text;
        }
    }

    if (!response.ok) {
        const message =
            (data && data.message) ||
            (auth && response.status === 401 ? 'Your session has expired. Please sign in again.' : null) ||
            `Request failed (${response.status})`;
        throw new ApiError(message, response.status, data);
    }

    return data;
};

const qs = (params) => {
    const search = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString();
    return search ? `?${search}` : '';
};

const api = {
    // ─── Blogs ───────────────────────────────────────────────────────────────
    getBlogs: (params) => request(`/blogs${qs(params || {})}`),
    createBlog: (data) => request('/blogs', { method: 'POST', body: data, auth: true }),
    updateBlog: (id, data) => request(`/blogs/${id}`, { method: 'PUT', body: data, auth: true }),
    deleteBlog: (id) => request(`/blogs/${id}`, { method: 'DELETE', auth: true }),
    voteBlog: (id, type) => request(`/blogs/${id}/vote`, { method: 'POST', body: { type }, auth: true }),

    // ─── Podcasts ─────────────────────────────────────────────────────────────
    getPodcasts: () => request('/podcasts'),
    createPodcast: (data) => request('/podcasts', { method: 'POST', body: data, auth: true }),
    updatePodcast: (id, data) => request(`/podcasts/${id}`, { method: 'PUT', body: data, auth: true }),
    deletePodcast: (id) => request(`/podcasts/${id}`, { method: 'DELETE', auth: true }),

    // ─── Resources ───────────────────────────────────────────────────────────
    getResources: () => request('/resources'),
    createResource: (data) => request('/resources', { method: 'POST', body: data, auth: true }),
    updateResource: (id, data) => request(`/resources/${id}`, { method: 'PUT', body: data, auth: true }),
    deleteResource: (id) => request(`/resources/${id}`, { method: 'DELETE', auth: true }),

    // ─── Startups ─────────────────────────────────────────────────────────────
    getStartups: () => request('/startups'),
    approveStartup: (id) => request(`/startups/${id}/approve`, { method: 'PUT', auth: true }),
    rejectStartup: (id) => request(`/startups/${id}/reject`, { method: 'PUT', auth: true }),
    // Public submission -- no auth required by design.
    submitStartup: (data) => request('/startups', { method: 'POST', body: data }),

    // ─── Jobs ─────────────────────────────────────────────────────────────────
    getJobs: () => request('/jobs'),

    // ─── Reviews ─────────────────────────────────────────────────────────────
    getReviews: (entityType, entityId) =>
        request(`/reviews${qs({ entityType, entityId })}`),
    createReview: (data) => request('/reviews', { method: 'POST', body: data, auth: true }),
    deleteReview: (id) => request(`/reviews/${id}`, { method: 'DELETE', auth: true }),

    // ─── Auth ─────────────────────────────────────────────────────────────────
    login: async (credentials) => {
        const data = await request('/auth/login', { method: 'POST', body: credentials });
        return { ...data, user: data.user || { id: data.id, username: data.username, email: data.email, role: data.role } };
    },
    register: (credentials) => request('/auth/register', { method: 'POST', body: credentials }),
    getProfile: (token) =>
        request('/auth/profile', {
            auth: true,
            headers: token ? { 'x-access-token': token } : {}
        }),
    uploadFile: (formData) => request('/auth/upload', { method: 'POST', body: formData, auth: true }),

    // ─── Watchlist ────────────────────────────────────────────────────────────
    getWatchlist: () => request('/watchlist', { auth: true }),
    addToWatchlist: (entityType, entityId) =>
        request('/watchlist', { method: 'POST', body: { entityType, entityId }, auth: true }),
    removeFromWatchlist: (entityType, entityId) =>
        request(`/watchlist/${entityType}/${entityId}`, { method: 'DELETE', auth: true }),

    // ─── Search ───────────────────────────────────────────────────────────────
    searchAll: (query) => request(`/search${qs({ q: query })}`),

    // ─── Newsletter ───────────────────────────────────────────────────────────
    subscribeToNewsletter: (email) =>
        request('/newsletter/subscribe', { method: 'POST', body: { email } }),

    // ─── Projects ─────────────────────────────────────────────────────────────
    getProjects: () => request('/projects'),
    createProject: (data) => request('/projects', { method: 'POST', body: data, auth: true }),
    updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: data, auth: true }),
    deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE', auth: true }),

    // ─── Activity Logging ─────────────────────────────────────────────────────
    logActivity: async (action, details, pageUrl) => {
        try {
            await request('/activity', { method: 'POST', body: { action, details, pageUrl } });
        } catch (_) {
            // Silent fail -- logging must never interrupt the user flow.
        }
    },

    // ─── Google OAuth ─────────────────────────────────────────────────────────
    getGoogleAuthUrl: () => `${BASE_URL}/auth/google`
};

export { BASE_URL };
export default api;
