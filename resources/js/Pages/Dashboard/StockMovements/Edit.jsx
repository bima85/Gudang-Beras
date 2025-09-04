import React from "react";
import { Head, useForm, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    ArrowLeft,
    Package,
    Warehouse,
    AlertTriangle,
    FileText,
    Save,
} from "lucide-react";

export default function Edit({
    auth,
    stockMovement,
    products,
    warehouses,
    units,
    types,
}) {
    const { data, setData, put, processing, errors } = useForm({
        description: stockMovement.description || "",
        reference_type: stockMovement.reference_type || "",
        reference_id: stockMovement.reference_id || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("stock-movements.update", stockMovement.id));
    };

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

    return (
        <DashboardLayout>
            <Head title={`Edit Pergerakan Stok #${stockMovement.id}`} />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-6">
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.get(
                                    route(
                                        "stock-movements.show",
                                        stockMovement.id
                                    )
                                )
                            }
                            className="mr-4"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Edit Pergerakan Stok #{stockMovement.id}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Edit keterangan dan referensi pergerakan stok
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Edit Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Edit Informasi
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        <AlertDescription className="text-yellow-800">
                                            <strong>Catatan:</strong> Hanya
                                            keterangan dan referensi yang dapat
                                            diubah. Jumlah stok dan data
                                            transaksi tidak dapat dimodifikasi
                                            untuk menjaga integritas data.
                                        </AlertDescription>
                                    </Alert>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="space-y-6"
                                    >
                                        {/* Description */}
                                        <div>
                                            <Label htmlFor="description">
                                                Keterangan
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={(e) =>
                                                    setData(
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                                className="mt-1"
                                                placeholder="Keterangan tambahan tentang pergerakan stok"
                                                rows={4}
                                            />
                                            {errors.description && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Reference Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="reference_type">
                                                    Jenis Referensi
                                                </Label>
                                                <Input
                                                    id="reference_type"
                                                    value={data.reference_type}
                                                    onChange={(e) =>
                                                        setData(
                                                            "reference_type",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1"
                                                    placeholder="Contoh: purchase, transfer, sale"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Jenis transaksi yang
                                                    menyebabkan pergerakan stok
                                                    ini
                                                </p>
                                                {errors.reference_type && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.reference_type}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="reference_id">
                                                    ID Referensi
                                                </Label>
                                                <Input
                                                    id="reference_id"
                                                    type="number"
                                                    value={data.reference_id}
                                                    onChange={(e) =>
                                                        setData(
                                                            "reference_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="mt-1"
                                                    placeholder="ID transaksi terkait"
                                                />
                                                <p className="text-sm text-gray-500 mt-1">
                                                    ID transaksi atau dokumen
                                                    yang menyebabkan pergerakan
                                                    ini
                                                </p>
                                                {errors.reference_id && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.reference_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="flex justify-end space-x-3 pt-6">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    router.get(
                                                        route(
                                                            "stock-movements.show",
                                                            stockMovement.id
                                                        )
                                                    )
                                                }
                                            >
                                                Batal
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                                className="flex items-center"
                                            >
                                                <Save className="w-4 h-4 mr-2" />
                                                {processing
                                                    ? "Menyimpan..."
                                                    : "Simpan Perubahan"}
                                            </Button>
                                        </div>

                                        {errors.general && (
                                            <Alert className="border-red-200 bg-red-50">
                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                <AlertDescription className="text-red-800">
                                                    {errors.general}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Stock Movement Information (Read-only) */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Informasi Pergerakan</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Product */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Produk
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Package className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                        {
                                                            stockMovement
                                                                .product?.name
                                                        }
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {
                                                            stockMovement
                                                                .product
                                                                ?.barcode
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Warehouse */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Gudang
                                            </label>
                                            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <Warehouse className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                    {
                                                        stockMovement.warehouse
                                                            ?.name
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* Type */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Jenis
                                            </label>
                                            <Badge
                                                className={getTypeColor(
                                                    stockMovement.type
                                                )}
                                            >
                                                {getTypeLabel(
                                                    stockMovement.type
                                                )}
                                            </Badge>
                                        </div>

                                        {/* Quantity */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Perubahan Stok
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <span
                                                    className={`font-bold ${
                                                        parseFloat(
                                                            stockMovement.quantity_in_kg
                                                        ) >= 0
                                                            ? "text-green-600"
                                                            : "text-red-600"
                                                    }`}
                                                >
                                                    {parseFloat(
                                                        stockMovement.quantity_in_kg
                                                    ) >= 0
                                                        ? "+"
                                                        : ""}
                                                    {parseFloat(
                                                        stockMovement.quantity_in_kg
                                                    ).toFixed(2)}{" "}
                                                    kg
                                                </span>
                                            </div>
                                        </div>

                                        {/* Balance After */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Saldo Setelah
                                            </label>
                                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <span className="font-bold text-blue-800 dark:text-blue-200">
                                                    {parseFloat(
                                                        stockMovement.balance_after
                                                    ).toFixed(2)}{" "}
                                                    kg
                                                </span>
                                            </div>
                                        </div>

                                        {/* Date */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Tanggal
                                            </label>
                                            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {new Date(
                                                        stockMovement.created_at
                                                    ).toLocaleDateString(
                                                        "id-ID"
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(
                                                        stockMovement.created_at
                                                    ).toLocaleTimeString(
                                                        "id-ID"
                                                    )}
                                                </div>
                                            </div>
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
