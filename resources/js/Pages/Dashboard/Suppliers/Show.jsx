import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import Card from "@/Components/Dashboard/Card";
import { IconEyeBolt } from "@tabler/icons-react";

export default function Show({ supplier }) {
    return (
        <>
            <Head title={`Detail Supplier: ${supplier.name}`} />
            <Card
                title={`Detail Supplier: ${supplier.name}`}
                icon={<IconEyeBolt size={20} strokeWidth={1.5} />}
            >
                <div className="space-y-4">
                    <div>
                        <span className="font-semibold">Nama:</span>{" "}
                        {supplier.name}
                    </div>
                    <div>
                        <span className="font-semibold">No. Handphone:</span>{" "}
                        {supplier.phone || "-"}
                    </div>
                    <div>
                        <span className="font-semibold">Alamat:</span>{" "}
                        {supplier.address || "-"}
                    </div>
                </div>
                <div className="pt-6">
                    <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-800 transition"
                        onClick={() =>
                            (window.location.href = route("suppliers.index"))
                        }
                    >
                        Kembali
                    </button>
                </div>
            </Card>
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
