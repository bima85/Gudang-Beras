import React, { useState } from "react";
import { Head, usePage, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function RolesPermissions() {
    const { roles, permissions } = usePage().props;
    const [role, setRole] = useState(roles && roles[0] ? roles[0].name : "");
    const [permission, setPermission] = useState(
        permissions && permissions[0] ? permissions[0].name : ""
    );

    const assign = (e) => {
        e.preventDefault();
        router.post(route("admin.roles.permissions.assign"), {
            role,
            permission,
        });
    };

    const revoke = (e) => {
        e.preventDefault();
        router.post(route("admin.roles.permissions.revoke"), {
            role,
            permission,
        });
    };

    return (
        <>
            <Head title="Roles & Permissions" />
            <div className="p-4">
                <h1 className="text-xl font-bold mb-4">Roles & Permissions</h1>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium">
                            Role
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full"
                        >
                            {roles.map((r) => (
                                <option key={r.id} value={r.name}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium">
                            Permission
                        </label>
                        <select
                            value={permission}
                            onChange={(e) => setPermission(e.target.value)}
                            className="mt-1 block w-full"
                        >
                            {permissions.map((p) => (
                                <option key={p.id} value={p.name}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={assign}
                            className="px-4 py-2 bg-green-600 text-white rounded"
                        >
                            Assign
                        </button>
                        <button
                            onClick={revoke}
                            className="px-4 py-2 bg-red-600 text-white rounded"
                        >
                            Revoke
                        </button>
                    </div>
                </form>

                <div className="mt-6">
                    <h2 className="text-lg font-semibold">Current Roles</h2>
                    <ul>
                        {roles.map((r) => (
                            <li key={r.id} className="py-2">
                                <strong>{r.name}</strong>:{" "}
                                {r.permissions.map((p) => p.name).join(", ")}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

RolesPermissions.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
