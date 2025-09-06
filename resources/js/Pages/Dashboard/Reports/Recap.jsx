import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    CalendarIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    DollarSignIcon,
    CreditCardIcon,
    ClockIcon,
    PiggyBankIcon,
    ShoppingCartIcon,
    ShoppingBagIcon,
    BarChart3Icon,
    FileDownIcon,
    FilterIcon,
    CheckCircleIcon,
    AlertCircleIcon,
} from "lucide-react";

export default function Recap({
    transactions,
    purchases = [],
    totalCash = 0,
    totalTempo = 0,
    totalDeposit = 0,
    totalPenjualan = 0,
    totalPembelian = 0,
    labaKotor = 0,
    persentaseLaba = 0,
    balancing = false,
    start_date = "",
    end_date = "",
    kategoriProduk = {},
}) {
    const { errors } = usePage().props;
    const [start, setStart] = useState(start_date || "");
    const [end, setEnd] = useState(end_date || "");

    const formatPrice = (num) => "Rp " + (num || 0).toLocaleString("id-ID");
    const formatPercent = (num) => (num || 0).toFixed(2) + "%";

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
            <Head title="Laporan Laba Rugi & Rekapitulasi" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Laporan Laba Rugi & Rekapitulasi
                    </h1>
                    <p className="text-gray-600">
                        Analisis performa keuangan dan transaksi bisnis
                    </p>
                </div>

                {/* Filter Form */}
                <Card className="lg:w-auto w-full">
                    <CardContent className="p-4">
                        <form
                            onSubmit={handleFilter}
                            className="flex flex-col sm:flex-row gap-3 items-end"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="start-date">
                                    Tanggal Mulai
                                </Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={start}
                                        onChange={(e) =>
                                            setStart(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Tanggal Akhir</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full sm:w-auto">
                                <FilterIcon className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Laba Rugi Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Pendapatan */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Penjualan
                        </CardTitle>
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatPrice(totalPenjualan)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Pendapatan kotor dari penjualan
                        </p>
                    </CardContent>
                </Card>

                {/* Pengeluaran */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Pembelian
                        </CardTitle>
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatPrice(totalPembelian)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Harga pokok penjualan (HPP)
                        </p>
                    </CardContent>
                </Card>

                {/* Laba Rugi */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Laba Kotor
                        </CardTitle>
                        <BarChart3Icon
                            className={`h-4 w-4 ${
                                labaKotor >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${
                                labaKotor >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }`}
                        >
                            {formatPrice(labaKotor)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Margin: {formatPercent(persentaseLaba)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown Penjualan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Penjualan Cash
                        </CardTitle>
                        <DollarSignIcon className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatPrice(totalCash)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {totalPenjualan > 0
                                ? ((totalCash / totalPenjualan) * 100).toFixed(
                                      1
                                  )
                                : 0}
                            %
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Penjualan Tempo
                        </CardTitle>
                        <ClockIcon className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatPrice(totalTempo)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {totalPenjualan > 0
                                ? ((totalTempo / totalPenjualan) * 100).toFixed(
                                      1
                                  )
                                : 0}
                            %
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Deposit
                        </CardTitle>
                        <PiggyBankIcon className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatPrice(totalDeposit)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {totalPenjualan > 0
                                ? (
                                      (totalDeposit / totalPenjualan) *
                                      100
                                  ).toFixed(1)
                                : 0}
                            %
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Transaksi
                        </CardTitle>
                        <ShoppingCartIcon className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {transactions.total}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Jumlah transaksi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Neraca Balancing Alert */}
            <Alert
                className={`mb-8 ${
                    balancing
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                }`}
            >
                <div className="flex items-center">
                    {balancing ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                        <AlertCircleIcon className="h-4 w-4 text-red-600 mr-2" />
                    )}
                    <AlertDescription
                        className={
                            balancing ? "text-green-800" : "text-red-800"
                        }
                    >
                        <div className="font-semibold mb-2">
                            {balancing
                                ? "NERACA SEIMBANG ✓"
                                : "NERACA TIDAK SEIMBANG ⚠️"}
                        </div>
                        <div className="text-sm font-mono">
                            Cash + Deposit + Tempo = Total Penjualan
                        </div>
                        <div className="text-sm font-mono mt-1">
                            {formatPrice(totalCash)} +{" "}
                            {formatPrice(totalDeposit)} +{" "}
                            {formatPrice(totalTempo)} ={" "}
                            {formatPrice(totalPenjualan)}
                        </div>
                    </AlertDescription>
                </div>
            </Alert>

            {/* Export Button */}
            <div className="flex justify-end mb-6">
                <Button onClick={handleExport} variant="outline">
                    <FileDownIcon className="w-4 h-4 mr-2" />
                    Export CSV
                </Button>
            </div>
            {/* Tabel Transaksi */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCartIcon className="h-5 w-5" />
                        Detail Transaksi Penjualan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Invoice
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kasir
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pelanggan
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Metode
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deposit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-gray-500"
                                        >
                                            Tidak ada transaksi ditemukan untuk
                                            periode ini
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((t, i) => (
                                        <tr
                                            key={t.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {(transactions.current_page -
                                                    1) *
                                                    transactions.per_page +
                                                    i +
                                                    1}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {new Date(
                                                    t.created_at
                                                ).toLocaleDateString("id-ID")}
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-xs"
                                                >
                                                    {t.invoice}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {t.cashier?.name || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {t.customer?.name ||
                                                    "Walk-in Customer"}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                                                {formatPrice(t.grand_total)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant={
                                                        t.payment_method ===
                                                        "cash"
                                                            ? "default"
                                                            : t.payment_method ===
                                                              "tempo"
                                                            ? "secondary"
                                                            : t.payment_method ===
                                                              "deposit"
                                                            ? "outline"
                                                            : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {t.payment_method === "cash"
                                                        ? "Cash"
                                                        : t.payment_method ===
                                                          "tempo"
                                                        ? "Tempo"
                                                        : t.payment_method ===
                                                          "deposit"
                                                        ? "Deposit"
                                                        : "-"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                {t.is_deposit
                                                    ? formatPrice(
                                                          t.deposit_amount ?? 0
                                                      )
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && (
                        <div className="px-4 py-3 border-t bg-gray-50">
                            <div className="flex justify-center gap-1">
                                {transactions.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        disabled={!link.url}
                                        className="min-w-[40px]"
                                    >
                                        {link.label.replace(
                                            /&laquo;|&raquo;|&lsaquo;|&rsaquo;/g,
                                            ""
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Rekap Kategori Produk */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3Icon className="h-5 w-5" />
                        Rekap Kategori Produk Terjual
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori Produk
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity Terjual
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Persentase
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(kategoriProduk).length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-8 text-center text-gray-500"
                                        >
                                            Tidak ada data kategori produk
                                        </td>
                                    </tr>
                                ) : (
                                    (() => {
                                        const totalQty = Object.values(
                                            kategoriProduk
                                        ).reduce((a, b) => a + b, 0);
                                        return Object.entries(kategoriProduk)
                                            .sort(([, a], [, b]) => b - a) // Sort by quantity descending
                                            .map(([cat, qty], i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {cat}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                        {qty.toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Badge variant="secondary">
                                                            {totalQty > 0
                                                                ? (
                                                                      (qty /
                                                                          totalQty) *
                                                                      100
                                                                  ).toFixed(1)
                                                                : 0}
                                                            %
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ));
                                    })()
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

Recap.layout = (page) => <DashboardLayout children={page} />;
