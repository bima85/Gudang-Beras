import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// Setup CSRF token interceptor
window.axios.interceptors.request.use(function (config) {
    // Get CSRF token from meta tag
    const token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        config.headers['X-CSRF-TOKEN'] = token.content;
        console.log('CSRF token added to request:', token.content.substring(0, 10) + '...');
    } else {
        console.error('CSRF token not found in meta tag');
    }
    return config;
}, function (error) {
    return Promise.reject(error);
});

// Response interceptor for debugging
window.axios.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response?.status === 403) {
        console.error('403 Forbidden Error:', {
            url: error.config?.url,
            headers: error.config?.headers,
            data: error.response?.data
        });
    }
    return Promise.reject(error);
});
