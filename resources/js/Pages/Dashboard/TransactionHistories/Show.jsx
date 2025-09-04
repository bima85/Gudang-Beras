import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import {
    ArrowLeft,
    Calendar,
    Clock,
    Package,
    Hash,
    User,
    MapPin,
    FileText,
    DollarSign,
    Scale,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

export default function Show({ transaction, sidebarOpen }) {
    const formatCurrency = (amount) => {
        if (!amount) return "-";
        return `Rp ${Number(amount).toLocaleString("id-ID")}`;
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

    const formatDate = (date) => {
        if (!date) return "-";
        return new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Jakarta",
            day: "2-digit",
            month: "long",
            year: "numeric",
        }).format(new Date(date));
    };

    const formatTime = (time) => {
        if (!time) return "-";
        return time;
    };

    const getTransactionTypeVariant = (type) => {
        const variants = {
            purchase: "default",
            sale: "secondary",
            return: "destructive",
            transfer: "outline",
            adjustment: "secondary",
        };
        return variants[type] || "outline";
    };

    const getTransactionTypeLabel = (type) => {
        const labels = {
            purchase: "Pembelian",
            sale: "Penjualan",
            return: "Retur",
            transfer: "Transfer",
            adjustment: "Penyesuaian",
        };
        return labels[type] || type;
    };

    return (
        <DashboardLayout sidebarOpen={sidebarOpen}>
            <Head
                title={`Detail Transaksi - ${transaction.transaction_number}`}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-2"
                        >
                            <Link href={route("transaction-histories.index")}>
                                <ArrowLeft className="w-4 h-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                Detail Transaksi
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {transaction.transaction_number}
                            </p>
                        </div>
                    </div>
                    <Badge
                        variant={getTransactionTypeVariant(
                            transaction.transaction_type
                        )}
                        className="text-sm"
                    >
                        {getTransactionTypeLabel(transaction.transaction_type)}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Transaction Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Hash className="w-5 h-5" />
                                    Informasi Transaksi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            Tanggal
                                        </div>
                                        <p className="font-medium">
                                            {formatDate(
                                                transaction.transaction_date
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Clock className="w-4 h-4" />
                                            Waktu
                                        </div>
                                        <p className="font-medium">
                                            {formatTime(
                                                transaction.transaction_time
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Hash className="w-4 h-4" />
                                            Nomor Transaksi
                                        </div>
                                        <p className="font-medium font-mono text-sm">
                                            {transaction.transaction_number}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <User className="w-4 h-4" />
                                            Dibuat oleh
                                        </div>
                                        <p className="font-medium">
                                            {transaction.creator?.name || "-"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Product Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Informasi Produk
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Nama Produk
                                        </div>
                                        <p className="font-medium">
                                            {transaction.product?.name || "-"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Kategori
                                        </div>
                                        <p className="font-medium">
                                            {transaction.product?.category
                                                ?.name || "-"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Subkategori
                                        </div>
                                        <p className="font-medium">
                                            {transaction.product?.subcategory
                                                ?.name || "-"}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Scale className="w-4 h-4" />
                                            Quantity & Satuan
                                        </div>
                                        <p className="font-medium">
                                            {formatQuantity(
                                                transaction.quantity
                                            )}{" "}
                                            {transaction.unit || ""}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Stock Movement */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Pergerakan Stok
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <TrendingDown className="w-4 h-4" />
                                            Stok Sebelum
                                        </div>
                                        <p className="font-medium text-lg">
                                            {formatQuantity(
                                                transaction.stock_before
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Scale className="w-4 h-4" />
                                            Perubahan
                                        </div>
                                        <p className="font-medium text-lg">
                                            {transaction.transaction_type ===
                                                "sale" ||
                                            transaction.transaction_type ===
                                                "return"
                                                ? "-"
                                                : "+"}
                                            {formatQuantity(
                                                transaction.quantity
                                            )}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <TrendingUp className="w-4 h-4" />
                                            Stok Setelah
                                        </div>
                                        <p className="font-medium text-lg">
                                            {formatQuantity(
                                                transaction.stock_after
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    Lokasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {transaction.toko ? (
                                    <div className="space-y-2">
                                        <div className="text-sm text-gray-600 dark:text-gray-400">
                                            Toko
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">🏪</span>
                                            <span className="font-medium">
                                                {transaction.toko.name}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500">
                                        Lokasi tidak tersedia
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Financial Info */}
                        {(transaction.price || transaction.subtotal) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <DollarSign className="w-5 h-5" />
                                        Informasi Keuangan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {transaction.price && (
                                        <div className="space-y-2">
                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                Harga Satuan
                                            </div>
                                            <p className="font-medium text-lg">
                                                {formatCurrency(
                                                    transaction.price
                                                )}
                                            </p>
                                        </div>
                                    )}
                                    {transaction.subtotal && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Subtotal
                                                </div>
                                                <p className="font-bold text-xl text-green-600">
                                                    {formatCurrency(
                                                        transaction.subtotal
                                                    )}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    {transaction.payment_status && (
                                        <>
                                            <Separator />
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                                    Status Pembayaran
                                                </div>
                                                <Badge
                                                    variant={
                                                        transaction.payment_status ===
                                                        "paid"
                                                            ? "default"
                                                            : transaction.payment_status ===
                                                              "partial"
                                                            ? "secondary"
                                                            : "destructive"
                                                    }
                                                >
                                                    {transaction.payment_status ===
                                                    "paid"
                                                        ? "Lunas"
                                                        : transaction.payment_status ===
                                                          "partial"
                                                        ? "Sebagian"
                                                        : "Belum Bayar"}
                                                </Badge>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Related Party */}
                        {transaction.related_party && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Pihak Terkait
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium">
                                        {transaction.related_party}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Notes */}
                        {transaction.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Catatan
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm leading-relaxed">
                                        {transaction.notes}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
