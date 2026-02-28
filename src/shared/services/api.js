const BASE_URL = 'http://localhost:5000/api/v1';
const OLD_BASE_URL = 'http://localhost:5000/api'; // Fallback support if needed

const api = {
    // ─── Blogs ───────────────────────────────────────────────────────────────
    getBlogs: async () => {
        const response = await fetch(`${BASE_URL}/blogs`);
        if (!response.ok) throw new Error('Failed to fetch blogs');
        return response.json();
    },
    createBlog: async (data) => {
        const response = await fetch(`${BASE_URL}/blogs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create blog');
        return response.json();
    },
    updateBlog: async (id, data) => {
        const response = await fetch(`${BASE_URL}/blogs/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update blog');
        return response.json();
    },
    deleteBlog: async (id) => {
        const response = await fetch(`${BASE_URL}/blogs/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete blog');
        return response.json();
    },
    voteBlog: async (id, type) => {
        const response = await fetch(`${BASE_URL}/blogs/${id}/vote`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type })
        });
        if (!response.ok) throw new Error('Failed to vote on blog');
        return response.json();
    },

    // ─── Podcasts ─────────────────────────────────────────────────────────────
    getPodcasts: async () => {
        const response = await fetch(`${BASE_URL}/podcasts`);
        if (!response.ok) throw new Error('Failed to fetch podcasts');
        return response.json();
    },
    createPodcast: async (data) => {
        const response = await fetch(`${BASE_URL}/podcasts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create podcast');
        return response.json();
    },
    updatePodcast: async (id, data) => {
        const response = await fetch(`${BASE_URL}/podcasts/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update podcast');
        return response.json();
    },
    deletePodcast: async (id) => {
        const response = await fetch(`${BASE_URL}/podcasts/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete podcast');
        return response.json();
    },

    // ─── Resources ───────────────────────────────────────────────────────────
    getResources: async () => {
        const response = await fetch(`${BASE_URL}/resources`);
        if (!response.ok) throw new Error('Failed to fetch resources');
        return response.json();
    },
    createResource: async (data) => {
        const response = await fetch(`${BASE_URL}/resources`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create resource');
        return response.json();
    },
    updateResource: async (id, data) => {
        const response = await fetch(`${BASE_URL}/resources/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update resource');
        return response.json();
    },
    deleteResource: async (id) => {
        const response = await fetch(`${BASE_URL}/resources/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete resource');
        return response.json();
    },

    // ─── Startups ─────────────────────────────────────────────────────────────
    getStartups: async () => {
        const response = await fetch(`${BASE_URL}/startups`);
        if (!response.ok) throw new Error('Failed to fetch startups');
        return response.json();
    },
    approveStartup: async (id) => {
        const response = await fetch(`${BASE_URL}/startups/${id}/approve`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to approve startup');
        return response.json();
    },
    rejectStartup: async (id) => {
        const response = await fetch(`${BASE_URL}/startups/${id}/reject`, { method: 'PUT' });
        if (!response.ok) throw new Error('Failed to reject startup');
        return response.json();
    },
    submitStartup: async (data) => {
        const response = await fetch(`${BASE_URL}/startups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit startup');
        return response.json();
    },

    // ─── Jobs ─────────────────────────────────────────────────────────────────
    getJobs: async () => {
        const response = await fetch(`${BASE_URL}/jobs`);
        if (!response.ok) throw new Error('Failed to fetch jobs');
        return response.json();
    },

    // ─── Reviews ─────────────────────────────────────────────────────────────
    getReviews: async (entityType, entityId) => {
        const response = await fetch(`${BASE_URL}/reviews?entityType=${entityType}&entityId=${entityId}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },
    createReview: async (data) => {
        const response = await fetch(`${BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create review');
        return response.json();
    },
    deleteReview: async (id) => {
        const response = await fetch(`${BASE_URL}/reviews/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete review');
        return response.json();
    },

    // ─── Auth ────────────────────────────────────────────────────────────
    login: async (credentials) => {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to login');
        return data; // Returns { token, user... }
    },
    register: async (credentials) => {
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to register');
        return data;
    },

    // ─── Watchlist ────────────────────────────────────────────────────────
    getWatchlist: async () => {
        const response = await fetch(`${BASE_URL}/watchlist`, {
            headers: { 'x-access-token': localStorage.getItem('luk_token') }
        });
        if (!response.ok) throw new Error('Failed to fetch watchlist');
        return response.json();
    },
    addToWatchlist: async (entityType, entityId) => {
        const response = await fetch(`${BASE_URL}/watchlist`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('luk_token')
            },
            body: JSON.stringify({ entityType, entityId })
        });
        if (!response.ok) throw new Error('Failed to add to watchlist');
        return response.json();
    },
    removeFromWatchlist: async (entityType, entityId) => {
        const response = await fetch(`${BASE_URL}/watchlist/${entityType}/${entityId}`, {
            method: 'DELETE',
            headers: { 'x-access-token': localStorage.getItem('luk_token') }
        });
        if (!response.ok) throw new Error('Failed to remove from watchlist');
        return response.json();
    },

    // ─── Search ────────────────────────────────────────────────────────────
    searchAll: async (query) => {
        const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');
        return response.json();
    },

    // ─── Newsletter ────────────────────────────────────────────────────────
    subscribeToNewsletter: async (email) => {
        const response = await fetch(`${BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Subscription failed');
        return data;
    },

    // ─── Projects ────────────────────────────────────────────────────────────
    getProjects: async () => {
        const response = await fetch(`${BASE_URL}/projects`);
        if (!response.ok) throw new Error('Failed to fetch projects');
        return response.json();
    },
    createProject: async (data) => {
        const response = await fetch(`${BASE_URL}/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create project');
        return response.json();
    },
    updateProject: async (id, data) => {
        const response = await fetch(`${BASE_URL}/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update project');
        return response.json();
    },
    deleteProject: async (id) => {
        const response = await fetch(`${BASE_URL}/projects/${id}`, {
            method: 'DELETE',
            headers: { 'x-access-token': localStorage.getItem('luk_token') }
        });
        if (!response.ok) throw new Error('Failed to delete project');
        return response.json();
    },

    // ─── Activity Logging ────────────────────────────────────────────────────
    logActivity: async (action, details, pageUrl) => {
        try {
            await fetch(`${BASE_URL}/activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': localStorage.getItem('luk_token') || ''
                },
                body: JSON.stringify({ action, details, pageUrl })
            });
        } catch (err) {
            // Silent fail for logging to not interrupt user flow
        }
    },

    // ─── Google OAuth ────────────────────────────────────────────────────────
    getGoogleAuthUrl: () => {
        return `${BASE_URL}/auth/google`;
    }
};

export default api;
