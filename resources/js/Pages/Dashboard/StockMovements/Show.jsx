import React from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    ArrowLeft,
    Package,
    Warehouse,
    User,
    Calendar,
    FileText,
    ArrowUp,
    ArrowDown,
    Edit,
} from "lucide-react";

export default function Show({ auth, stockMovement }) {
    const getTypeColor = (type) => {
        const colors = {
            purchase: "bg-green-100 text-green-800",
            sale: "bg-red-100 text-red-800",
            transfer_in: "bg-blue-100 text-blue-800",
            transfer_out: "bg-orange-100 text-orange-800",
            adjustment: "bg-gray-100 text-gray-800",
        };
        return colors[type] || "bg-gray-100 text-gray-800";
    };

    const getTypeLabel = (type) => {
        const labels = {
            purchase: "Pembelian",
            sale: "Penjualan",
            transfer_in: "Transfer Masuk",
            transfer_out: "Transfer Keluar",
            adjustment: "Penyesuaian",
        };
        return labels[type] || type;
    };

    const formatQuantity = (quantity) => {
        const isPositive = parseFloat(quantity) >= 0;
        return (
            <span
                className={`flex items-center ${
                    isPositive ? "text-green-600" : "text-red-600"
                }`}
            >
                {isPositive ? (
                    <ArrowUp className="w-5 h-5 mr-2" />
                ) : (
                    <ArrowDown className="w-5 h-5 mr-2" />
                )}
                <span className="text-2xl font-bold">
                    {Math.abs(parseFloat(quantity)).toFixed(2)} kg
                </span>
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title={`Detail Pergerakan Stok #${stockMovement.id}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.get(route("stock-movements.index"))
                                }
                                className="mr-4"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Detail Pergerakan Stok #{stockMovement.id}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Informasi lengkap pergerakan stok
                                </p>
                            </div>
                        </div>
                        <Button
                            onClick={() =>
                                router.get(
                                    route(
                                        "stock-movements.edit",
                                        stockMovement.id
                                    )
                                )
                            }
                            className="flex items-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Dasar</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Produk
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Package className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {
                                                            stockMovement
                                                                .product?.name
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Barcode:{" "}
                                                        {
                                                            stockMovement
                                                                .product
                                                                ?.barcode
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        Kategori:{" "}
                                                        {
                                                            stockMovement
                                                                .product
                                                                ?.category?.name
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Gudang
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Warehouse className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {
                                                            stockMovement
                                                                .warehouse?.name
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Jenis Pergerakan
                                            </label>
                                            <div className="flex items-center">
                                                <Badge
                                                    className={getTypeColor(
                                                        stockMovement.type
                                                    )}
                                                    size="lg"
                                                >
                                                    {getTypeLabel(
                                                        stockMovement.type
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tanggal & Waktu
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {new Date(
                                                            stockMovement.created_at
                                                        ).toLocaleDateString(
                                                            "id-ID",
                                                            {
                                                                weekday: "long",
                                                                year: "numeric",
                                                                month: "long",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {new Date(
                                                            stockMovement.created_at
                                                        ).toLocaleTimeString(
                                                            "id-ID"
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                User
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <User className="w-5 h-5 text-gray-400 mr-3" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">
                                                        {
                                                            stockMovement.user
                                                                ?.name
                                                        }
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {
                                                            stockMovement.user
                                                                ?.email
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Description and References */}
                            {(stockMovement.description ||
                                stockMovement.reference_type ||
                                stockMovement.reference_id) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Keterangan & Referensi
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {stockMovement.description && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Keterangan
                                                    </label>
                                                    <div className="flex items-start p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <FileText className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                                                        <p className="text-gray-900 dark:text-gray-100">
                                                            {
                                                                stockMovement.description
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {(stockMovement.reference_type ||
                                                stockMovement.reference_id) && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {stockMovement.reference_type && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                Jenis Referensi
                                                            </label>
                                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                                <span className="text-gray-900 dark:text-gray-100 font-mono">
                                                                    {
                                                                        stockMovement.reference_type
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {stockMovement.reference_id && (
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                                ID Referensi
                                                            </label>
                                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                                <span className="text-gray-900 dark:text-gray-100 font-mono">
                                                                    #
                                                                    {
                                                                        stockMovement.reference_id
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Stock Information Sidebar */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Stok</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {/* Quantity Change */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Perubahan Stok
                                            </label>
                                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                {formatQuantity(
                                                    stockMovement.quantity_in_kg
                                                )}
                                            </div>
                                        </div>

                                        {/* Balance After */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Saldo Setelah Transaksi
                                            </label>
                                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                                                    {parseFloat(
                                                        stockMovement.balance_after
                                                    ).toFixed(2)}{" "}
                                                    kg
                                                </div>
                                            </div>
                                        </div>

                                        {/* Calculation Info */}
                                        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                            <div className="font-medium mb-2">
                                                Informasi:
                                            </div>
                                            <ul className="space-y-1">
                                                <li>
                                                    • Semua stok dalam satuan
                                                    kilogram (kg)
                                                </li>
                                                <li>
                                                    • Perubahan positif = stok
                                                    bertambah
                                                </li>
                                                <li>
                                                    • Perubahan negatif = stok
                                                    berkurang
                                                </li>
                                                <li>
                                                    • Saldo = stok setelah
                                                    pergerakan ini
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
