import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import {
    IconBox,
    IconCategory,
    IconMoneybag,
    IconUsers,
} from "@tabler/icons-react";
import React from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

export default function Dashboard({
    summary = {},
    omzet7Hari = [],
    transaksiTerakhir = [],
    kategoriProduk = {},
    pageTitle = "Dashboard",
}) {
    const { auth, location } = usePage().props;
    const roles = auth?.user?.roles || [];
    const isGudang =
        (location && String(location).toLowerCase().includes("gudang")) ||
        roles.some((r) => r.name === "gudang");
    const locationText = location
        ? location
        : isGudang
        ? "Gudang"
        : roles[0]
        ? roles[0].name
        : "-";

    const formatPrice = (num) => "Rp " + (num || 0).toLocaleString("id-ID");

    const chartData = {
        labels: Array.isArray(omzet7Hari)
            ? omzet7Hari.map((o) => o.tanggal)
            : [],
        datasets: [
            {
                label: "Omzet",
                data: Array.isArray(omzet7Hari)
                    ? omzet7Hari.map((o) => o.omzet)
                    : [],
                fill: true,
                backgroundColor: "rgba(59,130,246,0.1)",
                borderColor: "#2563eb",
                tension: 0.3,
            },
        ],
    };

    return (
        <>
            <Head title={pageTitle ?? "Dashboard"} />
            <div className="mb-6">
                <Card>
                    <CardHeader className="p-6 text-white bg-gradient-to-r from-blue-500 to-violet-500">
                        <div>
                            <CardTitle className="text-2xl font-extrabold md:text-3xl">
                                {pageTitle ?? "Dashboard"}, {auth.user.name}{" "}
                                <span className="ml-2">🎉</span>
                            </CardTitle>
                            <div className="mt-1 text-sm md:text-base opacity-90">
                                Lokasi kamu saat ini:{" "}
                                <span className="font-semibold">
                                    {locationText}
                                </span>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-500">
                                Kategori
                            </div>
                            <div className="text-2xl font-extrabold text-gray-800">
                                {summary.totalKategori}
                            </div>
                        </div>
                        <IconCategory size={28} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-500">
                                Produk
                            </div>
                            <div className="text-2xl font-extrabold text-gray-800">
                                {summary.totalProduk}
                            </div>
                        </div>
                        <IconBox size={28} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-500">
                                Transaksi
                            </div>
                            <div className="text-2xl font-extrabold text-gray-800">
                                {summary.totalTransaksi}
                            </div>
                        </div>
                        <IconMoneybag size={28} />
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-semibold text-gray-500">
                                Pengguna
                            </div>
                            <div className="text-2xl font-extrabold text-gray-800">
                                {summary.totalPelanggan}
                            </div>
                        </div>
                        <IconUsers size={28} />
                    </CardContent>
                </Card>
            </div>

            <div className="p-4 mb-6 overflow-x-auto bg-white rounded shadow">
                <div className="mb-2 text-lg font-bold text-blue-800">
                    Grafik Omzet 7 Hari Terakhir
                </div>
                <div className="w-full min-w-[300px]">
                    <Line data={chartData} height={80} />
                </div>
            </div>

            <div className="p-4 overflow-x-auto bg-white rounded shadow">
                <div className="mb-2 text-lg font-bold text-blue-800">
                    10 Transaksi Terakhir
                </div>
                <div className="w-full min-w-[300px]">
                    <table className="min-w-[300px] w-full text-sm font-inter text-gray-700">
                        <thead>
                            <tr className="text-base font-semibold text-blue-800 bg-blue-50">
                                <th className="p-2">Tanggal</th>
                                <th className="p-2">Invoice</th>
                                <th className="p-2">Kasir</th>
                                <th className="p-2">Pelanggan</th>
                                <th className="p-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transaksiTerakhir.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-4 font-normal text-center text-gray-400"
                                    >
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                transaksiTerakhir.map((t, i) => (
                                    <tr
                                        key={i}
                                        className="text-base font-medium border-b hover:bg-blue-50"
                                    >
                                        <td className="p-2 whitespace-nowrap">
                                            {t.created_at?.slice(0, 10)}
                                        </td>
                                        <td className="p-2 font-mono text-xs">
                                            {t.invoice}
                                        </td>
                                        <td className="p-2">
                                            {t.cashier?.name || "-"}
                                        </td>
                                        <td className="p-2">
                                            {t.customer?.name || "-"}
                                        </td>
                                        <td className="p-2 text-right">
                                            {formatPrice(t.grand_total)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="p-4 mt-6 mb-6 overflow-x-auto bg-white rounded shadow">
                <div className="mb-2 text-lg font-bold text-blue-800">
                    Rekap Kategori Produk Transaksi Hari Ini (Realtime)
                </div>
                <div className="w-full min-w-[200px]">
                    <table className="min-w-[200px] w-full text-sm font-inter text-gray-700">
                        <thead>
                            <tr className="text-base font-semibold text-blue-800 bg-blue-50">
                                <th className="p-2">Kategori</th>
                                <th className="p-2">Qty Terjual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(kategoriProduk).length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="py-4 font-normal text-center text-gray-400"
                                    >
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                Object.entries(kategoriProduk).map(
                                    ([cat, qty], i) => (
                                        <tr
                                            key={i}
                                            className="text-base font-medium border-b hover:bg-blue-50"
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

Dashboard.layout = (page) => <DashboardLayout children={page} />;
