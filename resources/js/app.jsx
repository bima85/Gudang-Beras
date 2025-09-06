import "./bootstrap";
import "../css/app.css";

import { createRoot } from "react-dom/client";
import { createInertiaApp } from "@inertiajs/react";
import { router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { ThemeSwitcherProvider } from "./Context/ThemeSwitcherContext";
import { ToastContainer } from "react-toastify";
import { Toaster } from "sonner";
import "react-toastify/dist/ReactToastify.css";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

// Global Inertia error handling
router.on("error", (event) => {
    console.error("Inertia error event:", event);
});

// Also listen to the low-level inertia:error CustomEvent emitted by the
// Inertia client when a visit fails. This logs the full detail object so we
// can see the server response body / validation payload that triggered the
// event (helps diagnose mismatched field names or HTML/500 responses).
document.addEventListener("inertia:error", (e) => {
    try {
        // Print full detail object and try to stringify response data for easy copy/paste
        console.error("inertia:error CustomEvent detail:", e.detail);
        if (e.detail && e.detail.response) {
            try {
                const resp = e.detail.response;
                console.error("inertia:error response status:", resp.status);
                // Try to stringify JSON body if present
                const body = resp.data || resp.body || resp;
                try {
                    console.error(
                        "inertia:error response body:",
                        JSON.stringify(body, null, 2)
                    );
                } catch (jsonErr) {
                    console.error("inertia:error response body (raw):", body);
                }
            } catch (inner) {
                console.error(
                    "inertia:error response (fallback):",
                    e.detail.response
                );
            }
        }
    } catch (err) {
        console.error("Failed to log inertia:error detail:", err);
    }
});

router.on("exception", (event) => {
    console.error("Inertia exception event:", event);
});

router.on("invalid", (event) => {
    console.error("Inertia invalid event:", event);

    // If it's a 419 CSRF error, try to refresh token
    const response = event.detail?.response;
    if (response?.status === 419) {
        console.log("419 CSRF error detected, refreshing token...");

        fetch("/csrf-token", {
            method: "GET",
            credentials: "include",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.csrf_token) {
                    const currentToken = document.querySelector(
                        'meta[name="csrf-token"]'
                    );
                    if (currentToken) {
                        currentToken.content = data.csrf_token;
                        console.log("CSRF token refreshed after 419 error");
                    }
                }
            })
            .catch((error) => {
                console.warn("Failed to refresh CSRF token after 419:", error);
            });
    }
});

router.on("success", (event) => {
    console.log("Inertia success event:", event);

    // Refresh CSRF token after successful requests
    const shouldRefreshToken =
        event.detail?.page?.url?.includes("/dashboard") ||
        event.detail?.page?.component?.includes("Dashboard") ||
        event.detail?.page?.url?.includes("/login") ||
        event.detail?.page?.component?.includes("Login");

    if (shouldRefreshToken) {
        // Use the CSRF token endpoint that already exists
        fetch("/csrf-token", {
            method: "GET",
            credentials: "include",
            headers: {
                "X-Requested-With": "XMLHttpRequest",
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.csrf_token) {
                    const currentToken = document.querySelector(
                        'meta[name="csrf-token"]'
                    );
                    if (currentToken) {
                        currentToken.content = data.csrf_token;
                        console.log(
                            "CSRF token refreshed after successful request"
                        );
                    }
                }
            })
            .catch((error) => {
                console.warn("Failed to refresh CSRF token:", error);
            });
    }
});

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeSwitcherProvider>
                <>
                    <App {...props} />
                    <ToastContainer position="top-right" />
                    <Toaster richColors position="top-right" />
                </>
            </ThemeSwitcherProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});
