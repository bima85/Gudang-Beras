// bootstrap/echo.js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export default function initEcho() {
    if (!process.env.MIX_PUSHER_APP_KEY) return null;

    try {
        const echo = new Echo({
            broadcaster: 'pusher',
            key: process.env.MIX_PUSHER_APP_KEY,
            cluster: process.env.MIX_PUSHER_APP_CLUSTER || process.env.MIX_PUSHER_APP_CLUSTER,
            forceTLS: process.env.MIX_PUSHER_FORCE_TLS === 'true',
            encrypted: true,
        });
        return echo;
    } catch (e) {
        // fail silently
        return null;
    }
}
