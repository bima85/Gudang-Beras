import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Button from "@/Components/Dashboard/Button";
import { ExcelIcon, PdfIcon } from "@/Components/Dashboard/ExportIcons";

export default function Transactions({
    transactions = { data: [] },
    cashiers = [],
    customers = [],
    filters = {},
}) {
    // State untuk filter dan pengelompokan
    const [dateFrom, setDateFrom] = useState(filters.date_from || "");
    const [dateTo, setDateTo] = useState(filters.date_to || "");
    const [cashierId, setCashierId] = useState(filters.cashier_id || "");
    const [customerId, setCustomerId] = useState(filters.customer_id || "");
    const [expanded, setExpanded] = useState({});
    const [loading, setLoading] = useState(false);

    // Fungsi untuk membersihkan dan memformat harga
    const cleanNumber = (value) => {
        if (typeof value === "string") {
            return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
        }
        return parseFloat(value) || 0;
    };

    const formatPrice = (value) => {
        const cleanedValue = cleanNumber(value);
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(cleanedValue);
    };

    // Fungsi untuk toggle expand/collapse
    const toggleExpand = (customer) => {
        setExpanded((prev) => ({ ...prev, [customer]: !prev[customer] }));
    };

    // Validasi tanggal
    const isValidDateRange = () => {
        if (!dateFrom || !dateTo) return true;
        return new Date(dateFrom) <= new Date(dateTo);
    };

    // Logika pengelompokan berdasarkan pelanggan
    const renderCustomerGroupedTable = () => {
        if (!transactions.data || transactions.data.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
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
            const customerName = trx.customer?.name || "-";
            if (!grouped[customerName]) grouped[customerName] = [];
            grouped[customerName].push(trx);
        });

        const customers = Object.keys(grouped);

        return (
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700">
                <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Pelanggan
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Jumlah Transaksi
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">
                            Total Nominal
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => {
                        const trxs = grouped[customer];
                        const totalNominal = trxs.reduce(
                            (sum, t) => sum + cleanNumber(t.grand_total),
                            0
                        );
                        return (
                            <React.Fragment key={customer}>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-100">
                                        <button
                                            className="mr-2 text-blue-600 hover:underline"
                                            onClick={() =>
                                                toggleExpand(customer)
                                            }
                                            type="button"
                                        >
                                            {expanded[customer] ? "▼" : "►"}
                                        </button>
                                        {customer}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                        {trxs.length}
                                    </td>
                                    <td className="px-4 py-3 text-gray-800 dark:text-gray-100">
                                        {formatPrice(totalNominal)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {/* Tambahkan aksi jika diperlukan */}
                                    </td>
                                </tr>
                                {expanded[customer] && (
                                    <tr>
                                        <td colSpan={4} className="p-0">
                                            <div className="overflow-x-auto p-2">
                                                <table className="min-w-full w-full text-xs text-left border border-gray-200 dark:border-gray-700">
                                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                                        <tr>
                                                            <th className="px-2 py-1 border">
                                                                Tanggal
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Kasir
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Produk
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
                                                                Metode
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Diskon
                                                            </th>
                                                            <th className="px-2 py-1 border">
                                                                Kembalian
                                                            </th>
                                                            <th className="px-2 py-1 border text-center">
                                                                Aksi
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {trxs.map((trx) =>
                                                            (
                                                                trx.details ||
                                                                []
                                                            ).map((item, i) => (
                                                                <tr
                                                                    key={
                                                                        trx.id +
                                                                        "-" +
                                                                        (item.id ||
                                                                            i)
                                                                    }
                                                                    className="border-b"
                                                                >
                                                                    <td className="px-2 py-1 border">
                                                                        {i === 0
                                                                            ? new Date(
                                                                                  trx.created_at
                                                                              ).toLocaleDateString(
                                                                                  "id-ID",
                                                                                  {
                                                                                      day: "2-digit",
                                                                                      month: "long",
                                                                                      year: "numeric",
                                                                                  }
                                                                              )
                                                                            : ""}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {i === 0
                                                                            ? trx
                                                                                  .cashier
                                                                                  ?.name ||
                                                                              "-"
                                                                            : ""}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {item
                                                                            .product
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {item.qty ??
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {item
                                                                            .unit
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {item.price
                                                                            ? formatPrice(
                                                                                  item.price
                                                                              )
                                                                            : "-"}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {item.subtotal
                                                                            ? formatPrice(
                                                                                  item.subtotal
                                                                              )
                                                                            : "-"}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {i === 0
                                                                            ? trx.payment_method ===
                                                                              "cash"
                                                                                ? "Cash"
                                                                                : trx.payment_method ===
                                                                                  "tempo"
                                                                                ? "Tempo"
                                                                                : trx.payment_method ===
                                                                                  "deposit"
                                                                                ? "Deposit"
                                                                                : "-"
                                                                            : ""}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {i === 0
                                                                            ? formatPrice(
                                                                                  trx.discount
                                                                              )
                                                                            : ""}
                                                                    </td>
                                                                    <td className="px-2 py-1 border">
                                                                        {i === 0
                                                                            ? formatPrice(
                                                                                  trx.change
                                                                              )
                                                                            : ""}
                                                                    </td>
                                                                    <td className="px-2 py-1 border text-center">
                                                                        {i ===
                                                                            0 && (
                                                                            <Button
                                                                                type="button"
                                                                                label={
                                                                                    <span className="text-red-600">
                                                                                        Hapus
                                                                                    </span>
                                                                                }
                                                                                className="bg-transparent hover:bg-red-100 dark:hover:bg-red-900 text-red-600 px-2 py-1 rounded"
                                                                                onClick={() => {
                                                                                    if (
                                                                                        confirm(
                                                                                            "Yakin ingin menghapus transaksi ini?"
                                                                                        )
                                                                                    ) {
                                                                                        router.delete(
                                                                                            route(
                                                                                                "transactions.delete",
                                                                                                trx.id
                                                                                            ),
                                                                                            {
                                                                                                preserveScroll: true,
                                                                                            }
                                                                                        );
                                                                                    }
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
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
                    <tr className="bg-green-100 dark:bg-green-900 border-t-2 border-green-300 dark:border-green-700">
                        <td
                            colSpan="1"
                            className="px-4 py-3 font-bold text-left text-green-800 dark:text-green-200 text-lg"
                        >
                            Total Keseluruhan
                        </td>
                        <td
                            colSpan="1"
                            className="px-4 py-3 font-bold text-left text-green-800 dark:text-green-200 text-lg"
                        >
                            {transactions.data.length}
                        </td>
                        <td
                            colSpan="2"
                            className="px-4 py-3 font-bold text-right text-green-800 dark:text-green-200 text-lg"
                        >
                            {formatPrice(
                                transactions.data.reduce(
                                    (sum, trx) =>
                                        sum + cleanNumber(trx.grand_total),
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
            route("reports.transactions"),
            {
                ...(dateFrom ? { date_from: dateFrom } : {}),
                ...(dateTo ? { date_to: dateTo } : {}),
                ...(cashierId ? { cashier_id: cashierId } : {}),
                ...(customerId ? { customer_id: customerId } : {}),
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
            <Head title="Laporan Transaksi" />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
                {/* Tombol Export & Cetak */}
                <div className="flex flex-wrap gap-3 mb-4 justify-end">
                    <Button
                        type="button"
                        label={
                            <span className="flex items-center gap-2">
                                <PdfIcon className="w-5 h-5" /> Export PDF
                            </span>
                        }
                        onClick={() => {
                            window.open(
                                route("reports.transactions.export-pdf"),
                                "_blank"
                            );
                        }}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 transition-colors"
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
                                route("reports.transactions.export-excel"),
                                "_blank"
                            );
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                    />
                    <Button
                        type="button"
                        label={
                            <span className="flex items-center gap-2">
                                <i className="fa fa-print" /> Cetak
                            </span>
                        }
                        onClick={() => window.print()}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 transition-colors"
                    />
                </div>

                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">
                        Filter Laporan Transaksi
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
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
                                Kasir
                            </label>
                            <InputSelect
                                label="Kasir"
                                data={cashiers}
                                selected={
                                    cashiers.find((c) => c.id == cashierId) ||
                                    null
                                }
                                setSelected={(c) => setCashierId(c ? c.id : "")}
                                displayKey="name"
                                placeholder="Semua Kasir"
                                className="min-w-[180px]"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Pelanggan
                            </label>
                            <InputSelect
                                label="Pelanggan"
                                data={customers}
                                selected={
                                    customers.find((c) => c.id == customerId) ||
                                    null
                                }
                                setSelected={(c) =>
                                    setCustomerId(c ? c.id : "")
                                }
                                displayKey="name"
                                placeholder="Semua Pelanggan"
                                className="min-w-[180px]"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button
                            type="button"
                            label="Filter"
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                            disabled={loading}
                        />
                        <Button
                            type="button"
                            label="Reset"
                            onClick={() => {
                                setDateFrom("");
                                setDateTo("");
                                setCashierId("");
                                setCustomerId("");
                                router.get(route("reports.transactions"));
                            }}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                        />
                    </div>
                </div>

                {/* Tabel Laporan Transaksi */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-4">Memuat data...</div>
                    ) : (
                        renderCustomerGroupedTable()
                    )}
                </div>
            </div>
        </>
    );
}

Transactions.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
