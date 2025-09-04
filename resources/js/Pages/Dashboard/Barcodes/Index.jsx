import React from "react";
import Barcode from "react-barcode";
import { Head, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Dashboard/Button";

export default function Index({ barcodes }) {
    return (
        <>
            <Head title="Cetak Barcode" />
            <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Cetak Barcode
                </h1>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-x-auto border border-gray-100 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                No
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                Produk
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                Barcode
                            </th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {barcodes.data.length ? (
                            barcodes.data.map((barcode, i) => (
                                <tr
                                    key={barcode.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                >
                                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                        {i +
                                            1 +
                                            (barcodes.current_page - 1) *
                                                barcodes.per_page}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                        {barcode.product?.name || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-mono">
                                        <div className="flex flex-col items-start gap-1">
                                            <Barcode
                                                value={barcode.barcode}
                                                height={40}
                                                width={1.5}
                                                fontSize={12}
                                                displayValue={false}
                                            />
                                            <span className="font-mono text-xs">
                                                {barcode.barcode}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <Link
                                            href={route(
                                                "barcodes.print",
                                                barcode.id
                                            )}
                                        >
                                            <button className="bg-blue-600 text-white hover:bg-blue-800 dark:bg-blue-500 dark:hover:bg-blue-700 px-4 py-2 rounded shadow font-semibold border-2 border-blue-700 focus:outline focus:outline-2 focus:outline-blue-400">
                                                Cetak
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                                >
                                    Belum ada data barcode.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
