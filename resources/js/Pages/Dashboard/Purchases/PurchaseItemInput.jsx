import React from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function PurchaseItemInput({
    item,
    categories,
    subcategories,
    products,
    units,
    onChange,
    onAdd,
    onAddCategory, // optional callback from parent to add a new category
    onAddSubcategory, // optional callback to add subcategory
    onAddProduct, // optional callback to add product
}) {
    // Hitung alokasi otomatis ketika qty berubah
    React.useEffect(() => {
        if (item.qty && !item.qty_gudang && !item.qty_toko) {
            const totalQty = parseFloat(item.qty) || 0;
            if (totalQty > 0) {
                // Default: 50% gudang, 50% toko (pembagian rata)
                const qtyGudang = Math.round(totalQty * 0.5 * 100) / 100;
                const qtyToko = Math.round(totalQty * 0.5 * 100) / 100;

                // Update alokasi
                onChange({ target: { name: "qty_gudang", value: qtyGudang } });
                onChange({ target: { name: "qty_toko", value: qtyToko } });
            }
        }
    }, [item.qty]);

    return (
        <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm">
            <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-6">
                {/* Kategori */}
                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Kategori
                    </label>
                    <Select
                        value={item.category_id?.toString() || ""}
                        onValueChange={(value) =>
                            onChange({
                                target: { name: "category_id", value },
                            })
                        }
                    >
                        <SelectTrigger className="text-base bg-white">
                            <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </SelectItem>
                            ))}

                            {/* Footer: button to add new category if not present */}
                            <div className="px-3 py-2 mt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            if (
                                                typeof onAddCategory ===
                                                "function"
                                            ) {
                                                onAddCategory();
                                            } else {
                                                const name =
                                                    window.prompt(
                                                        "Nama kategori baru"
                                                    );
                                                if (name && name.trim()) {
                                                    // Emit a custom event so parent can listen and handle
                                                    window.dispatchEvent(
                                                        new CustomEvent(
                                                            "purchase:add-category",
                                                            {
                                                                detail: {
                                                                    name: name.trim(),
                                                                },
                                                            }
                                                        )
                                                    );
                                                }
                                            }
                                        } catch (e) {
                                            console.error(
                                                "Add category action failed",
                                                e
                                            );
                                        }
                                    }}
                                    className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                                >
                                    + Tambah Kategori
                                </button>
                            </div>
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Subkategori
                    </label>
                    <Select
                        value={item.subcategory_id?.toString() || ""}
                        onValueChange={(value) =>
                            onChange({
                                target: { name: "subcategory_id", value },
                            })
                        }
                    >
                        <SelectTrigger className="text-base bg-white">
                            <SelectValue placeholder="Pilih Subkategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {subcategories
                                .filter(
                                    (sc) => sc.category_id == item.category_id
                                )
                                .map((sc) => (
                                    <SelectItem
                                        key={sc.id}
                                        value={sc.id.toString()}
                                    >
                                        {sc.name}
                                    </SelectItem>
                                ))}

                            <div className="px-3 py-2 mt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            if (
                                                typeof onAddSubcategory ===
                                                "function"
                                            ) {
                                                onAddSubcategory(
                                                    null,
                                                    item.category_id
                                                );
                                            } else {
                                                const name = window.prompt(
                                                    "Nama subkategori baru"
                                                );
                                                if (name && name.trim()) {
                                                    window.dispatchEvent(
                                                        new CustomEvent(
                                                            "purchase:add-subcategory",
                                                            {
                                                                detail: {
                                                                    name: name.trim(),
                                                                    category_id:
                                                                        item.category_id ||
                                                                        null,
                                                                },
                                                            }
                                                        )
                                                    );
                                                }
                                            }
                                        } catch (e) {
                                            console.error(
                                                "Add subcategory action failed",
                                                e
                                            );
                                        }
                                    }}
                                    className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                                >
                                    + Tambah Subkategori
                                </button>
                            </div>
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Produk
                    </label>
                    <Select
                        value={item.product_id?.toString() || ""}
                        onValueChange={(value) =>
                            onChange({
                                target: { name: "product_id", value },
                            })
                        }
                    >
                        <SelectTrigger className="text-base bg-white">
                            <SelectValue placeholder="Pilih Produk" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map((p) => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.name}
                                </SelectItem>
                            ))}

                            <div className="px-3 py-2 mt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            const context = {
                                                category_id:
                                                    item.category_id || null,
                                                subcategory_id:
                                                    item.subcategory_id || null,
                                                unit_id: item.unit_id || null,
                                            };
                                            if (
                                                typeof onAddProduct ===
                                                "function"
                                            ) {
                                                onAddProduct(context);
                                            } else {
                                                const name =
                                                    window.prompt(
                                                        "Nama produk baru"
                                                    );
                                                if (name && name.trim()) {
                                                    window.dispatchEvent(
                                                        new CustomEvent(
                                                            "purchase:add-product",
                                                            {
                                                                detail: {
                                                                    name: name.trim(),
                                                                    ...context,
                                                                },
                                                            }
                                                        )
                                                    );
                                                }
                                            }
                                        } catch (e) {
                                            console.error(
                                                "Add product action failed",
                                                e
                                            );
                                        }
                                    }}
                                    className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                                >
                                    + Tambah Produk
                                </button>
                            </div>
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Unit
                    </label>
                    <Select
                        value={item.unit_id?.toString() || ""}
                        onValueChange={(value) =>
                            onChange({
                                target: { name: "unit_id", value },
                            })
                        }
                    >
                        <SelectTrigger className="text-base bg-white">
                            <SelectValue placeholder="Pilih Unit" />
                        </SelectTrigger>
                        <SelectContent>
                            {units.map((u) => (
                                <SelectItem key={u.id} value={u.id.toString()}>
                                    {u.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Qty
                    </label>
                    <Input
                        type="number"
                        name="qty"
                        min="1"
                        value={item.qty}
                        onChange={onChange}
                        className="text-base"
                        placeholder="0"
                    />
                </div>

                {/* Row 2: qty toko, qty gudang, harga, add button */}
                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Qty Toko{" "}
                        <span className="text-xs text-gray-500">(50%)</span>
                    </label>
                    <Input
                        type="number"
                        name="qty_toko"
                        min="0"
                        step="0.01"
                        value={item.qty_toko || ""}
                        onChange={onChange}
                        className="text-base"
                        placeholder="0"
                    />
                </div>

                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Qty Gudang{" "}
                        <span className="text-xs text-gray-500">(50%)</span>
                    </label>
                    <Input
                        type="number"
                        name="qty_gudang"
                        min="0"
                        step="0.01"
                        value={item.qty_gudang || ""}
                        onChange={onChange}
                        className="text-base"
                        placeholder="0"
                    />
                </div>

                {/* Indikator Total Alokasi */}
                {(item.qty_gudang || item.qty_toko) && (
                    <div className="md:col-span-6">
                        <div className="p-2 text-xs text-gray-600 rounded bg-gray-50">
                            <span className="font-medium">Total Alokasi: </span>
                            <span className="text-blue-600">
                                {(
                                    (parseFloat(item.qty_gudang) || 0) +
                                    (parseFloat(item.qty_toko) || 0)
                                ).toFixed(2)}
                            </span>
                            {item.qty && (
                                <span
                                    className={`ml-2 ${
                                        Math.abs(
                                            (parseFloat(item.qty_gudang) || 0) +
                                                (parseFloat(item.qty_toko) ||
                                                    0) -
                                                parseFloat(item.qty)
                                        ) < 0.01
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }`}
                                >
                                    {Math.abs(
                                        (parseFloat(item.qty_gudang) || 0) +
                                            (parseFloat(item.qty_toko) || 0) -
                                            parseFloat(item.qty)
                                    ) < 0.01
                                        ? "✓ Sesuai"
                                        : `⚠ Selisih ${(
                                              parseFloat(item.qty) -
                                              (parseFloat(item.qty_gudang) ||
                                                  0) -
                                              (parseFloat(item.qty_toko) || 0)
                                          ).toFixed(2)}`}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                <div className="md:col-span-2">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Harga Beli
                    </label>
                    <Input
                        type="number"
                        name="harga_pembelian"
                        min="0"
                        value={item.harga_pembelian}
                        onChange={onChange}
                        className="text-base"
                        placeholder="0"
                    />
                </div>

                <div className="flex items-center justify-center md:col-span-1">
                    <Button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 text-base"
                    >
                        + Item
                    </Button>
                </div>
            </div>
        </div>
    );
}
