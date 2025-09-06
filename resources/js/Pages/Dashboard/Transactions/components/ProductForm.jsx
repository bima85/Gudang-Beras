import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/Components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { Package, Search, Plus, AlertTriangle } from "lucide-react";

export default function ProductForm({
    barcode,
    setBarcode,
    product,
    stokToko,
    pakaiStokToko,
    setPakaiStokToko,
    categories,
    subcategories,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedWarehouse,
    setSelectedWarehouse,
    selectedToko,
    setSelectedToko,
    selectedProduct,
    setSelectedProduct,
    filteredProducts = [],
    warehouses,
    tokos = [],
    isLoadingProduct,
    searchProduct,
    addToCart,
    isUserToko,
    className,
    sellingPrice,
    setSellingPrice,
    useSuratJalan,
    setUseSuratJalan,
    selectedUnit,
    setSelectedUnit,
    units = [],
    qty,
    setQty,
}) {
    // Safe formatter to avoid rendering NaN
    const formatNumber = (value, decimals = 2) => {
        const num = Number(value);
        if (isNaN(num) || !isFinite(num)) return (0).toFixed(decimals);
        return num.toFixed(decimals);
    };
    const [showManualQtyWarning, setShowManualQtyWarning] = useState(false);
    const [tempQty, setTempQty] = useState("");

    const handleBarcodeKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            searchProduct(barcode, selectedWarehouse, null);
        }
    };

    // Handle qty change with multiple of 50 validation
    const handleQtyChange = (value) => {
        const numValue = parseInt(value) || 0;

        if (numValue > 0 && numValue < 50) {
            // Show warning for manual input if less than 50
            setTempQty(value);
            setShowManualQtyWarning(true);
        } else {
            // Set directly if 0 or >= 50
            setQty(value);
        }
    };

    // Generate qty options in multiples of 50
    const generateQtyOptions = () => {
        const options = [];
        for (let i = 50; i <= 500; i += 50) {
            options.push(i);
        }
        return options;
    };

    const confirmManualQty = () => {
        setQty(tempQty);
        setShowManualQtyWarning(false);
        setTempQty("");
    };

    const cancelManualQty = () => {
        setShowManualQtyWarning(false);
        setTempQty("");
    };

    const filteredSubcategories = selectedCategory
        ? subcategories.filter((sub) => sub.category_id === selectedCategory)
        : [];

    // Determine default stock source and availability
    // Get stock in kg from backend
    const storeStockKg = product.store_stock_kg || 0;
    const warehouseStockKg = product.warehouse_stock_kg || 0;

    // Convert to product unit if conversion available (ensure numeric)
    const unitConversion = Number(product.unit?.conversion_to_kg) || 1;
    const safeUnitConversion =
        isNaN(unitConversion) ||
        !isFinite(unitConversion) ||
        unitConversion <= 0
            ? 1
            : unitConversion;

    const storeStockKgNum = Number(storeStockKg) || 0;
    const warehouseStockKgNum = Number(warehouseStockKg) || 0;

    const storeStock =
        safeUnitConversion > 0
            ? storeStockKgNum / safeUnitConversion
            : storeStockKgNum;

    const warehouseStock =
        safeUnitConversion > 0
            ? warehouseStockKgNum / safeUnitConversion
            : warehouseStockKgNum;

    const hasStoreStock = Number(storeStock) > 0;
    const hasWarehouseStock = Number(warehouseStock) > 0;

    // Default to store stock if available, otherwise warehouse stock
    const defaultUseStoreStock = hasStoreStock;
    const currentStock = pakaiStokToko ? storeStock : warehouseStock;
    const hasCurrentStock = Number(currentStock) > 0;

    // Auto set default stock source when product changes
    useEffect(() => {
        if (product.id) {
            // Default to store stock if available, otherwise warehouse stock
            setPakaiStokToko(hasStoreStock);
        }
    }, [product.id, hasStoreStock, setPakaiStokToko]);

    return (
        <Card className={cn("h-fit", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-primary" />
                    Pencarian Produk
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Barcode Search */}
                <div className="space-y-2">
                    <Label htmlFor="barcode" className="text-sm font-medium">
                        Barcode / Nama Produk
                    </Label>
                    <div className="flex gap-2">
                        <Input
                            id="barcode"
                            type="text"
                            value={barcode}
                            onChange={(e) => setBarcode(e.target.value)}
                            onKeyDown={handleBarcodeKeyDown}
                            placeholder="Scan barcode atau ketik nama produk..."
                            className="flex-1"
                            disabled={isLoadingProduct}
                        />
                        <Button
                            onClick={() =>
                                searchProduct(barcode, selectedWarehouse, null)
                            }
                            disabled={isLoadingProduct || !barcode.trim()}
                            size="sm"
                            className="px-3"
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={() => {
                                setBarcode("");
                                // Show all products
                                if (searchProduct) {
                                    searchProduct("", selectedWarehouse, null);
                                }
                            }}
                            disabled={isLoadingProduct}
                            variant="outline"
                            size="sm"
                            className="px-3"
                            title="Tampilkan semua produk"
                        >
                            <Package className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Status Gudang & Toko */}
                    {(selectedWarehouse || selectedToko) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {selectedWarehouse && (
                                <Badge variant="secondary" className="text-xs">
                                    📦 Gudang:{" "}
                                    {warehouses.find(
                                        (w) => w.id === selectedWarehouse
                                    )?.name || "Default"}
                                </Badge>
                            )}
                            {selectedToko && (
                                <Badge variant="secondary" className="text-xs">
                                    🏪 Toko: {selectedToko.name || "Default"}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Category Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Kategori</Label>
                        <Select
                            value={selectedCategory?.toString() || "all"}
                            onValueChange={(value) => {
                                setSelectedCategory(
                                    value && value !== "all"
                                        ? parseInt(value)
                                        : null
                                );
                                setSelectedSubcategory(null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Kategori
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={
                                            category.id?.toString() ||
                                            `category-${category.id}`
                                        }
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Subcategory Filter */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">
                            Sub Kategori
                        </Label>
                        <Select
                            value={selectedSubcategory?.toString() || "all"}
                            onValueChange={(value) =>
                                setSelectedSubcategory(
                                    value && value !== "all"
                                        ? parseInt(value)
                                        : null
                                )
                            }
                            disabled={!selectedCategory}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih sub kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Sub Kategori
                                </SelectItem>
                                {filteredSubcategories.map((subcategory) => (
                                    <SelectItem
                                        key={subcategory.id}
                                        value={
                                            subcategory.id?.toString() ||
                                            `subcategory-${subcategory.id}`
                                        }
                                    >
                                        {subcategory.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {/* Product Selection */}
                    {filteredProducts.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">
                                Pilih Produk
                            </Label>
                            <Select
                                value={
                                    selectedProduct?.id?.toString() || "clear"
                                }
                                onValueChange={(value) => {
                                    if (value && value !== "clear") {
                                        const product = filteredProducts.find(
                                            (p) => p.id.toString() === value
                                        );
                                        setSelectedProduct(product);
                                    } else {
                                        setSelectedProduct(null);
                                        setBarcode("");
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih produk dari daftar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="clear">
                                        Kosongkan pilihan
                                    </SelectItem>
                                    {filteredProducts.map((prod) => (
                                        <SelectItem
                                            key={prod.id}
                                            value={prod.id.toString()}
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <span>{prod.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className="ml-2"
                                                >
                                                    {prod.barcode ||
                                                        "No Barcode"}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {filteredProducts.length} produk ditemukan
                            </p>
                        </div>
                    )}

                    {/* Warehouse Filter - Hidden but functional */}
                    <div className="hidden">
                        <Label className="text-sm font-medium">Gudang</Label>
                        <Select
                            value={selectedWarehouse?.toString() || "all"}
                            onValueChange={(value) =>
                                setSelectedWarehouse(
                                    value && value !== "all"
                                        ? parseInt(value)
                                        : null
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih gudang" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Semua Gudang
                                </SelectItem>
                                {warehouses.map((warehouse) => (
                                    <SelectItem
                                        key={warehouse.id}
                                        value={
                                            warehouse.id?.toString() ||
                                            `warehouse-${warehouse.id}`
                                        }
                                    >
                                        {warehouse.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Toko Filter - Hidden but functional */}
                    <div className="hidden">
                        <Label className="text-sm font-medium">Toko</Label>
                        <Select
                            value={selectedToko?.id?.toString() || "all"}
                            onValueChange={(value) => {
                                if (value === "all") {
                                    setSelectedToko(null);
                                } else {
                                    const toko = tokos.find(
                                        (t) => t.id.toString() === value
                                    );
                                    setSelectedToko(toko);
                                }
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih toko" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Toko</SelectItem>
                                {tokos.map((toko) => (
                                    <SelectItem
                                        key={toko.id}
                                        value={
                                            toko.id?.toString() ||
                                            `toko-${toko.id}`
                                        }
                                    >
                                        {toko.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Unit Selection */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Unit Satuan</Label>
                    <Select
                        value={selectedUnit?.toString() || ""}
                        onValueChange={(value) => {
                            setSelectedUnit(value ? parseInt(value) : null);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih unit satuan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Unit</SelectItem>
                            {units.map((unit) => (
                                <SelectItem
                                    key={unit.id}
                                    value={
                                        unit.id?.toString() || `unit-${unit.id}`
                                    }
                                >
                                    {unit.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Product Info */}
                {product && Object.keys(product).length > 0 && (
                    <div className="p-4 space-y-4 border rounded-lg bg-muted/30">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                    {product.name}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {product.barcode}
                                    </Badge>
                                    {product.category && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {product.category.name}
                                        </Badge>
                                    )}
                                    {product.subcategory && (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs"
                                        >
                                            {product.subcategory.name}
                                        </Badge>
                                    )}
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>
                                        <span className="font-medium">
                                            Harga:
                                        </span>{" "}
                                        <span
                                            className={cn(
                                                "font-semibold",
                                                !product.purchase_price ||
                                                    product.purchase_price <= 0
                                                    ? "text-destructive"
                                                    : "text-foreground"
                                            )}
                                        >
                                            Rp{" "}
                                            {parseInt(
                                                product.purchase_price || 0
                                            ).toLocaleString("id-ID")}
                                            {(!product.purchase_price ||
                                                product.purchase_price <=
                                                    0) && (
                                                <span className="ml-1 text-xs">
                                                    ⚠️
                                                </span>
                                            )}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Stok Gudang:
                                        </span>{" "}
                                        <span
                                            className={cn(
                                                "text-foreground",
                                                warehouseStock <= 0 &&
                                                    "text-destructive",
                                                !pakaiStokToko &&
                                                    "font-bold text-primary"
                                            )}
                                        >
                                            {formatNumber(warehouseStock)}{" "}
                                            {product.unit?.name || "unit"}
                                            {Number(warehouseStockKg) !==
                                                Number(warehouseStock) && (
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    (
                                                    {formatNumber(
                                                        warehouseStockKg
                                                    )}{" "}
                                                    kg)
                                                </span>
                                            )}
                                            {warehouseStock <= 0 && (
                                                <span className="ml-1 text-xs">
                                                    ⚠️
                                                </span>
                                            )}
                                            {!pakaiStokToko &&
                                                warehouseStock > 0 && (
                                                    <span className="px-1 ml-1 text-xs rounded bg-primary text-primary-foreground">
                                                        AKTIF
                                                    </span>
                                                )}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="font-medium">
                                            Stok Toko:
                                        </span>{" "}
                                        <span
                                            className={cn(
                                                "text-foreground",
                                                storeStock <= 0 &&
                                                    "text-destructive",
                                                pakaiStokToko &&
                                                    "font-bold text-primary"
                                            )}
                                        >
                                            {formatNumber(storeStock)}{" "}
                                            {product.unit?.name || "unit"}
                                            {storeStockKg !== storeStock && (
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    (
                                                    {formatNumber(storeStockKg)}{" "}
                                                    kg)
                                                </span>
                                            )}
                                            {storeStock <= 0 && (
                                                <span className="ml-1 text-xs">
                                                    ⚠️
                                                </span>
                                            )}
                                            {pakaiStokToko &&
                                                storeStock > 0 && (
                                                    <span className="px-1 ml-1 text-xs rounded bg-primary text-primary-foreground">
                                                        AKTIF
                                                    </span>
                                                )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Selling Price Input */}
                        <div className="p-3 space-y-2 border rounded bg-background/50">
                            <Label
                                htmlFor="selling-price"
                                className="text-sm font-medium"
                            >
                                Harga Jual
                            </Label>
                            <Input
                                id="selling-price"
                                type="number"
                                value={sellingPrice || ""}
                                onChange={(e) =>
                                    setSellingPrice(e.target.value)
                                }
                                placeholder="Masukkan harga jual..."
                                className="w-full"
                                min="0"
                                step="1"
                            />
                            <p className="text-xs text-muted-foreground">
                                Harga jual untuk transaksi ini
                            </p>
                        </div>

                        {/* Quantity Selection */}
                        <div className="p-3 space-y-2 border rounded bg-background/50">
                            <Label className="text-sm font-medium">
                                Jumlah Qty
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                                {/* Quick Select - Multiples of 50 */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Pilih Cepat (Kelipatan 50)
                                    </Label>
                                    <Select
                                        value={qty?.toString() || ""}
                                        onValueChange={(value) => {
                                            if (value !== "custom") {
                                                setQty(value);
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih qty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom" disabled>
                                                -- Kelipatan 50 --
                                            </SelectItem>
                                            {generateQtyOptions().map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option}
                                                        value={option.toString()}
                                                    >
                                                        {option} pcs
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Manual Input */}
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">
                                        Input Manual
                                    </Label>
                                    <Input
                                        type="number"
                                        value={qty || ""}
                                        onChange={(e) =>
                                            handleQtyChange(e.target.value)
                                        }
                                        placeholder="Masukkan qty..."
                                        className="w-full"
                                        min="1"
                                        step="1"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <AlertTriangle className="w-3 h-3" />
                                <span>
                                    Disarankan kelipatan 50 untuk efisiensi
                                </span>
                            </div>
                        </div>

                        {/* Stock Source Options */}
                        {hasStoreStock ? (
                            /* If store stock available, only show store stock info */
                            <div className="p-4 space-y-3 border rounded bg-background/50">
                                <Label className="text-sm font-medium">
                                    Sumber Stok
                                </Label>
                                <div className="flex items-center p-3 space-x-3 rounded-lg bg-primary/10">
                                    <div className="flex items-center justify-center w-5 h-5 border-2 rounded bg-primary border-primary">
                                        <svg
                                            className="w-3 h-3 text-primary-foreground"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <Label className="flex-1 text-sm font-medium text-primary">
                                        Menggunakan stok toko (
                                        {formatNumber(storeStock)}{" "}
                                        {product.unit?.name || "unit"})
                                        {Number(storeStockKg) !==
                                            Number(storeStock) && (
                                            <span className="ml-1 text-xs text-muted-foreground">
                                                ({formatNumber(storeStockKg)}{" "}
                                                kg)
                                            </span>
                                        )}
                                        <span className="px-2 py-1 ml-2 text-xs rounded bg-primary text-primary-foreground">
                                            OTOMATIS
                                        </span>
                                    </Label>
                                </div>
                                <p className="pl-8 text-xs text-muted-foreground">
                                    Stok toko tersedia, otomatis menggunakan
                                    stok toko
                                </p>
                            </div>
                        ) : (
                            /* If no store stock, show warehouse stock and conditional options */
                            <div className="p-4 space-y-4 border rounded bg-background/50">
                                <Label className="text-sm font-medium">
                                    Sumber Stok
                                </Label>

                                <div className="space-y-3">
                                    {/* Store Stock Info (Empty) */}
                                    <div className="flex items-center p-3 space-x-3 rounded-lg bg-muted/50">
                                        <div className="w-5 h-5 border-2 rounded border-muted bg-muted"></div>
                                        <Label className="flex-1 text-sm text-muted-foreground">
                                            Stok toko habis (
                                            {formatNumber(storeStock)}{" "}
                                            {product.unit?.name || "unit"})
                                            <span className="px-2 py-1 ml-2 text-xs rounded text-destructive bg-destructive/10">
                                                TIDAK TERSEDIA
                                            </span>
                                        </Label>
                                    </div>

                                    {/* Warehouse Stock Option */}
                                    <div className="flex items-center space-x-3">
                                        <Checkbox
                                            id="use-warehouse-stock"
                                            checked={!pakaiStokToko}
                                            onCheckedChange={(checked) =>
                                                setPakaiStokToko(!checked)
                                            }
                                            disabled={!hasWarehouseStock}
                                            className="w-5 h-5"
                                        />
                                        <Label
                                            htmlFor="use-warehouse-stock"
                                            className={cn(
                                                "text-sm cursor-pointer flex-1",
                                                !hasWarehouseStock
                                                    ? "text-muted-foreground"
                                                    : "font-medium"
                                            )}
                                        >
                                            Gunakan stok gudang (
                                            {formatNumber(warehouseStock)}{" "}
                                            {product.unit?.name || "unit"})
                                            {warehouseStockKg !==
                                                warehouseStock && (
                                                <span className="ml-1 text-xs text-muted-foreground">
                                                    (
                                                    {formatNumber(
                                                        warehouseStockKg
                                                    )}{" "}
                                                    kg)
                                                </span>
                                            )}
                                            {!hasWarehouseStock && (
                                                <span className="px-2 py-1 ml-2 text-xs rounded text-destructive bg-destructive/10">
                                                    HABIS
                                                </span>
                                            )}
                                            {!pakaiStokToko &&
                                                hasWarehouseStock && (
                                                    <span className="px-2 py-1 ml-2 text-xs rounded text-primary bg-primary/10">
                                                        TERPILIH
                                                    </span>
                                                )}
                                        </Label>
                                    </div>
                                </div>

                                {/* Stock Summary */}
                                <div className="pt-3 border-t">
                                    <p className="text-xs text-muted-foreground">
                                        <span className="font-medium">
                                            Stok yang akan digunakan:
                                        </span>{" "}
                                        <span
                                            className={cn(
                                                "font-bold",
                                                hasCurrentStock
                                                    ? "text-primary"
                                                    : "text-destructive"
                                            )}
                                        >
                                            {formatNumber(currentStock)}{" "}
                                            {product.unit?.name || "unit"}
                                            {pakaiStokToko
                                                ? " (dari toko)"
                                                : " (dari gudang)"}
                                            {/* Show kg equivalent if different */}
                                            {(pakaiStokToko
                                                ? storeStockKg
                                                : warehouseStockKg) !==
                                                currentStock && (
                                                <span className="ml-1 text-muted-foreground">
                                                    ={" "}
                                                    {formatNumber(
                                                        pakaiStokToko
                                                            ? storeStockKg
                                                            : warehouseStockKg
                                                    )}{" "}
                                                    kg
                                                </span>
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Surat Jalan Option - Only show when no store stock */}
                        {!hasStoreStock && (
                            <div className="p-4 space-y-3 border rounded bg-background/50">
                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="use-surat-jalan"
                                        checked={useSuratJalan}
                                        onCheckedChange={setUseSuratJalan}
                                        className="w-5 h-5"
                                    />
                                    <Label
                                        htmlFor="use-surat-jalan"
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        Menggunakan Surat Jalan
                                    </Label>
                                </div>
                                <p className="pl-8 text-xs text-muted-foreground">
                                    Centang jika transaksi ini menggunakan surat
                                    jalan
                                </p>
                            </div>
                        )}

                        {/* Add to Cart Button */}
                        <div className="space-y-2">
                            <Button
                                onClick={addToCart}
                                className="w-full"
                                disabled={
                                    !product.id ||
                                    !product.purchase_price ||
                                    product.purchase_price <= 0 ||
                                    !sellingPrice ||
                                    parseFloat(sellingPrice) <= 0 ||
                                    !qty ||
                                    parseInt(qty) <= 0 ||
                                    !hasCurrentStock
                                }
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah ke Keranjang
                            </Button>

                            {/* Warning Messages */}
                            {product.id && (
                                <div className="space-y-1">
                                    {(!product.purchase_price ||
                                        product.purchase_price <= 0) && (
                                        <p className="text-xs font-medium text-destructive">
                                            ⚠️ Produk tidak memiliki harga
                                            pembelian yang valid
                                        </p>
                                    )}
                                    {(!sellingPrice ||
                                        parseFloat(sellingPrice) <= 0) && (
                                        <p className="text-xs font-medium text-destructive">
                                            ⚠️ Harga jual harus diisi dan lebih
                                            dari 0
                                        </p>
                                    )}
                                    {(!qty || parseInt(qty) <= 0) && (
                                        <p className="text-xs font-medium text-destructive">
                                            ⚠️ Qty harus diisi dan lebih dari 0
                                        </p>
                                    )}
                                    {!hasCurrentStock && (
                                        <p className="text-xs font-medium text-destructive">
                                            ⚠️ Stok{" "}
                                            {pakaiStokToko ? "toko" : "gudang"}{" "}
                                            kosong
                                        </p>
                                    )}
                                    {!hasStoreStock && !hasWarehouseStock && (
                                        <p className="text-xs font-medium text-destructive">
                                            ⚠️ Tidak ada stok tersedia di toko
                                            maupun gudang
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {isLoadingProduct && (
                    <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <div className="w-4 h-4 border-2 rounded-full border-primary border-t-transparent animate-spin"></div>
                            <span className="text-sm">Mencari produk...</span>
                        </div>
                    </div>
                )}
            </CardContent>

            {/* Manual Qty Warning Dialog */}
            <AlertDialog
                open={showManualQtyWarning}
                onOpenChange={setShowManualQtyWarning}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Konfirmasi Qty Manual
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Anda memasukkan qty <strong>{tempQty}</strong> yang
                            kurang dari 50. Disarankan menggunakan kelipatan 50
                            untuk efisiensi operasional.
                            <br />
                            <br />
                            Apakah Anda yakin ingin menggunakan qty manual ini?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelManualQty}>
                            Batal
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={confirmManualQty}>
                            Ya, Gunakan Qty Manual
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
