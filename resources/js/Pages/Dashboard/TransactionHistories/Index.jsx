import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Button from "@/Components/Dashboard/Button";
import { ExcelIcon, PdfIcon } from "@/Components/Dashboard/ExportIcons";
import { Plus } from "lucide-react";

export default function Index({
    transactions,
    sidebarOpen,
    filters = {},
    tokos = [],
}) {
    // State untuk filter
    const [dateFrom, setDateFrom] = useState(filters.from || "");
    const [dateTo, setDateTo] = useState(filters.to || "");
    const [tokoId, setTokoId] = useState(filters.toko_id || "");
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(false);

    const formatPrice = (value) => {
        if (!value) return "-";
        return `Rp ${Number(value).toLocaleString("id-ID")}`;
    };

    // Alternative simple price formatter without currency symbol
    const formatNumber = (value) => {
        if (!value) return "-";
        return Number(value).toLocaleString("id-ID");
    }; // Fungsi untuk toggle expand/collapse
    const toggleExpand = (product) => {
        setExpanded((prev) => ({ ...prev, [product]: !prev[product] }));
    };

    // Validasi tanggal
    const isValidDateRange = () => {
        if (!dateFrom || !dateTo) return true;
        return new Date(dateFrom) <= new Date(dateTo);
    };

    // Helper function to format quantity
    const formatQuantity = (qty) => {
        if (qty === null || qty === undefined) return "-";
        const number = Number(qty);
        if (isNaN(number)) return "-";

        if (number % 1 === 0) {
            return number.toString();
        }

        return parseFloat(number.toFixed(2)).toString();
    };

    // Logika pengelompokan berdasarkan produk
    const renderProductGroupedTable = () => {
        if (!transactions.data || transactions.data.length === 0) {
            return (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                    <svg
                        className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <p className="mt-2 text-sm">
                        Tidak ada data transaksi yang ditemukan.
                    </p>
                </div>
            );
        }

        const grouped = {};
        transactions.data.forEach((trx) => {
            const productName = trx.product?.name || "-";
            if (!grouped[productName]) grouped[productName] = [];
            grouped[productName].push(trx);
        });

        const products = Object.keys(grouped);

        return (
            <table className="min-w-full bg-white border dark:bg-gray-800 rounded-xl dark:border-gray-700">
                <thead>
                    <tr className="text-gray-800 bg-gray-100 dark:bg-gray-700 dark:text-gray-200">
                        <th className="px-4 py-3 text-sm font-semibold text-left">
                            Produk
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-left">
                            Jumlah Transaksi
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-left">
                            Total Qty
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-left">
                            Total Nominal
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-center">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => {
                        const trxs = grouped[product];
                        const totalQty = trxs.reduce(
                            (sum, t) => sum + Number(t.quantity || 0),
                            0
                        );
                        const totalNominal = trxs.reduce(
                            (sum, t) => sum + Number(t.subtotal || 0),
                            0
                        );
                        return (
                            <React.Fragment key={product}>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                                        <button
                                            className="mr-2 text-blue-600 hover:underline"
                                            onClick={() =>
                                                toggleExpand(product)
                                            }
                                            type="button"
                                        >
                                            {expanded[product] ? "▼" : "►"}
                                        </button>
                                        {product}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                        {trxs.length}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                        {formatQuantity(totalQty)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                        {formatPrice(totalNominal)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {/* Tambahkan aksi jika diperlukan */}
                                    </td>
                                </tr>
                                {expanded[product] && (
                                    <tr>
                                        <td colSpan={5} className="p-0">
                                            <div className="p-2 overflow-x-auto">
                                                <table className="w-full min-w-full text-xs text-left border border-gray-200 dark:border-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-2 py-1 border">
                                                                Tanggal
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Jenis
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Qty
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Satuan
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Harga
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Subtotal
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Kategori
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Subkategori
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Lokasi
                                                            </th>
                                                            <th className="px-2 py-1 text-center border">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {trxs.map((trx) => (
                                                            <tr
                                                                key={trx.id}
                                                                className="border-b"
                                                            >
                                                                <td className="px-2 py-1 border">
                                                                    {trx.transaction_date
                                                                        ? new Date(
                                                                              trx.transaction_date
                                                                          ).toLocaleDateString(
                                                                              "id-ID",
                                                                              {
                                                                                  day: "2-digit",
                                                                                  month: "long",
                                                                                  year: "numeric",
                                                                              }
                                                                          )
                                                                        : "-"}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900 dark:text-blue-200">
                                                                        {
                                                                            trx.transaction_type
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {formatQuantity(
                                                                        trx.quantity
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {trx.unit ||
                                                                        "-"}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {trx.price
                                                                        ? formatPrice(
                                                                              trx.price
                                                                          )
                                                                        : "-"}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {trx.subtotal
                                                                        ? formatPrice(
                                                                              trx.subtotal
                                                                          )
                                                                        : "-"}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {trx.product
                                                                        ?.category
                                                                        ?.name ||
                                                                        "-"}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {trx.product
                                                                        ?.subcategory
                                                                        ?.name ||
                                                                        "-"}
                                                                </td>
                                                                <td className="px-2 py-1 border">
                                                                    {trx.toko ? (
                                                                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-200">
                                                                            🏪{" "}
                                                                            {
                                                                                trx
                                                                                    .toko
                                                                                    .name
                                                                            }
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-400">
                                                                            -
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td className="px-2 py-1 text-center border">
                                                                    <div className="flex justify-center gap-1">
                                                                        <Button
                                                                            type="button"
                                                                            label={
                                                                                <span className="text-blue-600">
                                                                                    Lihat
                                                                                </span>
                                                                            }
                                                                            className="px-2 py-1 text-xs text-blue-600 bg-transparent rounded hover:bg-blue-100 dark:hover:bg-blue-900"
                                                                            onClick={() => {
                                                                                router.get(
                                                                                    route(
                                                                                        "transaction-histories.show",
                                                                                        trx.id
                                                                                    )
                                                                                );
                                                                            }}
                                                                        />
                                                                        <Button
                                                                            type="button"
                                                                            label={
                                                                                <span className="text-red-600">
                                                                                    Hapus
                                                                                </span>
                                                                            }
                                                                            className="px-2 py-1 text-xs text-red-600 bg-transparent rounded hover:bg-red-100 dark:hover:bg-red-900"
                                                                            onClick={() => {
                                                                                if (
                                                                                    confirm(
                                                                                        "Yakin ingin menghapus transaksi ini?"
                                                                                    )
                                                                                ) {
                                                                                    router.delete(
                                                                                        route(
                                                                                            "transaction-histories.destroy",
                                                                                            trx.id
                                                                                        ),
                                                                                        {
                                                                                            preserveScroll: true,
                                                                                        }
                                                                                    );
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr className="bg-green-100 border-t-2 border-green-300 dark:bg-green-900 dark:border-green-700">
                        <td
                            colSpan="2"
                            className="px-4 py-3 text-lg font-bold text-left text-green-800 dark:text-green-200"
                        >
                            Total Keseluruhan
                        </td>
                        <td
                            colSpan="1"
                            className="px-4 py-3 text-lg font-bold text-left text-green-800 dark:text-green-200"
                        >
                            {formatQuantity(
                                transactions.data.reduce(
                                    (sum, trx) =>
                                        sum + Number(trx.quantity || 0),
                                    0
                                )
                            )}
                        </td>
                        <td
                            colSpan="2"
                            className="px-4 py-3 text-lg font-bold text-right text-green-800 dark:text-green-200"
                        >
                            {formatPrice(
                                transactions.data.reduce(
                                    (sum, trx) =>
                                        sum + Number(trx.subtotal || 0),
                                    0
                                )
                            )}
                        </td>
                    </tr>
                </tfoot>
            </table>
        );
    };

    const handleFilter = () => {
        if (!isValidDateRange()) {
            alert("Tanggal awal harus sebelum atau sama dengan tanggal akhir.");
            return;
        }
        setLoading(true);
        router.get(
            route("transaction-histories.index"),
            {
                ...(dateFrom ? { from: dateFrom } : {}),
                ...(dateTo ? { to: dateTo } : {}),
                ...(tokoId ? { toko_id: tokoId } : {}),
            },
            {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <>
            <Head title="Histori Transaksi" />
            <div className="min-h-screen p-6 bg-gray-100 dark:bg-gray-900">
                {/* Tombol Export & Cetak */}
                <div className="flex flex-wrap justify-end gap-3 mb-4">
                    <Button
                        type="button"
                        label={
                            <span className="flex items-center gap-2">
                                <PdfIcon className="w-5 h-5" /> Export PDF
                            </span>
                        }
                        onClick={() => {
                            window.open(
                                route("transaction-histories.export.pdf"),
                                "_blank"
                            );
                        }}
                        className="px-4 py-2 text-white transition-colors bg-red-600 rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                    />
                    <Button
                        type="button"
                        label={
                            <span className="flex items-center gap-2">
                                <ExcelIcon className="w-5 h-5" /> Export Excel
                            </span>
                        }
                        onClick={() => {
                            window.open(
                                route("transaction-histories.export.excel"),
                                "_blank"
                            );
                        }}
                        className="px-4 py-2 text-white transition-colors bg-green-600 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                    />
                    <Button
                        type="button"
                        label={
                            <span className="flex items-center gap-2">
                                <Plus className="w-5 h-5" /> Tambah Transaksi
                            </span>
                        }
                        onClick={() => {
                            router.get(route("transaction-histories.create"));
                        }}
                        className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                    />
                </div>

                {/* Filter Section */}
                <div className="p-6 mb-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                    <h2 className="pb-2 mb-6 text-xl font-semibold text-gray-800 border-b dark:text-gray-200">
                        Filter Histori Transaksi
                    </h2>
                    <div className="grid items-end grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Tanggal Awal
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm text-gray-700 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-blue-600 min-h-[42px]"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm text-gray-700 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-blue-600 min-h-[42px]"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Toko
                            </label>
                            <InputSelect
                                label="Toko"
                                data={tokos}
                                selected={
                                    tokos.find((t) => t.id == tokoId) || null
                                }
                                setSelected={(t) => setTokoId(t ? t.id : "")}
                                displayKey="name"
                                placeholder="Semua Toko"
                                className="min-w-[180px]"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            type="button"
                            label="Filter"
                            onClick={handleFilter}
                            className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            label="Reset"
                            onClick={() => {
                                setDateFrom("");
                                setDateTo("");
                                setTokoId("");
                                router.get(
                                    route("transaction-histories.index")
                                );
                            }}
                            className="px-4 py-2 text-gray-700 transition-colors bg-gray-300 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        />
                    </div>
                </div>

                {/* Tabel Histori Transaksi */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-4 text-center">Memuat data...</div>
                    ) : (
                        renderProductGroupedTable()
                    )}
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
