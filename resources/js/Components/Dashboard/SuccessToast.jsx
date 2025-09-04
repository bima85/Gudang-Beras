import React, { useEffect } from "react";

export default function SuccessToast({ message, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 2200);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;
    return (
        <div className="fixed top-6 right-6 z-50">
            <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in-up">
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
                        d="M5 13l4 4L19 7"
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
