import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Warehouse, Package, Search } from "lucide-react";

const WarehouseStocks = ({ warehouseStocks = [], warehouses = [] }) => {
    const [filteredStocks, setFilteredStocks] = useState(warehouseStocks);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState("");

    useEffect(() => {
        let filtered = warehouseStocks;

        if (searchTerm) {
            filtered = filtered.filter(
                (stock) =>
                    stock.product?.name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    stock.product?.code
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())
            );
        }

        if (selectedWarehouse) {
            filtered = filtered.filter(
                (stock) => stock.warehouse_id === parseInt(selectedWarehouse)
            );
        }

        setFilteredStocks(filtered);
    }, [searchTerm, selectedWarehouse, warehouseStocks]);

    const groupedStocks = filteredStocks.reduce((acc, stock) => {
        const warehouseName = stock.warehouse?.name || "Unknown Warehouse";
        if (!acc[warehouseName]) {
            acc[warehouseName] = [];
        }
        acc[warehouseName].push(stock);
        return acc;
    }, {});

    return (
        <DashboardLayout>
            <Head title="Stok Gudang" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center">
                                    <Warehouse className="h-6 w-6 text-blue-600 mr-2" />
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Stok Gudang
                                    </h1>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="text"
                                            placeholder="Cari produk..."
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                <div className="w-full sm:w-64">
                                    <select
                                        value={selectedWarehouse}
                                        onChange={(e) =>
                                            setSelectedWarehouse(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Semua Gudang</option>
                                        {warehouses.map((warehouse) => (
                                            <option
                                                key={warehouse.id}
                                                value={warehouse.id}
                                            >
                                                {warehouse.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <Card className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {Object.keys(groupedStocks).length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Gudang
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {filteredStocks.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Item Produk
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {filteredStocks.reduce(
                                                (sum, stock) =>
                                                    sum + stock.qty_in_kg,
                                                0
                                            )}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Stok
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>

                        <div className="p-6">
                            {Object.keys(groupedStocks).length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">
                                        Tidak ada stok ditemukan
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedStocks).map(
                                    ([warehouseName, stocks]) => (
                                        <Card
                                            key={warehouseName}
                                            className="mb-6"
                                        >
                                            <div className="p-4 border-b bg-gray-50">
                                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                                    <Warehouse className="h-5 w-5 mr-2" />
                                                    {warehouseName}
                                                    <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                        {stocks.length} item
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Produk
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Kode
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Stok
                                                                </th>
                                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Terakhir
                                                                    Update
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {stocks.map(
                                                                (stock) => (
                                                                    <tr
                                                                        key={`${stock.warehouse_id}-${stock.product_id}`}
                                                                    >
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                {stock
                                                                                    .product
                                                                                    ?.name ||
                                                                                    "N/A"}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <div className="text-sm text-gray-500">
                                                                                {stock
                                                                                    .product
                                                                                    ?.code ||
                                                                                    "N/A"}
                                                                            </div>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                                            <span
                                                                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                                    stock.qty_in_kg >
                                                                                    10
                                                                                        ? "bg-green-100 text-green-800"
                                                                                        : stock.qty_in_kg >
                                                                                          0
                                                                                        ? "bg-yellow-100 text-yellow-800"
                                                                                        : "bg-red-100 text-red-800"
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    stock.qty_in_kg
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                            {stock.updated_at
                                                                                ? new Date(
                                                                                      stock.updated_at
                                                                                  ).toLocaleDateString(
                                                                                      "id-ID"
                                                                                  )
                                                                                : "N/A"}
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default WarehouseStocks;
