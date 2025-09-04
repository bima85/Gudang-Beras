import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    // When running vite dev server, proxy API/dashboard requests to Laravel
    server: {
        proxy: {
            '^/dashboard': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
            // also proxy sanctum CSRF and other Laravel endpoints if needed
            '^/sanctum': {
                target: 'http://127.0.0.1:8000',
                changeOrigin: true,
                secure: false,
            },
        },
        // Ensure dev server is reachable using localhost (avoid IPv6 ::1 issues)
        host: true,
        hmr: {
            host: 'localhost',
        },
    },

});
