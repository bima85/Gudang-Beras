import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage, router } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import InputSelect from "@/Components/Dashboard/InputSelect";

function formatQty(qty) {
    if (qty == null) return 0;
    if (typeof qty === "string") qty = parseFloat(qty);
    if (Number.isInteger(qty)) return qty;
    return qty % 1 === 0
        ? qty
        : qty.toLocaleString("id-ID", { maximumFractionDigits: 2 });
}

export default function Index({
    stocks,
    products = [],
    units = [],
    warehouses = [],
    filters = {},
}) {
    const { flash } = usePage().props;
    const [selectedProduct, setSelectedProduct] = useState(
        products.find((p) => p.id === Number(filters.product_id)) || null
    );
    const [selectedUnit, setSelectedUnit] = useState(
        units.find((u) => u.id === Number(filters.unit_id)) || null
    );
    const [selectedWarehouse, setSelectedWarehouse] = useState(
        warehouses.find((w) => w.id === Number(filters.warehouse_id)) || null
    );
    const [start, setStart] = useState(filters.start_date || "");
    const [end, setEnd] = useState(filters.end_date || "");

    const handleFilter = () => {
        router.get(
            route("stock-report.index"),
            {
                ...(selectedProduct ? { product_id: selectedProduct.id } : {}),
                ...(selectedUnit ? { unit_id: selectedUnit.id } : {}),
                ...(selectedWarehouse
                    ? { warehouse_id: selectedWarehouse.id }
                    : {}),
                ...(start ? { start_date: start } : {}),
                ...(end ? { end_date: end } : {}),
            },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Laporan Stok" />
            <div className="p-4">
                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Filter Laporan Stok
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                                Tanggal Awal
                            </label>
                            <input
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm text-gray-700 border-gray-200 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:focus:border-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm text-gray-700 border-gray-200 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:focus:border-blue-600"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                                Produk
                            </label>
                            <div className="w-full">
                                <InputSelect
                                    label={null}
                                    data={products}
                                    selected={selectedProduct}
                                    setSelected={setSelectedProduct}
                                    placeholder="Pilih Produk"
                                    displayKey="name"
                                    searchable
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                                Satuan
                            </label>
                            <div className="w-full">
                                <InputSelect
                                    label={null}
                                    data={units}
                                    selected={selectedUnit}
                                    setSelected={setSelectedUnit}
                                    placeholder="Pilih Satuan"
                                    displayKey="name"
                                    className="w-full"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 ml-1">
                                Gudang
                            </label>
                            <div className="w-full">
                                <InputSelect
                                    label={null}
                                    data={warehouses}
                                    selected={selectedWarehouse}
                                    setSelected={setSelectedWarehouse}
                                    placeholder="Pilih Gudang"
                                    displayKey="name"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button
                            type="button"
                            label="Filter"
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        />
                    </div>
                </div>

                {/* Tabel Stok */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-800 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                                    No
                                </th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                                    Tanggal Update
                                </th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                                    Produk
                                </th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                                    Kategori
                                </th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                                    Satuan
                                </th>
                                <th className="px-4 py-2 text-left font-semibold text-gray-600 dark:text-gray-400">
                                    Gudang
                                </th>
                                <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">
                                    Stok Masuk
                                </th>
                                <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">
                                    Stok Keluar
                                </th>
                                <th className="px-4 py-2 text-right font-semibold text-gray-600 dark:text-gray-400">
                                    Stok Akhir
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="text-center text-gray-500 dark:text-gray-400 py-4"
                                    >
                                        Data stok belum ada.
                                    </td>
                                </tr>
                            )}
                            {stocks.map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <td className="px-4 py-2 text-center">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        {row.last_update
                                            ? new Date(
                                                  row.last_update
                                              ).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.category?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.unit?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.warehouse?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {formatQty(row.stok_masuk)}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {formatQty(row.stok_keluar)}
                                    </td>
                                    <td className="px-4 py-2 text-right font-bold">
                                        {formatQty(row.stok_akhir)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
