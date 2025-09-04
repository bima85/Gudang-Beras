import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";

export default function Create({
    products = [],
    tokos = [],
    units = [],
    categories = [],
    subcategories = [],
}) {
    const { data, setData, post, errors } = useForm({
        toko_id: "",
        product_id: "",
        unit_id: "",
        qty: "",
        min_stock: "",
        barcode: "",
        category_id: "",
        subcategory_id: "",
        description: "",
        note: "",
    });
    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-3xl mx-auto">
                <h1 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    Tambah Stok Toko
                </h1>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        post(route("stok-toko.store"));
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">
                                Toko
                            </label>
                            <select
                                name="toko_id"
                                value={data.toko_id}
                                onChange={(e) =>
                                    setData("toko_id", e.target.value)
                                }
                                className="form-select w-full"
                                required
                            >
                                <option value="">Pilih Toko</option>
                                {tokos.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                            </select>
                            {errors.toko_id && (
                                <div className="text-red-500 text-sm">
                                    {errors.toko_id}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">
                                Kode Stok
                            </label>
                            <input
                                type="text"
                                name="kode_stok"
                                className="form-input w-full"
                                placeholder="Masukkan kode stok unik"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">
                                Barcode
                            </label>
                            <input
                                type="text"
                                name="barcode"
                                value={data.barcode}
                                onChange={(e) =>
                                    setData("barcode", e.target.value)
                                }
                                className="form-input w-full"
                                placeholder="Masukkan barcode produk"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">
                                Kategori
                            </label>
                            <select
                                name="category_id"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                className="form-select w-full"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">
                                Subkategori
                            </label>
                            <select
                                name="subcategory_id"
                                value={data.subcategory_id}
                                onChange={(e) =>
                                    setData("subcategory_id", e.target.value)
                                }
                                className="form-select w-full"
                            >
                                <option value="">Pilih Subkategori</option>
                                {subcategories.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">
                                Produk
                            </label>
                            <select
                                name="product_id"
                                value={data.product_id}
                                onChange={(e) =>
                                    setData("product_id", e.target.value)
                                }
                                className="form-select w-full"
                                required
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
                            <label className="block mb-1 font-medium">
                                Satuan
                            </label>
                            <select
                                name="unit_id"
                                value={data.unit_id}
                                onChange={(e) =>
                                    setData("unit_id", e.target.value)
                                }
                                className="form-select w-full"
                                required
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
                        <div>
                            <label className="block mb-1 font-medium">
                                Jumlah
                            </label>
                            <input
                                type="number"
                                name="qty"
                                min="0"
                                value={data.qty}
                                onChange={(e) => setData("qty", e.target.value)}
                                className="form-input w-full"
                                required
                            />
                            {errors.qty && (
                                <div className="text-red-500 text-sm">
                                    {errors.qty}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">
                                Min Stok
                            </label>
                            <input
                                type="number"
                                name="min_stock"
                                min="0"
                                value={data.min_stock}
                                onChange={(e) =>
                                    setData("min_stock", e.target.value)
                                }
                                className="form-input w-full"
                                placeholder="Minimal stok untuk produk ini"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium">
                                Deskripsi
                            </label>
                            <textarea
                                name="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="form-input w-full"
                                placeholder="Deskripsi produk (opsional)"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block mb-1 font-medium">
                                Catatan (Opsional)
                            </label>
                            <textarea
                                name="note"
                                value={data.note}
                                onChange={(e) =>
                                    setData("note", e.target.value)
                                }
                                className="form-input w-full"
                                placeholder="Catatan tambahan..."
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                        <Link
                            href={route("stok-toko.index")}
                            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
                        >
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

Create.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
