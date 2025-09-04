import React, { useState } from "react";
import { Head, usePage } from "@inertiajs/react";
import Pagination from "@/Components/Dashboard/Pagination";
import Search from "@/Components/Dashboard/Search";
import {
    Table,
    Card,
    Thead,
    Tbody,
    Th,
    Td,
    Empty,
} from "@/Components/Dashboard/Table";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { IconDatabaseOff } from "@tabler/icons-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { route } from "ziggy-js";
import { Ziggy } from "@/ziggy";

export default function Index() {
    const { permissions } = usePage().props;
    const [processingReset, setProcessingReset] = useState(false);
    const [processingSync, setProcessingSync] = useState(false);

    const buildUrl = (
        routeName,
        fallbackPath = "/dashboard/permissions/reset-cache"
    ) => {
        let url = fallbackPath;
        try {
            url = route(routeName, {}, true, Ziggy);
            if (url && url.startsWith("http")) {
                try {
                    const parsed = new URL(url);
                    const pageOrigin = window.location.origin.replace(
                        /\/$/,
                        ""
                    );
                    if (parsed.origin !== pageOrigin) {
                        url =
                            pageOrigin +
                            parsed.pathname +
                            parsed.search +
                            parsed.hash;
                    }
                } catch (e) {
                    // ignore parsing errors
                }
            }
        } catch (e) {
            try {
                const p = route(routeName);
                if (p && p.startsWith("http")) url = p;
                else {
                    const pageOrigin = window.location.origin.replace(
                        /\/$/,
                        ""
                    );
                    url = pageOrigin + (p || fallbackPath);
                }
            } catch (e2) {
                const pageOrigin = window.location.origin.replace(/\/$/, "");
                url = pageOrigin + fallbackPath;
            }
        }
        return url;
    };

    const handleResetCache = async () => {
        if (
            !window.confirm(
                "Reset permission cache? This will clear cached permissions for the app."
            )
        )
            return;
        try {
            setProcessingReset(true);
            const url = buildUrl("permissions.resetCache");
            const res = await axios.post(url);
            if (res && res.data && res.data.success)
                toast.success(res.data.message || "Permission cache reset");
            else if (res && res.status === 204)
                toast.success("Permission cache reset");
            else toast.success("Permission cache reset (no details)");
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                "Failed to reset permission cache";
            toast.error(msg);
        } finally {
            setProcessingReset(false);
        }
    };

    const handleSyncRole = async () => {
        const role = window.prompt(
            "Enter role name to sync permissions for (exact):"
        );
        if (!role) return;

        const permsInput = window.prompt(
            "Enter permissions for this role as a comma-separated list (e.g. view_products,create_products):"
        );
        if (!permsInput) return;

        const permissions = permsInput
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean);
        if (!permissions.length) {
            toast.error("No valid permissions provided");
            return;
        }

        try {
            setProcessingSync(true);
            const url = buildUrl(
                "permissions.syncRole",
                "/dashboard/permissions/sync-role"
            );
            const res = await axios.post(url, { role, permissions });
            if (res && res.data && res.data.success) {
                toast.success(
                    res.data.message ||
                        `Role ${res.data.role || role} synced (${
                            permissions.length
                        } perms)`
                );
            } else if (res && res.status === 204) {
                toast.success("Role permissions synced");
            } else {
                toast.success("Sync request submitted");
            }
        } catch (err) {
            console.error(err);
            const msg =
                err?.response?.data?.message ||
                "Failed to sync role permissions";
            toast.error(msg);
        } finally {
            setProcessingSync(false);
        }
    };

    return (
        <>
            <Head title="Has Akses" />
            <div className="mb-5">
                <Search
                    url={route("permissions.index")}
                    placeholder="Cari data berdasarkan nama hak akses..."
                />
                <div className="mt-3 flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={handleSyncRole}
                        disabled={processingSync}
                        className="inline-flex items-center px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                    >
                        {processingSync
                            ? "Syncing..."
                            : "Sync Role Permissions"}
                    </button>
                    <button
                        type="button"
                        onClick={handleResetCache}
                        disabled={processingReset}
                        className="inline-flex items-center px-3 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 disabled:opacity-50"
                    >
                        {processingReset
                            ? "Resetting..."
                            : "Reset Permission Cache"}
                    </button>
                </div>
            </div>

            <Card title={"Data Hak Akses"}>
                <Table>
                    <Thead>
                        <tr>
                            <Th className="w-10">No</Th>
                            <Th>Nama Hak Akses</Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {permissions.data.length ? (
                            permissions.data.map((permission, i) => (
                                <tr
                                    className="hover:bg-gray-100 dark:hover:bg-gray-900"
                                    key={i}
                                >
                                    <Td className="text-center">
                                        {++i +
                                            (permissions.current_page - 1) *
                                                permissions.per_page}
                                    </Td>
                                    <Td>{permission.name}</Td>
                                </tr>
                            ))
                        ) : (
                            <Empty
                                colSpan={2}
                                message={
                                    <>
                                        <div className="flex justify-center items-center text-center mb-2">
                                            <IconDatabaseOff
                                                size={24}
                                                strokeWidth={1.5}
                                                className="text-gray-500 dark:text-white"
                                            />
                                        </div>
                                        <span className="text-gray-500">
                                            Data hak akses
                                        </span>{" "}
                                        <span className="text-rose-500 underline underline-offset-2">
                                            tidak ditemukan.
                                        </span>
                                    </>
                                }
                            />
                        )}
                    </Tbody>
                </Table>
            </Card>
            {permissions.last_page !== 1 && (
                <Pagination links={permissions.links} />
            )}
        </>
    );
}
Index.layout = (page) => <DashboardLayout children={page} />;
