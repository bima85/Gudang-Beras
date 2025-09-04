import React from "react";

export default function Empty({ colSpan = 1, message }) {
    return (
        <tr>
            <td
                colSpan={colSpan}
                className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm"
            >
                {message}
            </td>
        </tr>
    );
}
