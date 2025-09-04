import React, { useEffect } from "react";

export default function WarningToast({ message, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;
    return (
        <div className="fixed top-6 right-6 z-50">
            <div className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
                <svg
                    width="22"
                    height="22"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="mr-2"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
                    />
                </svg>
                <span className="font-semibold">{message}</span>
            </div>
        </div>
    );
}

// Tailwind animate-fade-in-up (add to tailwind.config.js if not present):
// animation: fade-in-up 0.4s cubic-bezier(0.39, 0.575, 0.565, 1) both;
// @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
