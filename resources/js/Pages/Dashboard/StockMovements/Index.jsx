import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
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
import { Badge } from "@/Components/ui/badge";
import {
    Plus,
    Search,
    Calendar,
    Filter,
    Package,
    Warehouse,
    Store,
    User,
    ArrowUp,
    ArrowDown,
} from "lucide-react";

export default function Index({
    auth,
    stockMovements,
    products,
    warehouses,
    tokos,
    types,
    filters,
    permissions,
}) {
    const [searchFilters, setSearchFilters] = useState({
        product_id: filters.product_id || "all",
        warehouse_id: filters.warehouse_id || "all",
        toko_id: filters.toko_id || "all",
        type: filters.type || "all",
        date_from: filters.date_from || "",
        date_to: filters.date_to || "",
    });

    const handleFilterChange = (key, value) => {
        setSearchFilters((prev) => ({ ...prev, [key]: value }));
    };

    const applyFilters = () => {
        const cleanFilters = Object.entries(searchFilters).reduce(
            (acc, [key, value]) => {
                // Jangan kirim parameter jika value kosong atau "all"
                if (value && value !== "all") {
                    acc[key] = value;
                }
                return acc;
            },
            {}
        );

        router.get(route("stock-movements.index"), cleanFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearchFilters({
            product_id: "all",
            warehouse_id: "all",
            toko_id: "all",
            type: "all",
            date_from: "",
            date_to: "",
        });
        router.get(route("stock-movements.index"));
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

    const formatWeight = (weight) => {
        const num = parseFloat(weight);

        // Format number to show appropriate decimal places
        if (num % 1 === 0) {
            // Whole number, no decimals
            return num.toString();
        } else if (num * 2 % 1 === 0) {
            // Ends with .5, show 1 decimal
            return num.toFixed(1);
        } else {
            // Other decimals, show 2 decimals
            return num.toFixed(2);
        }
    };

    const formatQuantity = (quantity) => {
        const num = parseFloat(quantity);
        const absNum = Math.abs(num);
        const isPositive = num >= 0;

        return (
            <span
                className={`flex items-center ${isPositive ? "text-green-600" : "text-red-600"
                    }`}
            >
                {isPositive ? (
                    <ArrowUp className="w-4 h-4 mr-1" />
                ) : (
                    <ArrowDown className="w-4 h-4 mr-1" />
                )}
                {formatWeight(absNum)} kg
            </span>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Pergerakan Stok" />

            <div className="py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Pergerakan Stok
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                                Kelola dan pantau semua pergerakan stok beras
                            </p>
                        </div>
                        {permissions?.create && (
                            <Link
                                href={route("stock-movements.create")}
                                className="mt-4 sm:mt-0"
                            >
                                <Button className="flex items-center">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Tambah Pergerakan Stok
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Filters */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Filter className="w-5 h-5 mr-2" />
                                Filter Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Produk
                                    </label>
                                    <Select
                                        value={searchFilters.product_id}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                "product_id",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih produk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Produk
                                            </SelectItem>
                                            {products.map((product) => (
                                                <SelectItem
                                                    key={product.id}
                                                    value={product.id.toString()}
                                                >
                                                    {product.name} (
                                                    {product.barcode})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Gudang
                                    </label>
                                    <Select
                                        value={searchFilters.warehouse_id}
                                        onValueChange={(value) =>
                                            handleFilterChange(
                                                "warehouse_id",
                                                value
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
                                                    value={warehouse.id.toString()}
                                                >
                                                    {warehouse.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Toko
                                    </label>
                                    <Select
                                        value={searchFilters.toko_id}
                                        onValueChange={(value) =>
                                            handleFilterChange("toko_id", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih toko" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Toko
                                            </SelectItem>
                                            {tokos.map((toko) => (
                                                <SelectItem
                                                    key={toko.id}
                                                    value={toko.id.toString()}
                                                >
                                                    {toko.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Jenis
                                    </label>
                                    <Select
                                        value={searchFilters.type}
                                        onValueChange={(value) =>
                                            handleFilterChange("type", value)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Jenis
                                            </SelectItem>
                                            {types.map((type) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                >
                                                    {getTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Dari Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        value={searchFilters.date_from}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "date_from",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Sampai Tanggal
                                    </label>
                                    <Input
                                        type="date"
                                        value={searchFilters.date_to}
                                        onChange={(e) =>
                                            handleFilterChange(
                                                "date_to",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-end space-x-2">
                                    <Button
                                        onClick={applyFilters}
                                        className="flex-1"
                                    >
                                        <Search className="w-4 h-4 mr-2" />
                                        Filter
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={clearFilters}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock Movements Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Daftar Pergerakan Stok</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-800">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Tanggal
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Produk
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Gudang
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Toko
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Jenis
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Perubahan
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Saldo Setelah
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                        {stockMovements.data.length > 0 ? (
                                            stockMovements.data.map(
                                                (movement) => (
                                                    <tr
                                                        key={movement.id}
                                                        className="hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    >
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {new Date(
                                                                movement.created_at
                                                            ).toLocaleDateString(
                                                                "id-ID",
                                                                {
                                                                    day: "2-digit",
                                                                    month: "2-digit",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                }
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                        {
                                                                            movement
                                                                                .product
                                                                                ?.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        {
                                                                            movement
                                                                                .product
                                                                                ?.barcode
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Warehouse className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                    {
                                                                        movement
                                                                            .warehouse
                                                                            ?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <Store className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                    {movement
                                                                        .toko
                                                                        ?.name ||
                                                                        "-"}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <Badge
                                                                className={getTypeColor(
                                                                    movement.type
                                                                )}
                                                            >
                                                                {getTypeLabel(
                                                                    movement.type
                                                                )}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                            {formatQuantity(
                                                                movement.quantity_in_kg
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                            {formatWeight(
                                                                movement.balance_after
                                                            )}{" "}
                                                            kg
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="flex items-center">
                                                                <User className="w-4 h-4 mr-2 text-gray-400" />
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                    {
                                                                        movement
                                                                            .user
                                                                            ?.name
                                                                    }
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex space-x-2">
                                                                <Link
                                                                    href={route(
                                                                        "stock-movements.show",
                                                                        movement.id
                                                                    )}
                                                                    className="text-blue-600 hover:text-blue-900"
                                                                >
                                                                    Detail
                                                                </Link>
                                                                {permissions?.edit && (
                                                                    <Link
                                                                        href={route(
                                                                            "stock-movements.edit",
                                                                            movement.id
                                                                        )}
                                                                        className="text-yellow-600 hover:text-yellow-900"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                                                >
                                                    Tidak ada data pergerakan
                                                    stok
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {stockMovements.links && (
                                <div className="mt-4 flex justify-between items-center">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Menampilkan {stockMovements.from || 0}{" "}
                                        sampai {stockMovements.to || 0} dari{" "}
                                        {stockMovements.total || 0} data
                                    </div>
                                    <div className="flex space-x-2">
                                        {stockMovements.links.map(
                                            (link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        link.url &&
                                                        router.get(link.url)
                                                    }
                                                    disabled={!link.url}
                                                    className={`px-3 py-1 text-sm rounded ${link.active
                                                        ? "bg-blue-500 text-white"
                                                        : link.url
                                                            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                        }`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: link.label,
                                                    }}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
