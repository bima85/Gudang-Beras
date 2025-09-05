import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import axios from "axios";
import Button from "@/Components/Dashboard/Button";

export default function Index() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState({});
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = () => {
        setLoading(true);
        axios
            .get(route("stock-requests.index"))
            .then((res) => {
                setRequests(res.data.data || []);
            })
            .finally(() => setLoading(false));
    };

    const updateStatus = async (id, status) => {
        setError(null);
        setSuccess(null);
        setProcessing((p) => ({ ...p, [id]: true }));
        try {
            const res = await axios.patch(route("stock-requests.update", id), {
                status,
            });
            setSuccess(res.data?.message || "Status updated");
            await fetchRequests();
        } catch (e) {
            // extract message
            const msg =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to update status";
            setError(msg);
        } finally {
            setProcessing((p) => ({ ...p, [id]: false }));
        }
    };

    return (
        <>
            <Head title="Permintaan Stok" />
            <div className="p-4">
                <h1 className="text-xl font-semibold mb-4">
                    Daftar Permintaan Stok
                </h1>
                {loading && <div>Loading...</div>}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded">
                        {success}
                    </div>
                )}
                {!loading && (
                    <div className="space-y-2">
                        {requests.map((r) => (
                            <div
                                key={r.id}
                                className="p-3 bg-white rounded shadow"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <div className="font-semibold">
                                            {r.product?.name || r.product_id} x{" "}
                                            {r.qty}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Requester:{" "}
                                            {r.requester?.name ||
                                                r.requester_id}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            Status: {r.status}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {r.status === "pending" && (
                                            <>
                                                <Button
                                                    type="button"
                                                    label={
                                                        processing[r.id]
                                                            ? "Processing..."
                                                            : "Approve"
                                                    }
                                                    className="bg-teal-500"
                                                    onClick={() =>
                                                        updateStatus(
                                                            r.id,
                                                            "approved"
                                                        )
                                                    }
                                                    disabled={
                                                        !!processing[r.id]
                                                    }
                                                />
                                                <Button
                                                    type="button"
                                                    label={
                                                        processing[r.id]
                                                            ? "Processing..."
                                                            : "Reject"
                                                    }
                                                    className="bg-red-500"
                                                    onClick={() =>
                                                        updateStatus(
                                                            r.id,
                                                            "rejected"
                                                        )
                                                    }
                                                    disabled={
                                                        !!processing[r.id]
                                                    }
                                                />
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
