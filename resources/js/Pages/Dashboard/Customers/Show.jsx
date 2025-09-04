import React from "react";
import { Head, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { IconArrowLeft } from "@tabler/icons-react";
import Button from "@/Components/Dashboard/Button";

export default function Show({ customer, depositHistory }) {
    const { errors } = usePage().props;

    return (
        <DashboardLayout>
            <Head
                title={`Detail Pelanggan - ${customer.name || "Pelanggan"}`}
            />
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Detail Pelanggan
                    </h1>
                    <Button
                        type="link"
                        href={route("customers.index")}
                        icon={<IconArrowLeft size={20} />}
                        label="Kembali"
                        className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-md shadow-sm transition-colors"
                    />
                </div>

                {errors && Object.keys(errors).length > 0 && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
                        {Object.values(errors).map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Nama
                            </label>
                            <p className="mt-1 text-gray-900">
                                {customer.name || "-"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                No. Handphone
                            </label>
                            <p className="mt-1 text-gray-900">
                                {customer.no_telp || "-"}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600">
                                Alamat
                            </label>
                            <p className="mt-1 text-gray-900">
                                {customer.address || "-"}
                            </p>
                        </div>
                        {typeof customer.deposit !== "undefined" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600">
                                    Deposit
                                </label>
                                <p className="mt-1 text-gray-900">
                                    {customer.deposit}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {depositHistory && depositHistory.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Riwayat Deposit
                        </h2>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Invoice
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                        Nominal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {depositHistory.map((item, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-2">
                                            {item.created_at}
                                        </td>
                                        <td className="px-4 py-2">
                                            {item.invoice}
                                        </td>
                                        <td className="px-4 py-2">
                                            Rp{" "}
                                            {Number(
                                                item.grand_total
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
