import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router } from "@inertiajs/react";
import InputSelect from "@/Components/Dashboard/InputSelect";
import { ExcelIcon, PdfIcon } from "@/Components/Dashboard/ExportIcons";
import {
    Plus,
    ShoppingCart,
    Package,
    TrendingUp,
    TrendingDown,
    Calendar,
    MapPin,
    Search,
    Filter,
    Download,
    Clock,
    User,
    DollarSign,
    Building,
    Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Components/ui/tabs";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Button } from "@/Components/ui/button";

export default function Index({
    transactions,
    sidebarOpen,
    filters = {},
    tokos = [],
    warehouses = [],
}) {
    // State untuk filter
    const [dateFrom, setDateFrom] = useState(filters.from || "");
    const [dateTo, setDateTo] = useState(filters.to || "");
    const [locationId, setLocationId] = useState(filters.location_id || "");
    const [locationType, setLocationType] = useState(
        filters.location_type || ""
    );
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");

    // Gabungkan warehouse dan toko menjadi satu array lokasi
    const locations = [
        ...warehouses.map((w) => ({
            ...w,
            type: "warehouse",
            label: `🏢 ${w.name}`,
        })),
        ...tokos.map((t) => ({ ...t, type: "toko", label: `🏪 ${t.name}` })),
    ];

    // Pisahkan data berdasarkan jenis transaksi
    const purchaseTransactions =
        transactions.data?.filter((t) => t.transaction_type === "purchase") ||
        [];
    const saleTransactions =
        transactions.data?.filter((t) => t.transaction_type === "sale") || [];
    const allTransactions = transactions.data || [];

    const formatPrice = (value) => {
        if (!value) return "-";
        return `Rp ${Number(value).toLocaleString("id-ID")}`;
    };

    const formatNumber = (value) => {
        if (!value) return "-";
        return Number(value).toLocaleString("id-ID");
    };

    const formatQuantity = (qty) => {
        if (qty === null || qty === undefined) return "-";
        const number = Number(qty);
        if (isNaN(number)) return "-";
        if (number % 1 === 0) {
            return number.toString();
        }
        return parseFloat(number.toFixed(2)).toString();
    };

    const formatDateTime = (date, time) => {
        if (!date) return "-";
        const formattedDate = new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
        return time ? `${formattedDate} ${time}` : formattedDate;
    };

    // Validasi tanggal
    const isValidDateRange = () => {
        if (!dateFrom || !dateTo) return true;
        return new Date(dateFrom) <= new Date(dateTo);
    };

    // Komponen untuk tabel pembelian
    const PurchaseTable = ({ data }) => {
        if (!data || data.length === 0) {
            return (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada data pembelian yang ditemukan.</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Data Pembelian ({data.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        Tanggal & Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        No. Transaksi
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        Supplier
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Harga
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Subtotal
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Fee Kuli
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Timbangan
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-sm">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-sm">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        className="border-b hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            {formatDateTime(
                                                trx.transaction_date,
                                                trx.transaction_time
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs"
                                            >
                                                {trx.transaction_number}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">
                                                    {trx.product?.name || "-"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        trx.product?.category
                                                            ?.name
                                                    }
                                                    {trx.product?.subcategory &&
                                                        ` / ${trx.product.subcategory.name}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4 text-orange-600" />
                                                {trx.related_party || "-"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div>
                                                <span className="font-medium">
                                                    {formatQuantity(
                                                        trx.quantity
                                                    )}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    {trx.unit}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatPrice(trx.price)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatPrice(trx.subtotal)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatPrice(trx.kuli_fee) || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {trx.timbangan
                                                ? `${formatQuantity(
                                                      trx.timbangan
                                                  )} kg`
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge
                                                variant={
                                                    trx.payment_status ===
                                                    "paid"
                                                        ? "default"
                                                        : trx.payment_status ===
                                                          "unpaid"
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {trx.payment_status === "paid"
                                                    ? "Lunas"
                                                    : trx.payment_status ===
                                                      "unpaid"
                                                    ? "Belum Lunas"
                                                    : trx.payment_status ===
                                                      "partial"
                                                    ? "Sebagian"
                                                    : "-"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() =>
                                                        router.get(
                                                            route(
                                                                "transaction-histories.show",
                                                                trx.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    <span className="text-blue-600">
                                                        👁
                                                    </span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        );
    };

    // Komponen untuk tabel penjualan
    const SalesTable = ({ data }) => {
        if (!data || data.length === 0) {
            return (
                <Card>
                    <CardContent className="py-8">
                        <div className="text-center text-muted-foreground">
                            <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Tidak ada data penjualan yang ditemukan.</p>
                        </div>
                    </CardContent>
                </Card>
            );
        }

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-green-600" />
                        Data Penjualan ({data.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted/50">
                                <tr className="border-b">
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        Tanggal & Waktu
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        No. Transaksi
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        Produk
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium text-sm">
                                        Customer
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Qty
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Harga
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Subtotal
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Discount
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Deposit
                                    </th>
                                    <th className="px-4 py-3 text-right font-medium text-sm">
                                        Kembalian
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-sm">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-center font-medium text-sm">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((trx) => (
                                    <tr
                                        key={trx.id}
                                        className="border-b hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-4 py-3 text-sm">
                                            {formatDateTime(
                                                trx.transaction_date,
                                                trx.transaction_time
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge
                                                variant="outline"
                                                className="font-mono text-xs"
                                            >
                                                {trx.transaction_number}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="font-medium">
                                                    {trx.product?.name || "-"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        trx.product?.category
                                                            ?.name
                                                    }
                                                    {trx.product?.subcategory &&
                                                        ` / ${trx.product.subcategory.name}`}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <ShoppingCart className="w-4 h-4 text-green-600" />
                                                {trx.related_party ||
                                                    "Walk-in Customer"}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div>
                                                <span className="font-medium">
                                                    {formatQuantity(
                                                        trx.quantity
                                                    )}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-1">
                                                    {trx.unit}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatPrice(trx.price)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium">
                                            {formatPrice(trx.subtotal)}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatPrice(trx.discount) || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {formatPrice(trx.deposit_amount) ||
                                                "-"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="text-green-600 font-medium">
                                                {trx.transaction?.change
                                                    ? formatPrice(
                                                          trx.transaction.change
                                                      )
                                                    : "-"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Badge
                                                variant={
                                                    trx.payment_status ===
                                                    "paid"
                                                        ? "default"
                                                        : trx.payment_status ===
                                                          "unpaid"
                                                        ? "destructive"
                                                        : "secondary"
                                                }
                                                className="text-xs"
                                            >
                                                {trx.payment_status === "paid"
                                                    ? "Lunas"
                                                    : trx.payment_status ===
                                                      "unpaid"
                                                    ? "Belum Lunas"
                                                    : trx.payment_status ===
                                                      "partial"
                                                    ? "Sebagian"
                                                    : "-"}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex gap-1 justify-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() =>
                                                        router.get(
                                                            route(
                                                                "transaction-histories.show",
                                                                trx.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    <span className="text-blue-600">
                                                        👁
                                                    </span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
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
                ...(locationId && locationType
                    ? {
                          location_id: locationId,
                          location_type: locationType,
                      }
                    : {}),
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
            <div className="min-h-screen p-4 lg:p-6 bg-background">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                                Histori Transaksi
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                Kelola dan pantau riwayat semua transaksi
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    window.open(
                                        route(
                                            "transaction-histories.export.pdf"
                                        ),
                                        "_blank"
                                    )
                                }
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Export PDF
                                </span>
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    window.open(
                                        route(
                                            "transaction-histories.export.excel"
                                        ),
                                        "_blank"
                                    )
                                }
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline">
                                    Export Excel
                                </span>
                            </Button>
                            <Button
                                size="sm"
                                onClick={() =>
                                    router.get(
                                        route("transaction-histories.create")
                                    )
                                }
                                className="flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Tambah</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filter Section */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Tanggal Awal
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Tanggal Akhir
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Lokasi
                                </label>
                                <InputSelect
                                    data={locations}
                                    selected={
                                        locations.find(
                                            (l) =>
                                                l.id == locationId &&
                                                l.type == locationType
                                        ) || null
                                    }
                                    setSelected={(l) => {
                                        if (l) {
                                            setLocationId(l.id);
                                            setLocationType(l.type);
                                        } else {
                                            setLocationId("");
                                            setLocationType("");
                                        }
                                    }}
                                    displayKey="label"
                                    placeholder="Semua Lokasi"
                                    className="w-full"
                                />
                            </div>
                            <div className="space-y-2 flex items-end">
                                <div className="flex gap-2 w-full">
                                    <Button
                                        onClick={handleFilter}
                                        disabled={loading}
                                        className="flex-1"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setDateFrom("");
                                            setDateTo("");
                                            setLocationId("");
                                            setLocationType("");
                                            router.get(
                                                route(
                                                    "transaction-histories.index"
                                                )
                                            );
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Transaksi
                                    </p>
                                    <p className="text-2xl font-bold">
                                        {allTransactions.length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Pembelian
                                    </p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {purchaseTransactions.length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Penjualan
                                    </p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {saleTransactions.length}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingDown className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Total Nilai
                                    </p>
                                    <p className="text-lg font-bold">
                                        {formatPrice(
                                            allTransactions.reduce(
                                                (sum, trx) =>
                                                    sum +
                                                    Number(trx.subtotal || 0),
                                                0
                                            )
                                        )}
                                    </p>
                                </div>
                                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Package className="w-5 h-5 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content with Tabs */}
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                        <TabsTrigger
                            value="all"
                            className="flex items-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            <span className="hidden sm:inline">Semua</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="purchase"
                            className="flex items-center gap-2"
                        >
                            <TrendingUp className="w-4 h-4" />
                            <span className="hidden sm:inline">Pembelian</span>
                        </TabsTrigger>
                        <TabsTrigger
                            value="sale"
                            className="flex items-center gap-2"
                        >
                            <TrendingDown className="w-4 h-4" />
                            <span className="hidden sm:inline">Penjualan</span>
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="all" className="space-y-4">
                            <PurchaseTable data={purchaseTransactions} />
                            {purchaseTransactions.length > 0 &&
                                saleTransactions.length > 0 && (
                                    <Separator className="my-6" />
                                )}
                            <SalesTable data={saleTransactions} />
                        </TabsContent>

                        <TabsContent value="purchase">
                            <PurchaseTable data={purchaseTransactions} />
                        </TabsContent>

                        <TabsContent value="sale">
                            <SalesTable data={saleTransactions} />
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Pagination */}
                {transactions.links && (
                    <div className="mt-6 flex justify-center">
                        <div className="flex gap-2">
                            {transactions.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? "default" : "outline"
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
