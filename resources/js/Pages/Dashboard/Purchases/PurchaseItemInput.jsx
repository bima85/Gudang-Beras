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
    onAddUnit, // optional callback to add unit
}) {
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

                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Produk
                    </label>
                    <Select
                        value={item.product_id?.toString() || ""}
                        onValueChange={(value) =>
                            onChange({ target: { name: "product_id", value } })
                        }
                    >
                        <SelectTrigger className="text-base bg-white">
                            <SelectValue placeholder="Pilih Produk" />
                        </SelectTrigger>
                        <SelectContent>
                            {/** DEBUG: temporary logs to diagnose missing products **/}
                            {typeof window !== "undefined" &&
                                (() => {
                                    try {
                                        console.debug("Product select debug:", {
                                            productsCount:
                                                products?.length || 0,
                                            category_id: item?.category_id,
                                            subcategory_id:
                                                item?.subcategory_id,
                                            sampleProductKeys:
                                                products && products[0]
                                                    ? Object.keys(
                                                          products[0]
                                                      ).slice(0, 6)
                                                    : [],
                                        });
                                    } catch (e) {}
                                    return null;
                                })()}
                            {products
                                .filter((p) => {
                                    if (item.subcategory_id) {
                                        return (
                                            String(p.subcategory_id) ===
                                            String(item.subcategory_id)
                                        );
                                    }
                                    if (item.category_id) {
                                        return (
                                            String(p.category_id) ===
                                            String(item.category_id)
                                        );
                                    }
                                    return true;
                                })
                                .map((p) => (
                                    <SelectItem
                                        key={p.id}
                                        value={p.id.toString()}
                                    >
                                        {p.name}
                                    </SelectItem>
                                ))}

                            <div className="px-3 py-2 mt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        try {
                                            if (
                                                typeof onAddProduct ===
                                                "function"
                                            ) {
                                                onAddProduct({
                                                    name: null,
                                                    category_id:
                                                        item.category_id ||
                                                        null,
                                                    subcategory_id:
                                                        item.subcategory_id ||
                                                        null,
                                                });
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
                                                                    category_id:
                                                                        item.category_id ||
                                                                        null,
                                                                    subcategory_id:
                                                                        item.subcategory_id ||
                                                                        null,
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
                            onChange({ target: { name: "unit_id", value } })
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
                            <div className="px-3 py-2 mt-2 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.debug(
                                            "Tambah Unit button clicked"
                                        );
                                        try {
                                            if (
                                                typeof onAddUnit === "function"
                                            ) {
                                                console.debug(
                                                    "Calling onAddUnit function"
                                                );
                                                onAddUnit();
                                            } else {
                                                console.debug(
                                                    "onAddUnit not provided, using prompt fallback"
                                                );
                                                const name =
                                                    window.prompt(
                                                        "Nama unit baru"
                                                    );
                                                if (name && name.trim()) {
                                                    window.dispatchEvent(
                                                        new CustomEvent(
                                                            "purchase:add-unit",
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
                                                "Add unit action failed",
                                                e
                                            );
                                        }
                                    }}
                                    className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                                >
                                    + Tambah Unit
                                </button>
                            </div>
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

                {/* Fee Kuli UI removed from per-item input (moved/handled in table footer) */}

                {/* Row 2: qty toko, qty gudang, harga, add button */}
                <div className="md:col-span-1">
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                        Qty Toko
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
                        Qty Gudang
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
