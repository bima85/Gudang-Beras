import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { ArrowLeft } from "lucide-react";

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
            <Button asChild variant="outline">
                <Link
                    href={route("dashboard")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Kembali ke Dashboard
                </Link>
            </Button>
        </div>
    );
}
