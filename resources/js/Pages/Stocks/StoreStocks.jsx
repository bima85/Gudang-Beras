import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head } from "@inertiajs/react";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Building, Package, Search } from "lucide-react";

const StoreStocks = ({ storeStocks = [], tokos = [] }) => {
    const [filteredStocks, setFilteredStocks] = useState(storeStocks);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedToko, setSelectedToko] = useState("");

    useEffect(() => {
        let filtered = storeStocks;

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

        if (selectedToko) {
            filtered = filtered.filter(
                (stock) => stock.toko_id === parseInt(selectedToko)
            );
        }

        setFilteredStocks(filtered);
    }, [searchTerm, selectedToko, storeStocks]);

    const groupedStocks = filteredStocks.reduce((acc, stock) => {
        const tokoName = stock.toko?.name || "Unknown Store";
        if (!acc[tokoName]) {
            acc[tokoName] = [];
        }
        acc[tokoName].push(stock);
        return acc;
    }, {});

    return (
        <DashboardLayout>
            <Head title="Stok Toko" />

            <div className="py-4">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-xl sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <Building className="w-6 h-6 mr-2 text-green-600" />
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Stok Toko
                                    </h1>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex flex-col gap-4 mb-6 sm:flex-row">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute w-4 h-4 text-gray-400 left-3 top-3" />
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
                                        value={selectedToko}
                                        onChange={(e) =>
                                            setSelectedToko(e.target.value)
                                        }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Semua Toko</option>
                                        {tokos.map((toko) => (
                                            <option
                                                key={toko.id}
                                                value={toko.id}
                                            >
                                                {toko.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
                                <Card className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {Object.keys(groupedStocks).length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Total Toko
                                        </div>
                                    </div>
                                </Card>
                                <Card className="p-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
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
                                            {(() => {
                                                const total =
                                                    filteredStocks.reduce(
                                                        (sum, stock) =>
                                                            sum +
                                                            parseFloat(
                                                                stock.qty_in_kg ||
                                                                    0
                                                            ),
                                                        0
                                                    );
                                                return total % 1 === 0
                                                    ? parseInt(total)
                                                    : total;
                                            })()}
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
                                <div className="py-8 text-center">
                                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                    <p className="text-gray-500">
                                        Tidak ada stok ditemukan
                                    </p>
                                </div>
                            ) : (
                                Object.entries(groupedStocks).map(
                                    ([tokoName, stocks]) => (
                                        <Card key={tokoName} className="mb-6">
                                            <div className="p-4 border-b bg-gray-50">
                                                <h3 className="flex items-center text-lg font-semibold text-gray-900">
                                                    <Building className="w-5 h-5 mr-2" />
                                                    {tokoName}
                                                    <span className="px-2 py-1 ml-2 text-sm text-green-800 bg-green-100 rounded-full">
                                                        {stocks.length} item
                                                    </span>
                                                </h3>
                                            </div>
                                            <div className="p-4">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                    Produk
                                                                </th>
                                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                    Kode
                                                                </th>
                                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                    Stok
                                                                </th>
                                                                <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                                                    Terakhir
                                                                    Update
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {stocks.map(
                                                                (stock) => (
                                                                    <tr
                                                                        key={`${stock.toko_id}-${stock.product_id}`}
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
                                                                                {parseFloat(
                                                                                    stock.qty_in_kg ||
                                                                                        0
                                                                                ) %
                                                                                    1 ===
                                                                                0
                                                                                    ? parseInt(
                                                                                          stock.qty_in_kg ||
                                                                                              0
                                                                                      )
                                                                                    : parseFloat(
                                                                                          stock.qty_in_kg ||
                                                                                              0
                                                                                      )}
                                                                            </span>
                                                                        </td>
                                                                        <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
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

export default StoreStocks;
