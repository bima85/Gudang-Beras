import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function ProductQuickModal({
    show,
    onClose,
    initial = {},
    units = [],
    categories = [],
    subcategories = [],
    supplierId = null,
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
        supplier_id: null,
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
                supplier_id: supplierId || null,
            }));
        } else {
            // Jika tidak ada initial data, tetap set supplier_id dari props
            setData((d) => ({
                ...d,
                supplier_id: supplierId || null,
            }));
        }
    }, [initial, show, supplierId]);

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
                supplier_id: data.supplier_id || null,
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
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tambah Produk Cepat</DialogTitle>
                    <DialogDescription>
                        Tambahkan produk baru dengan informasi dasar.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="product-name">Nama Produk</Label>
                            <Input
                                id="product-name"
                                value={data.name}
                                onChange={(e) =>
                                    handleChange("name", e.target.value)
                                }
                                placeholder="Masukkan nama produk"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-barcode">
                                Kode/Barcode (opsional)
                            </Label>
                            <Input
                                id="product-barcode"
                                value={data.barcode}
                                onChange={(e) =>
                                    handleChange("barcode", e.target.value)
                                }
                                placeholder="Masukkan kode atau barcode"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Kategori</Label>
                                <div className="p-3 border rounded-md bg-muted text-sm">
                                    {categories.find(
                                        (c) => c.id === data.category_id
                                    )?.name || "-"}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Subkategori</Label>
                                <div className="p-3 border rounded-md bg-muted text-sm">
                                    {subcategories.find(
                                        (s) => s.id === data.subcategory_id
                                    )?.name || "-"}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Satuan</Label>
                            <Select
                                value={data.unit_id?.toString() || ""}
                                onValueChange={(value) =>
                                    handleChange("unit_id", value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih satuan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {units.map((unit) => (
                                        <SelectItem
                                            key={unit.id}
                                            value={unit.id.toString()}
                                        >
                                            {unit.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-min-stock">
                                Stok Minimal
                            </Label>
                            <Input
                                id="product-min-stock"
                                type="number"
                                min="0"
                                value={data.min_stock}
                                onChange={(e) =>
                                    handleChange("min_stock", e.target.value)
                                }
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product-description">
                                Deskripsi (opsional)
                            </Label>
                            <Input
                                id="product-description"
                                value={data.description}
                                onChange={(e) =>
                                    handleChange("description", e.target.value)
                                }
                                placeholder="Masukkan deskripsi produk"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
