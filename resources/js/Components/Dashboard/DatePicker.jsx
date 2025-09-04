import React from "react";

export default function DatePicker({ value, onChange, className }) {
    return (
        <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border border-gray-300 dark:border-gray-600 text-sm rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ${className}`}
        />
    );
}
