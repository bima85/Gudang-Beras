import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import Button from "@/Components/Dashboard/Button";

export default function Create({
    products = [],
    warehouses = [],
    units = [],
    categories = [],
    subcategories = [],
    customers = [],
}) {
    const { errors } = usePage().props;
    const [form, setForm] = useState({
        kode: "",
        barcode: "",
        category_id: "",
        subcategory_id: "",
        product_id: "",
        unit_id: "",
        warehouse_id: "",
        qty: "",
        note: "",
        kode_kategori: "",
        kode_subkategori: "",
        description: "",
        min_stock: "",
        customer_id: "",
    });
    const [loading, setLoading] = useState(false);
    // State untuk preview konversi
    const [preview, setPreview] = useState({ ton: 0, sak: 0, kg: 0 });

    // Fungsi konversi qty ke ton, sak, kg (1 ton = 1000kg, 1 sak = 50kg)
    const convertQty = (qty, unitId) => {
        const unit = units.find((u) => u.id == unitId);
        const multiplier = unit?.multiplier || 1;
        const qtyKg = (parseFloat(qty) || 0) * multiplier;
        const ton = Math.floor(qtyKg / 1000);
        const sisaKgSetelahTon = qtyKg % 1000;
        const sak = Math.floor(sisaKgSetelahTon / 50);
        const kg = sisaKgSetelahTon % 50;
        return { ton, sak, kg };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let nextForm = { ...form };
        if (name === "product_id") {
            const selectedProduct = products.find((p) => p.id == value);
            nextForm = {
                ...nextForm,
                product_id: value,
                barcode: selectedProduct?.barcode || "",
                category_id: selectedProduct?.category_id || "",
                subcategory_id: selectedProduct?.subcategory_id || "",
                kode_kategori: selectedProduct?.category_code || "",
                kode_subkategori: selectedProduct?.subcategory_code || "",
                description: selectedProduct?.description || "",
                min_stock: selectedProduct?.min_stock || "",
            };
        } else if (name === "category_id") {
            const selectedCategory = categories.find((c) => c.id == value);
            nextForm = {
                ...nextForm,
                category_id: value,
                kode_kategori: selectedCategory?.code || "",
                subcategory_id: "",
                kode_subkategori: "",
            };
        } else if (name === "subcategory_id") {
            const selectedSub = subcategories.find((s) => s.id == value);
            nextForm = {
                ...nextForm,
                subcategory_id: value,
                kode_subkategori: selectedSub?.code || "",
            };
        } else {
            nextForm = { ...form, [name]: value };
        }
        setForm(nextForm);
        // Update preview konversi jika qty/unit_id berubah
        if (
            (name === "qty" && nextForm.unit_id) ||
            (name === "unit_id" && nextForm.qty)
        ) {
            setPreview(
                convertQty(
                    name === "qty" ? value : nextForm.qty,
                    name === "unit_id" ? value : nextForm.unit_id
                )
            );
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.customer_id) {
            alert("Customer harus dipilih.");
            return;
        }
        setLoading(true);
        Inertia.post(route("stocks.store"), form, {
            onFinish: () => setLoading(false),
        });
    };

    return (
        <>
            <Head title="Tambah Stok Awal" />
            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-950 rounded-lg shadow border dark:border-gray-900 p-6 mt-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-gray-100">
                    Tambah Stok Awal
                </h2>
                {Object.keys(errors || {}).length > 0 && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm dark:bg-red-900 dark:border-red-700 dark:text-red-200">
                        {Object.values(errors).map((error, index) => (
                            <p key={index} className="mb-1 last:mb-0">
                                {error}
                            </p>
                        ))}
                    </div>
                )}
                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Customer
                        </label>
                        <select
                            name="customer_id"
                            value={form.customer_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-gray-200"
                            required
                        >
                            <option value="">Pilih Customer</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Kode Stok
                        </label>
                        <input
                            type="text"
                            name="kode"
                            value={form.kode}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            placeholder="Masukkan kode stok unik"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Barcode
                        </label>
                        <input
                            type="text"
                            name="barcode"
                            value={form.barcode}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            placeholder="Masukkan barcode produk"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Kode Kategori
                        </label>
                        <input
                            type="text"
                            name="kode_kategori"
                            value={form.kode_kategori}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            placeholder="Kode kategori otomatis"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Kode Subkategori
                        </label>
                        <input
                            type="text"
                            name="kode_subkategori"
                            value={form.kode_subkategori}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            placeholder="Kode subkategori otomatis"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Kategori
                        </label>
                        <select
                            name="category_id"
                            value={form.category_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-gray-200"
                        >
                            <option value="">Pilih Kategori</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Subkategori
                        </label>
                        <select
                            name="subcategory_id"
                            value={form.subcategory_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-gray-200"
                        >
                            <option value="">Pilih Subkategori</option>
                            {subcategories
                                .filter(
                                    (sub) =>
                                        !form.category_id ||
                                        sub.category_id == form.category_id
                                )
                                .map((sub) => (
                                    <option key={sub.id} value={sub.id}>
                                        {sub.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Produk
                        </label>
                        <select
                            name="product_id"
                            value={form.product_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-gray-200"
                            required
                        >
                            <option value="">Pilih Produk</option>
                            {products
                                .filter((p) =>
                                    !form.category_id || !form.subcategory_id
                                        ? true
                                        : p.category_id == form.category_id &&
                                          p.subcategory_id ==
                                              form.subcategory_id
                                )
                                .map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Gudang
                        </label>
                        <select
                            name="warehouse_id"
                            value={form.warehouse_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-gray-200"
                            required
                        >
                            <option value="">Pilih Gudang</option>
                            {warehouses.map((w) => (
                                <option key={w.id} value={w.id}>
                                    {w.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Satuan
                        </label>
                        <select
                            name="unit_id"
                            value={form.unit_id}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 text-gray-900 dark:text-gray-200"
                            required
                        >
                            <option value="">Pilih Satuan</option>
                            {units.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} ({u.multiplier} kg)
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Jumlah
                        </label>
                        <input
                            type="number"
                            name="qty"
                            min={1}
                            value={form.qty}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            required
                        />
                        {/* Preview konversi */}
                        {form.qty && form.unit_id && (
                            <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded p-2">
                                <span className="font-semibold">
                                    Hasil Konversi:
                                </span>{" "}
                                {preview.ton} ton, {preview.sak} sak,{" "}
                                {preview.kg} kg
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Deskripsi
                        </label>
                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            rows={2}
                            placeholder="Deskripsi produk (opsional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Min Stok
                        </label>
                        <input
                            type="number"
                            name="min_stock"
                            min={0}
                            value={form.min_stock}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            placeholder="Minimal stok untuk produk ini"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200">
                            Catatan (Opsional)
                        </label>
                        <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            className="w-full border px-3 py-2 rounded bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200"
                            rows={3}
                            placeholder="Catatan tambahan..."
                        />
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2 mt-4">
                        <Button
                            type="submit"
                            label={loading ? "Menyimpan..." : "Simpan"}
                            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded shadow"
                            disabled={loading}
                        />
                        <Button
                            type="link"
                            label="Batal"
                            className="bg-gray-300 dark:bg-gray-800 text-black dark:text-gray-200 px-6 py-2 rounded shadow"
                            href={route("stocks.index")}
                        />
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
