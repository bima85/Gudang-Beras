import { Head, useForm, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    ArrowLeft,
    Package,
    Building,
    Store,
    Weight,
    Hash,
    FileText,
    Save,
    AlertCircle,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Create({
    warehouses = [],
    tokos = [],
    products = [],
    units = [],
    transactions = [],
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        delivery_number: "",
        transaction_id: "",
        product_id: "",
        warehouse_id: "",
        toko_id: "",
        qty_transferred: "",
        unit: "",
        qty_kg: "",
        notes: "",
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [autoGenerateNumber, setAutoGenerateNumber] = useState(true);

    // Auto generate delivery number
    useEffect(() => {
        if (autoGenerateNumber) {
            const today = new Date();
            const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
            const randomNum = Math.floor(Math.random() * 9999)
                .toString()
                .padStart(4, "0");
            setData("delivery_number", `DN-${dateStr}-${randomNum}`);
        }
    }, [autoGenerateNumber]);

    // Calculate qty in kg when qty_transferred or unit changes
    useEffect(() => {
        if (data.qty_transferred && selectedUnit) {
            const conversion = selectedUnit.conversion_to_kg || 1;
            const qtyKg = parseFloat(data.qty_transferred) * conversion;
            setData("qty_kg", qtyKg.toFixed(2));
        }
    }, [data.qty_transferred, selectedUnit]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare data, convert "none" transaction_id to empty string
        const submitData = {
            ...data,
            transaction_id:
                data.transaction_id === "none" ? "" : data.transaction_id,
        };

        post(route("delivery-notes.store"), {
            data: submitData,
            onSuccess: () => {
                router.get(route("delivery-notes.index"));
            },
        });
    };

    const handleBack = () => {
        router.get(route("delivery-notes.index"));
    };

    const handleProductChange = (productId) => {
        const product = products.find((p) => p.id.toString() === productId);
        setSelectedProduct(product);
        setData("product_id", productId);
    };

    const handleUnitChange = (unitName) => {
        const unit = units.find((u) => u.name === unitName);
        setSelectedUnit(unit);
        setData("unit", unitName);
    };

    return (
        <DashboardLayout>
            <Head title="Buat Surat Jalan Manual" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleBack}
                            variant="outline"
                            size="sm"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Buat Surat Jalan Manual
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Input data surat jalan untuk transfer produk
                                manual
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Informasi Dasar
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Delivery Number */}
                                <div>
                                    <Label htmlFor="delivery_number">
                                        Nomor Surat Jalan *
                                    </Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="delivery_number"
                                            value={data.delivery_number}
                                            onChange={(e) =>
                                                setData(
                                                    "delivery_number",
                                                    e.target.value
                                                )
                                            }
                                            disabled={autoGenerateNumber}
                                            placeholder="DN-20240906-0001"
                                            className={
                                                errors.delivery_number
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setAutoGenerateNumber(
                                                    !autoGenerateNumber
                                                )
                                            }
                                        >
                                            {autoGenerateNumber
                                                ? "Manual"
                                                : "Auto"}
                                        </Button>
                                    </div>
                                    {errors.delivery_number && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.delivery_number}
                                        </p>
                                    )}
                                </div>

                                {/* Transaction */}
                                <div>
                                    <Label htmlFor="transaction_id">
                                        Transaksi Referensi (Opsional)
                                    </Label>
                                    <Select
                                        value={data.transaction_id}
                                        onValueChange={(value) =>
                                            setData("transaction_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.transaction_id
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih transaksi (opsional)" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                Tidak ada transaksi
                                            </SelectItem>
                                            {transactions.map((transaction) => (
                                                <SelectItem
                                                    key={transaction.id}
                                                    value={transaction.id.toString()}
                                                >
                                                    {transaction.invoice} -{" "}
                                                    {transaction.customer
                                                        ?.name || "Customer"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.transaction_id && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.transaction_id}
                                        </p>
                                    )}
                                </div>

                                {/* Notes */}
                                <div>
                                    <Label htmlFor="notes">Catatan</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) =>
                                            setData("notes", e.target.value)
                                        }
                                        placeholder="Catatan tambahan untuk surat jalan"
                                        rows={3}
                                        className={
                                            errors.notes ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.notes && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.notes}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Lokasi Transfer
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Warehouse */}
                                <div>
                                    <Label htmlFor="warehouse_id">
                                        Gudang Asal *
                                    </Label>
                                    <Select
                                        value={data.warehouse_id}
                                        onValueChange={(value) =>
                                            setData("warehouse_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.warehouse_id
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih gudang asal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map((warehouse) => (
                                                <SelectItem
                                                    key={warehouse.id}
                                                    value={warehouse.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Building className="w-4 h-4" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {warehouse.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    warehouse.address
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.warehouse_id && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.warehouse_id}
                                        </p>
                                    )}
                                </div>

                                {/* Toko */}
                                <div>
                                    <Label htmlFor="toko_id">
                                        Toko Tujuan *
                                    </Label>
                                    <Select
                                        value={data.toko_id}
                                        onValueChange={(value) =>
                                            setData("toko_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.toko_id
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih toko tujuan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tokos.map((toko) => (
                                                <SelectItem
                                                    key={toko.id}
                                                    value={toko.id.toString()}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Store className="w-4 h-4" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {toko.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {toko.address}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.toko_id && (
                                        <p className="text-sm text-red-500 mt-1">
                                            {errors.toko_id}
                                        </p>
                                    )}
                                </div>

                                {/* Transfer Route Preview */}
                                {data.warehouse_id && data.toko_id && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Transfer dari{" "}
                                            <strong>
                                                {
                                                    warehouses.find(
                                                        (w) =>
                                                            w.id.toString() ===
                                                            data.warehouse_id
                                                    )?.name
                                                }
                                            </strong>{" "}
                                            ke{" "}
                                            <strong>
                                                {
                                                    tokos.find(
                                                        (t) =>
                                                            t.id.toString() ===
                                                            data.toko_id
                                                    )?.name
                                                }
                                            </strong>
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>

                        {/* Product Information */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="w-5 h-5" />
                                    Informasi Produk
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Product */}
                                    <div>
                                        <Label htmlFor="product_id">
                                            Produk *
                                        </Label>
                                        <Select
                                            value={data.product_id}
                                            onValueChange={handleProductChange}
                                        >
                                            <SelectTrigger
                                                className={
                                                    errors.product_id
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            >
                                                <SelectValue placeholder="Pilih produk" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((product) => (
                                                    <SelectItem
                                                        key={product.id}
                                                        value={product.id.toString()}
                                                    >
                                                        <div>
                                                            <div className="font-medium">
                                                                {product.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    product.barcode
                                                                }
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.product_id && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.product_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Quantity */}
                                    <div>
                                        <Label htmlFor="qty_transferred">
                                            Jumlah Transfer *
                                        </Label>
                                        <Input
                                            id="qty_transferred"
                                            type="number"
                                            step="0.01"
                                            value={data.qty_transferred}
                                            onChange={(e) =>
                                                setData(
                                                    "qty_transferred",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="0"
                                            className={
                                                errors.qty_transferred
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        />
                                        {errors.qty_transferred && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.qty_transferred}
                                            </p>
                                        )}
                                    </div>

                                    {/* Unit */}
                                    <div>
                                        <Label htmlFor="unit">Satuan *</Label>
                                        <Select
                                            value={data.unit}
                                            onValueChange={handleUnitChange}
                                        >
                                            <SelectTrigger
                                                className={
                                                    errors.unit
                                                        ? "border-red-500"
                                                        : ""
                                                }
                                            >
                                                <SelectValue placeholder="Pilih satuan" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {units.map((unit) => (
                                                    <SelectItem
                                                        key={unit.id}
                                                        value={unit.name}
                                                    >
                                                        <div>
                                                            <div className="font-medium">
                                                                {unit.name}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                1 {unit.name} ={" "}
                                                                {unit.conversion_to_kg ||
                                                                    1}{" "}
                                                                kg
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.unit && (
                                            <p className="text-sm text-red-500 mt-1">
                                                {errors.unit}
                                            </p>
                                        )}
                                    </div>

                                    {/* Qty in KG (Auto calculated) */}
                                    <div>
                                        <Label htmlFor="qty_kg">
                                            Setara (kg)
                                        </Label>
                                        <Input
                                            id="qty_kg"
                                            type="number"
                                            step="0.01"
                                            value={data.qty_kg}
                                            disabled
                                            placeholder="0.00"
                                            className="bg-gray-50"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Otomatis dihitung dari konversi
                                            satuan
                                        </p>
                                    </div>
                                </div>

                                {/* Product Preview */}
                                {selectedProduct && (
                                    <Alert className="mt-4">
                                        <Package className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Produk dipilih:</strong>{" "}
                                            {selectedProduct.name}
                                            {selectedProduct.barcode &&
                                                ` (${selectedProduct.barcode})`}
                                            <br />
                                            <strong>Kategori:</strong>{" "}
                                            {selectedProduct.category?.name ||
                                                "Tidak ada"}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? "Menyimpan..." : "Simpan Surat Jalan"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
