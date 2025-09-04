import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";

export default function Create({ products, warehouses, units }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: "",
        warehouse_id: "",
        date: new Date().toISOString().split("T")[0],
        type: "in",
        qty_original: "",
        unit_id: "",
        note: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("stock-cards.store"));
    };

    return (
        <>
            <Head title="Tambah Kartu Stok" />
            <div className="p-4 w-full max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                    Tambah Kartu Stok
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Produk
                        </label>
                        <select
                            value={data.product_id}
                            onChange={(e) =>
                                setData("product_id", e.target.value)
                            }
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Pilih Produk</option>
                            {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        {errors.product_id && (
                            <div className="text-red-500 text-sm">
                                {errors.product_id}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Gudang
                        </label>
                        <select
                            value={data.warehouse_id}
                            onChange={(e) =>
                                setData("warehouse_id", e.target.value)
                            }
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Pilih Gudang</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                        {errors.warehouse_id && (
                            <div className="text-red-500 text-sm">
                                {errors.warehouse_id}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Tanggal
                        </label>
                        <input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData("date", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.date && (
                            <div className="text-red-500 text-sm">
                                {errors.date}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Jenis Transaksi
                        </label>
                        <select
                            value={data.type}
                            onChange={(e) => setData("type", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="in">Masuk</option>
                            <option value="out">Keluar</option>
                            <option value="adjustment">Penyesuaian</option>
                        </select>
                        {errors.type && (
                            <div className="text-red-500 text-sm">
                                {errors.type}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <div className="w-2/3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Qty
                            </label>
                            <input
                                type="number"
                                value={data.qty_original}
                                onChange={(e) =>
                                    setData("qty_original", e.target.value)
                                }
                                className="w-full border rounded px-3 py-2"
                                step="any"
                            />
                            {errors.qty_original && (
                                <div className="text-red-500 text-sm">
                                    {errors.qty_original}
                                </div>
                            )}
                        </div>
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Satuan
                            </label>
                            <select
                                value={data.unit_id}
                                onChange={(e) =>
                                    setData("unit_id", e.target.value)
                                }
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="">Pilih Satuan</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                            {errors.unit_id && (
                                <div className="text-red-500 text-sm">
                                    {errors.unit_id}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            value={data.note}
                            onChange={(e) => setData("note", e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
