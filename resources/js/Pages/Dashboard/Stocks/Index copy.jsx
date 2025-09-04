import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage, router } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import InputSelect from "@/Components/Dashboard/InputSelect";

// Helper untuk format qty
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
    warehouses = [],
    filterProduct = null,
    filterWarehouse = null,
    startDate = "",
    endDate = "",
}) {
    const { flash } = usePage().props;
    const [selectedProduct, setSelectedProduct] = useState(
        products.find((p) => p.id === Number(filterProduct)) || null
    );
    const [selectedWarehouse, setSelectedWarehouse] = useState(
        warehouses.find((w) => w.id === Number(filterWarehouse)) || null
    );
    const [start, setStart] = useState(startDate || "");
    const [end, setEnd] = useState(endDate || "");

    const handleDelete = (productId) => {
        if (confirm("Yakin ingin menghapus SEMUA stok untuk produk ini?")) {
            router.delete(route("stocks.deleteByProduct", productId), {
                onSuccess: () => {
                    // Notifikasi bisa pakai react-hot-toast jika sudah ada
                },
            });
        }
    };

    const handleFilter = () => {
        router.get(
            route("stocks.index"),
            {
                ...(selectedProduct ? { product_id: selectedProduct.id } : {}),
                ...(selectedWarehouse
                    ? { warehouse_id: selectedWarehouse.id }
                    : {}),
                ...(start ? { start_date: start } : {}),
                ...(end ? { end_date: end } : {}),
            },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSelectedProduct(null);
        setSelectedWarehouse(null);
        setStart("");
        setEnd("");
        router.get(route("stocks.index"));
    };

    return (
        <>
            <Head title="Stok" />
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
                {/* Filter Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6 border-b pb-2">
                        Filter Stok
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Tanggal Awal
                            </label>
                            <input
                                type="date"
                                value={start}
                                onChange={(e) => setStart(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm text-gray-700 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-blue-600 min-h-[42px]"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Tanggal Akhir
                            </label>
                            <input
                                type="date"
                                value={end}
                                onChange={(e) => setEnd(e.target.value)}
                                className="w-full px-3 py-2 border rounded-md bg-white text-sm text-gray-700 border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-blue-600 min-h-[42px]"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Produk
                            </label>
                            <InputSelect
                                label={null}
                                data={products}
                                selected={selectedProduct}
                                setSelected={setSelectedProduct}
                                placeholder="Pilih Produk"
                                displayKey="name"
                                searchable
                                className="w-full min-h-[42px]"
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                Warehouse
                            </label>
                            <InputSelect
                                label={null}
                                data={warehouses}
                                selected={selectedWarehouse}
                                setSelected={setSelectedWarehouse}
                                placeholder="Pilih Warehouse"
                                displayKey="name"
                                className="w-full min-h-[42px]"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <Button
                            type="button"
                            label="Filter"
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                        />
                        <Button
                            type="button"
                            label="Reset"
                            onClick={handleReset}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                        />
                        <Button
                            type="link"
                            label="Tambah Stok"
                            href={route("stocks.create")}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 transition-colors"
                        />
                    </div>
                </div>

                {/* Notifikasi */}
                {flash && flash.success && (
                    <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                        {flash.success}
                    </div>
                )}

                {/* Tabel Stok */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-sm text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    No
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Tanggal
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Warehouse
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Barcode
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Kategori
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Produk
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Deskripsi
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Min Stok
                                </th>
                                <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                                    Unit
                                </th>
                                <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">
                                    Qty
                                </th>
                                <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-300">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="text-center text-gray-500 dark:text-gray-400 py-4"
                                    >
                                        Data stok belum ada.
                                    </td>
                                </tr>
                            )}
                            {stocks.map((row, i) => (
                                <tr
                                    key={row.id || i}
                                    className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-4 py-2 text-center">
                                        {i + 1}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.purchase?.date
                                            ? new Date(
                                                  row.purchase.date
                                              ).toLocaleDateString("id-ID")
                                            : row.last_update
                                            ? new Date(
                                                  row.last_update
                                              ).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.warehouse?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.barcode || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.category?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.description || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.product?.min_stock || "-"}
                                    </td>
                                    <td className="px-4 py-2">
                                        {row.unit?.name || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {formatQty(row.total_qty)}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <Button
                                            type="button"
                                            label="Hapus"
                                            onClick={() =>
                                                handleDelete(row.product?.id)
                                            }
                                            className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm min-w-[60px] h-8 flex items-center justify-center"
                                        />
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
