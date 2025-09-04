import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Input from "@/Components/Dashboard/Input";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Button from "@/Components/Dashboard/Button";

export default function ProductQuickModal({
    show,
    onClose,
    initial = {},
    units = [],
    categories = [],
    subcategories = [],
    onCreated,
}) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({
        name: "",
        barcode: "",
        unit_id: "",
        min_stock: 0,
        description: "",
        category_id: null,
        subcategory_id: null,
    });

    useEffect(() => {
        if (initial) {
            setData((d) => ({
                ...d,
                category_id: initial.category_id || null,
                subcategory_id: initial.subcategory_id || null,
                unit_id:
                    initial.unit_id || (units && units[0] ? units[0].id : ""),
                name: initial.name || "",
                barcode: initial.barcode || "",
            }));
        }
    }, [initial, show]);

    if (!show) return null;

    const handleChange = (key, value) =>
        setData((d) => ({ ...d, [key]: value }));

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        // validate locally
        if (!data.name || !data.name.trim()) {
            Swal.fire({ icon: "warning", title: "Nama produk wajib diisi" });
            return;
        }
        if (!data.category_id) {
            Swal.fire({ icon: "warning", title: "Kategori wajib dipilih" });
            return;
        }
        if (!data.subcategory_id) {
            Swal.fire({ icon: "warning", title: "Subkategori wajib dipilih" });
            return;
        }
        if (!data.unit_id) {
            Swal.fire({ icon: "warning", title: "Satuan wajib dipilih" });
            return;
        }

        try {
            setLoading(true);
            const meta = document.querySelector('meta[name="csrf-token"]');
            let csrfToken = "";
            if (meta) csrfToken = meta.getAttribute("content");
            else if (window.Laravel && window.Laravel.csrfToken)
                csrfToken = window.Laravel.csrfToken;

            const payload = {
                name: data.name,
                code: data.barcode
                    ? data.barcode
                    : (data.name || "")
                          .replace(/\s+/g, "_")
                          .toUpperCase()
                          .slice(0, 20),
                barcode: data.barcode || `PRD_${Date.now()}`,
                description: data.description || data.name,
                category_id: data.category_id || null,
                subcategory_id: data.subcategory_id || null,
                unit_id: data.unit_id || null,
                min_stock: data.min_stock !== undefined ? data.min_stock : 0,
            };

            const url =
                typeof route === "function"
                    ? route("products.store")
                    : "/dashboard/products";
            const resp = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify(payload),
            });

            const ct = (resp.headers.get("content-type") || "").toLowerCase();
            let parsed = null;
            if (ct.includes("application/json")) {
                try {
                    parsed = await resp.json();
                } catch (e) {
                    parsed = null;
                }
            } else {
                const text = await resp.text();
                try {
                    parsed = JSON.parse(text);
                } catch (e) {
                    parsed = null;
                }
            }

            if (!resp.ok) {
                let msg = "Gagal membuat produk";
                if (parsed) {
                    if (parsed.errors) {
                        const parts = [];
                        Object.values(parsed.errors).forEach((v) => {
                            if (Array.isArray(v)) parts.push(...v);
                            else if (typeof v === "string") parts.push(v);
                        });
                        if (parts.length) msg += ": " + parts.join(" \n");
                        else
                            msg +=
                                ": " +
                                (parsed.message || JSON.stringify(parsed));
                    } else {
                        msg +=
                            ": " + (parsed.message || JSON.stringify(parsed));
                    }
                } else {
                    msg += ": server returned an error (non-JSON)";
                }
                throw new Error(msg);
            }

            const newProd = parsed;
            if (!newProd)
                throw new Error(
                    "Server returned invalid/non-JSON response for new product"
                );

            Swal.fire({
                title: "Berhasil",
                text: "Produk ditambahkan",
                icon: "success",
                timer: 1200,
                showConfirmButton: false,
            });
            onCreated && onCreated(newProd);
            onClose && onClose();
        } catch (err) {
            console.error("ProductQuickModal submit error", err);
            Swal.fire({
                title: "Gagal",
                text: err.message || "Gagal membuat produk",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="w-full max-w-xl p-6 bg-white rounded shadow">
                <h3 className="mb-4 text-lg font-semibold">
                    Tambah Produk Cepat
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-3">
                        <Input
                            label="Nama Produk"
                            value={data.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                        />
                        <Input
                            label="Kode/Barcode (opsional)"
                            value={data.barcode}
                            onChange={(e) =>
                                handleChange("barcode", e.target.value)
                            }
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Kategori
                                </label>
                                <div className="p-2 border rounded bg-gray-50">
                                    {categories.find(
                                        (c) => c.id === data.category_id
                                    )?.name || "-"}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">
                                    Subkategori
                                </label>
                                <div className="p-2 border rounded bg-gray-50">
                                    {subcategories.find(
                                        (s) => s.id === data.subcategory_id
                                    )?.name || "-"}
                                </div>
                            </div>
                        </div>
                        <InputSelect
                            label="Satuan"
                            data={units}
                            selected={
                                units.find((u) => u.id === data.unit_id) || null
                            }
                            setSelected={(u) =>
                                handleChange("unit_id", u ? u.id : null)
                            }
                            displayKey="name"
                        />
                        <Input
                            label="Stok Minimal"
                            type="number"
                            value={data.min_stock}
                            onChange={(e) =>
                                handleChange("min_stock", e.target.value)
                            }
                        />
                        <Input
                            label="Deskripsi (opsional)"
                            value={data.description}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button
                            type="button"
                            label="Batal"
                            className="border bg-gray-200"
                            onClick={onClose}
                        />
                        <Button
                            type="submit"
                            label={loading ? "Menyimpan..." : "Simpan"}
                            processing={loading}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
