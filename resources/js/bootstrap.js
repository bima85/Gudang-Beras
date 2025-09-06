import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Setup basic CSRF token interceptor
window.axios.interceptors.request.use(function (config) {
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token.content;
        console.log('CSRF token added to request:', token.content.substring(0, 10) + '...');
        console.log('Full token length:', token.content.length);
        console.log('Request URL:', config.url);
        console.log('Request headers:', config.headers);
    } else {
        console.error('CSRF token not found in meta tag');
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Simple response interceptor for debugging
window.axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response?.status === 419) {
        console.error('419 Page Expired Error - CSRF token may be invalid');
        console.error('Original request:', error.config?.url);
        // For now, just log the error - don't auto-refresh to avoid complications
    }

    if (error.response?.status === 403) {
        console.error('403 Forbidden Error:', {
            url: error.config?.url,
            headers: error.config?.headers,
            data: error.response?.data
        });
    }

    return Promise.reject(error);
});

// Ensure fetch (used by Inertia) also includes CSRF token from meta tag.
// This makes Inertia visits include the X-CSRF-TOKEN header even though
// axios interceptors don't affect fetch. We keep the original fetch
// behavior but inject the header for non-GET/HEAD requests when missing.
if (typeof window !== 'undefined' && window.fetch) {
    const originalFetch = window.fetch.bind(window);

    window.fetch = (input, init = {}) => {
        try {
            const tokenMeta = document.head.querySelector('meta[name="csrf-token"]');
            const token = tokenMeta ? tokenMeta.getAttribute('content') : null;

            // Normalize init and set headers
            const method = (init && init.method) || 'GET';
            init.headers = init.headers || {};

            // Only inject for state-changing requests
            if (token && !['GET', 'HEAD'].includes(method.toUpperCase())) {
                // If headers is a Headers instance, set via .set
                if (typeof Headers !== 'undefined' && init.headers instanceof Headers) {
                    init.headers.set('X-CSRF-TOKEN', token);
                } else if (typeof init.headers === 'object') {
                    // don't overwrite if already present
                    if (!init.headers['X-CSRF-TOKEN'] && !init.headers['x-csrf-token']) {
                        init.headers['X-CSRF-TOKEN'] = token;
                    }
                }
            }
        } catch (err) {
            // swallow errors - we don't want fetch to break if DOM not ready
            console.warn('Failed to attach CSRF token to fetch request', err);
        }

        return originalFetch(input, init);
    };
}
