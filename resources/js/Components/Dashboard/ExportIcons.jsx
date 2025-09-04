import React from 'react';

export function ExcelIcon({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="18" rx="2" fill="#22c55e" />
            <text x="7" y="17" fontSize="10" fill="white" fontWeight="bold">XLS</text>
        </svg>
    );
}

export function PdfIcon({ className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="18" rx="2" fill="#ef4444" />
            <text x="7" y="17" fontSize="10" fill="white" fontWeight="bold">PDF</text>
        </svg>
    );
}
