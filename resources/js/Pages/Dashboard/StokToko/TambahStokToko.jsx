import React, { useState } from "react";
import { router } from "@inertiajs/react";

function TambahStokToko({ products = [], tokos = [], units = [] }) {
    const [form, setForm] = useState({
        product_id: "",
        toko_id: "",
        unit_id: "",
        qty: "",
        keterangan: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(route("stok-toko.tambah"), form, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8 max-w-lg mx-auto"
        >
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">
                Tambah Stok Toko
            </h2>
            <div className="mb-4">
                <label className="block mb-1">Produk</label>
                <select
                    name="product_id"
                    value={form.product_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Pilih Produk</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Toko</label>
                <select
                    name="toko_id"
                    value={form.toko_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Pilih Toko</option>
                    {tokos.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Unit</label>
                <select
                    name="unit_id"
                    value={form.unit_id}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="">Pilih Unit</option>
                    {units.map((u) => (
                        <option key={u.id} value={u.id}>
                            {u.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="mb-4">
                <label className="block mb-1">Qty</label>
                <input
                    type="number"
                    name="qty"
                    value={form.qty}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                    required
                    min="1"
                />
            </div>
            <div className="mb-4">
                <label className="block mb-1">Keterangan</label>
                <input
                    type="text"
                    name="keterangan"
                    value={form.keterangan}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded"
                disabled={loading}
            >
                {loading ? "Menyimpan..." : "Tambah Stok"}
            </button>
        </form>
    );
}

export default TambahStokToko;
