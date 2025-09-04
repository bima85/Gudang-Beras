import React, { useState, useEffect } from "react";
import { Head, useForm, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    ArrowLeft,
    Package,
    Warehouse,
    Scale,
    Calculator,
    AlertTriangle,
} from "lucide-react";
import axios from "axios";

export default function Create({ auth, products, warehouses, units, types }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: "",
        warehouse_id: "",
        type: "",
        qty_input: "",
        unit_input: "",
        description: "",
        reference_type: "",
        reference_id: "",
    });

    const [currentStock, setCurrentStock] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [quantityInKg, setQuantityInKg] = useState(0);

    // Get current stock when product and warehouse are selected
    useEffect(() => {
        if (data.product_id && data.warehouse_id) {
            fetchCurrentStock();
        } else {
            setCurrentStock(null);
        }
    }, [data.product_id, data.warehouse_id]);

    // Calculate quantity in kg when qty_input or unit changes
    useEffect(() => {
        if (data.qty_input && selectedUnit) {
            const qty = parseFloat(data.qty_input) || 0;
            const conversion = parseFloat(selectedUnit.conversion_to_kg) || 1;
            setQuantityInKg(qty * conversion);
        } else {
            setQuantityInKg(0);
        }
    }, [data.qty_input, selectedUnit]);

    const fetchCurrentStock = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                route("stock-movements.current-stock"),
                {
                    params: {
                        product_id: data.product_id,
                        warehouse_id: data.warehouse_id,
                    },
                }
            );
            setCurrentStock(response.data);
        } catch (error) {
            console.error("Error fetching current stock:", error);
            setCurrentStock(null);
        }
        setLoading(false);
    };

    const handleUnitChange = (unitId) => {
        setData("unit_input", unitId);
        const unit = units.find((u) => u.id.toString() === unitId);
        setSelectedUnit(unit);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("stock-movements.store"), {
            onSuccess: () => {
                reset();
                setCurrentStock(null);
                setSelectedUnit(null);
                setQuantityInKg(0);
            },
        });
    };

    const isSubtraction = data.type === "sale" || data.type === "transfer_out";
    const willBeNegative =
        currentStock &&
        isSubtraction &&
        quantityInKg > parseFloat(currentStock.current_stock_kg);

    return (
        <DashboardLayout>
            <Head title="Tambah Pergerakan Stok" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-6">
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
                                Tambah Pergerakan Stok
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Catat pergerakan stok beras (pembelian,
                                transfer, atau penyesuaian)
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Form */}
                            <div className="lg:col-span-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Informasi Pergerakan Stok
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Product Selection */}
                                        <div>
                                            <Label htmlFor="product_id">
                                                Produk *
                                            </Label>
                                            <Select
                                                value={data.product_id}
                                                onValueChange={(value) =>
                                                    setData("product_id", value)
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih produk" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {products.map((product) => (
                                                        <SelectItem
                                                            key={product.id}
                                                            value={product.id.toString()}
                                                        >
                                                            <div className="flex items-center">
                                                                <Package className="w-4 h-4 mr-2" />
                                                                <div>
                                                                    <div className="font-medium">
                                                                        {
                                                                            product.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {
                                                                            product.barcode
                                                                        }{" "}
                                                                        •{" "}
                                                                        {
                                                                            product
                                                                                .category
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.product_id && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.product_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Warehouse Selection */}
                                        <div>
                                            <Label htmlFor="warehouse_id">
                                                Gudang *
                                            </Label>
                                            <Select
                                                value={data.warehouse_id}
                                                onValueChange={(value) =>
                                                    setData(
                                                        "warehouse_id",
                                                        value
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih gudang" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {warehouses.map(
                                                        (warehouse) => (
                                                            <SelectItem
                                                                key={
                                                                    warehouse.id
                                                                }
                                                                value={warehouse.id.toString()}
                                                            >
                                                                <div className="flex items-center">
                                                                    <Warehouse className="w-4 h-4 mr-2" />
                                                                    {
                                                                        warehouse.name
                                                                    }
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.warehouse_id && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.warehouse_id}
                                                </p>
                                            )}
                                        </div>

                                        {/* Type Selection */}
                                        <div>
                                            <Label htmlFor="type">
                                                Jenis Pergerakan *
                                            </Label>
                                            <Select
                                                value={data.type}
                                                onValueChange={(value) =>
                                                    setData("type", value)
                                                }
                                            >
                                                <SelectTrigger className="mt-1">
                                                    <SelectValue placeholder="Pilih jenis pergerakan" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(types).map(
                                                        ([key, label]) => (
                                                            <SelectItem
                                                                key={key}
                                                                value={key}
                                                            >
                                                                {label}
                                                            </SelectItem>
                                                        )
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.type && (
                                                <p className="text-red-500 text-sm mt-1">
                                                    {errors.type}
                                                </p>
                                            )}
                                        </div>

                                        {/* Quantity and Unit */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="qty_input">
                                                    Jumlah *
                                                </Label>
                                                <div className="relative mt-1">
                                                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                                    <Input
                                                        id="qty_input"
                                                        type="number"
                                                        step="0.01"
                                                        min="0.01"
                                                        value={data.qty_input}
                                                        onChange={(e) =>
                                                            setData(
                                                                "qty_input",
                                                                e.target.value
                                                            )
                                                        }
                                                        className="pl-10"
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                                {errors.qty_input && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.qty_input}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="unit_input">
                                                    Satuan *
                                                </Label>
                                                <Select
                                                    value={data.unit_input}
                                                    onValueChange={
                                                        handleUnitChange
                                                    }
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Pilih satuan" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {units.map((unit) => (
                                                            <SelectItem
                                                                key={unit.id}
                                                                value={unit.id.toString()}
                                                            >
                                                                {unit.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.unit_input && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.unit_input}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Conversion Display */}
                                        {quantityInKg > 0 && (
                                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                                <div className="flex items-center">
                                                    <Calculator className="w-5 h-5 text-blue-600 mr-2" />
                                                    <span className="text-blue-800 dark:text-blue-200 font-medium">
                                                        Konversi:{" "}
                                                        {data.qty_input}{" "}
                                                        {selectedUnit?.name} ={" "}
                                                        {quantityInKg.toFixed(
                                                            2
                                                        )}{" "}
                                                        kg
                                                    </span>
                                                </div>
                                            </div>
                                        )}

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
                                                placeholder="Keterangan tambahan (opsional)"
                                                rows={3}
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
                                                    placeholder="Contoh: purchase, transfer"
                                                />
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
                                                {errors.reference_id && (
                                                    <p className="text-red-500 text-sm mt-1">
                                                        {errors.reference_id}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Stock Information Sidebar */}
                            <div className="lg:col-span-1">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Informasi Stok</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {loading ? (
                                            <div className="text-center py-4">
                                                <div className="animate-pulse">
                                                    Memuat stok...
                                                </div>
                                            </div>
                                        ) : currentStock ? (
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                                        Stok Saat Ini
                                                    </div>
                                                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                                        {
                                                            currentStock.current_stock_formatted
                                                        }
                                                    </div>
                                                </div>

                                                {quantityInKg > 0 && (
                                                    <div className="space-y-2">
                                                        <div className="border-t pt-4">
                                                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                                                {isSubtraction
                                                                    ? "Stok Setelah Pengurangan"
                                                                    : "Stok Setelah Penambahan"}
                                                            </div>
                                                            <div
                                                                className={`text-xl font-bold ${
                                                                    willBeNegative
                                                                        ? "text-red-600"
                                                                        : "text-green-600"
                                                                }`}
                                                            >
                                                                {isSubtraction
                                                                    ? (
                                                                          parseFloat(
                                                                              currentStock.current_stock_kg
                                                                          ) -
                                                                          quantityInKg
                                                                      ).toFixed(
                                                                          2
                                                                      )
                                                                    : (
                                                                          parseFloat(
                                                                              currentStock.current_stock_kg
                                                                          ) +
                                                                          quantityInKg
                                                                      ).toFixed(
                                                                          2
                                                                      )}{" "}
                                                                kg
                                                            </div>
                                                        </div>

                                                        {willBeNegative && (
                                                            <Alert className="border-red-200 bg-red-50">
                                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                                <AlertDescription className="text-red-800">
                                                                    Peringatan:
                                                                    Stok akan
                                                                    menjadi
                                                                    negatif!
                                                                </AlertDescription>
                                                            </Alert>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ) : data.product_id &&
                                          data.warehouse_id ? (
                                            <div className="text-center py-4 text-gray-500">
                                                Tidak ada stok untuk produk ini
                                                di gudang yang dipilih
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                Pilih produk dan gudang untuk
                                                melihat stok saat ini
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Submit Button */}
                                <div className="mt-6">
                                    <Button
                                        type="submit"
                                        disabled={processing || willBeNegative}
                                        className="w-full"
                                    >
                                        {processing
                                            ? "Menyimpan..."
                                            : "Simpan Pergerakan Stok"}
                                    </Button>

                                    {errors.general && (
                                        <Alert className="mt-4 border-red-200 bg-red-50">
                                            <AlertTriangle className="h-4 w-4 text-red-600" />
                                            <AlertDescription className="text-red-800">
                                                {errors.general}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
