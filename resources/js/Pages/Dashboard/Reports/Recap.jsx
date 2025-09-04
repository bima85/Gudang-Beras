import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Table from "@/Components/Dashboard/Table";
import Button from "@/Components/Dashboard/Button";
import FilterIcon from "@/Components/Dashboard/FilterIcon";
import { ExcelIcon } from "@/Components/Dashboard/ExportIcons";

export default function Recap({
    transactions,
    totalCash = 0,
    totalTempo = 0,
    totalDeposit = 0,
    totalPenjualan = 0,
    balancing = false,
    start_date = "",
    end_date = "",
    kategoriProduk = {},
}) {
    const { errors } = usePage().props;
    const [start, setStart] = useState(start_date || "");
    const [end, setEnd] = useState(end_date || "");

    const formatPrice = (num) => "Rp " + (num || 0).toLocaleString("id-ID");

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route("dashboard.recap"), {
            start_date: start,
            end_date: end,
        });
    };

    const handleExport = () => {
        let csv = "Tanggal,Invoice,Kasir,Pelanggan,Total,Metode,Deposit\n";
        transactions.data.forEach((t) => {
            csv += `${t.created_at},${t.invoice},${t.cashier?.name || ""},${
                t.customer?.name || ""
            },${t.grand_total},${t.payment_method},${t.deposit_amount || 0}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rekap-transaksi.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Rekapan Transaksi & Neraca" />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold text-blue-700">
                    Rekapan Transaksi & Neraca
                </h1>
                <form
                    onSubmit={handleFilter}
                    className="flex gap-2 items-center bg-white p-2 rounded shadow"
                >
                    <Input
                        type="date"
                        label="Dari"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="min-w-[150px]"
                    />
                    <span className="mx-1">s/d</span>
                    <Input
                        type="date"
                        label="Sampai"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="min-w-[150px]"
                    />
                    <Button
                        type="submit"
                        label="Filter"
                        icon={<FilterIcon className="w-4 h-4" />}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow transition-all px-6 py-2 rounded-lg font-semibold flex items-center gap-2"
                    />
                </form>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-300 rounded shadow text-center">
                    <div className="text-gray-500 text-sm">Total Transaksi</div>
                    <div className="text-2xl font-bold text-blue-900">
                        {transactions.total}
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-100 to-green-300 rounded shadow text-center">
                    <div className="text-gray-500 text-sm">Total Penjualan</div>
                    <div className="text-2xl font-bold text-green-900">
                        {formatPrice(totalPenjualan)}
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded shadow text-center">
                    <div className="text-gray-500 text-sm">Cash</div>
                    <div className="text-2xl font-bold text-yellow-900">
                        {formatPrice(totalCash)}
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-100 to-pink-300 rounded shadow text-center">
                    <div className="text-gray-500 text-sm">Tempo</div>
                    <div className="text-2xl font-bold text-pink-900">
                        {formatPrice(totalTempo)}
                    </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-300 rounded shadow text-center">
                    <div className="text-gray-500 text-sm">Deposit</div>
                    <div className="text-2xl font-bold text-purple-900">
                        {formatPrice(totalDeposit)}
                    </div>
                </div>
            </div>
            <div className="p-4 bg-blue-50 rounded shadow mt-4 text-center">
                <div className="text-lg font-semibold mb-2">
                    Neraca Balancing
                </div>
                <div
                    className={
                        balancing
                            ? "text-green-600 font-bold"
                            : "text-red-600 font-bold"
                    }
                >
                    {balancing ? "NERACA SEIMBANG" : "NERACA TIDAK SEIMBANG"}
                </div>
                <div className="text-sm mt-2">
                    <span className="font-mono block">
                        Cash + Deposit + Tempo = Total Penjualan
                    </span>
                    <span className="font-mono block">
                        {formatPrice(totalCash)} + {formatPrice(totalDeposit)} +{" "}
                        {formatPrice(totalTempo)} ={" "}
                        {formatPrice(totalPenjualan)}
                    </span>
                </div>
            </div>
            <div className="flex justify-end mt-6 gap-2 flex-wrap">
                <Button
                    type="button"
                    label="Export CSV"
                    icon={<ExcelIcon className="w-5 h-5" />}
                    onClick={handleExport}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow w-full sm:w-auto"
                />
            </div>
            <div className="mt-8 bg-white rounded shadow p-4 overflow-x-auto">
                <div className="flex items-center justify-between w-full flex-wrap mb-2">
                    <span className="font-bold text-lg">Rekap Transaksi</span>
                </div>
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2">No</th>
                            <th className="px-3 py-2">Tanggal</th>
                            <th className="px-3 py-2">Invoice</th>
                            <th className="px-3 py-2">Kasir</th>
                            <th className="px-3 py-2">Pelanggan</th>
                            <th className="px-3 py-2 text-right">Total</th>
                            <th className="px-3 py-2">Metode</th>
                            <th className="px-3 py-2 text-right">Deposit</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {transactions.data.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="text-center py-4 text-gray-400"
                                >
                                    Tidak ada transaksi ditemukan
                                </td>
                            </tr>
                        ) : (
                            transactions.data.map((t, i) => (
                                <tr
                                    key={t.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition"
                                >
                                    <td className="px-3 py-2">
                                        {(transactions.current_page - 1) *
                                            transactions.per_page +
                                            i +
                                            1}
                                    </td>
                                    <td className="px-3 py-2">
                                        {t.created_at?.slice(0, 10)}
                                    </td>
                                    <td className="px-3 py-2 font-mono text-xs">
                                        {t.invoice}
                                    </td>
                                    <td className="px-3 py-2">
                                        {t.cashier?.name || "-"}
                                    </td>
                                    <td className="px-3 py-2">
                                        {t.customer?.name || "-"}
                                    </td>
                                    <td className="px-3 py-2 text-right font-semibold">
                                        {formatPrice(t.grand_total)}
                                    </td>
                                    <td className="px-3 py-2">
                                        {t.payment_method === "cash"
                                            ? "Cash"
                                            : t.payment_method === "tempo"
                                            ? "Tempo"
                                            : t.payment_method === "deposit"
                                            ? "Deposit"
                                            : "-"}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        {t.is_deposit
                                            ? formatPrice(t.deposit_amount ?? 0)
                                            : "-"}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {/* Pagination */}
                <div className="mt-4 flex justify-end gap-2 flex-wrap">
                    {transactions.links &&
                        transactions.links.map((link, i) => (
                            <Button
                                key={i}
                                label={link.label.replace(
                                    /&laquo;|&raquo;|&lsaquo;|&rsaquo;/g,
                                    ""
                                )}
                                onClick={() => link.url && router.get(link.url)}
                                disabled={!link.url}
                                className={
                                    link.active ? "bg-blue-500 text-white" : ""
                                }
                            />
                        ))}
                </div>
            </div>
            <div className="bg-white rounded shadow p-4 mb-6 mt-6">
                <div className="font-semibold mb-2">
                    Rekap Kategori Produk Transaksi (Realtime)
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-[300px] text-sm">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2">Kategori</th>
                                <th className="p-2">Qty Terjual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(kategoriProduk).length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="text-center py-4 text-gray-400"
                                    >
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                Object.entries(kategoriProduk).map(
                                    ([cat, qty], i) => (
                                        <tr
                                            key={i}
                                            className="border-b hover:bg-blue-50"
                                        >
                                            <td className="p-2">{cat}</td>
                                            <td className="p-2 text-right">
                                                {qty}
                                            </td>
                                        </tr>
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Recap.layout = (page) => <DashboardLayout children={page} />;
