import React from "react";
import { Link, usePage } from "@inertiajs/react";

export default function BackToDashboard({ className = "" }) {
    const page = usePage();
    const auth = page.props?.auth || {};
    const roles = (auth.user?.roles || auth.roles || [])
        .map((r) => (typeof r === "string" ? r : r.name))
        .filter(Boolean);

    const isSuperAdmin = roles.some(
        (r) => String(r).toLowerCase() === "super-admin"
    );

    if (isSuperAdmin) return null;

    return (
        <div className={className}>
            <Link
                href={route("dashboard")}
                className="inline-block bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
            >
                Kembali ke Dashboard
            </Link>
        </div>
    );
}
