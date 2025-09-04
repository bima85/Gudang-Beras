import React, { useState } from "react";

export default function PurchaseItemsTable({
    items = [],
    products = [],
    units = [],
    categories = [],
    subcategories = [],
    onRemove,
    onKuliFeeCheckboxChange,
    onKuliFeeChange,
    timbanganGlobal = 0,
    setTimbanganGlobal = () => {},
}) {
    // State lokal untuk timbangan per item
    const [timbanganArr, setTimbanganArr] = React.useState(
        items.map((item) => item?.timbangan || 0)
    );

    // Hitung subtotal untuk setiap item
    const subtotals = items.map((item) => {
        if (!item) return 0;
        const harga = parseFloat(item.harga_pembelian) || 0;
        const qty = parseFloat(item.qty) || 0;
        let unitConversion = 1;
        if (item.unit_id && Array.isArray(units)) {
            const unitObj = units.find(
                (u) => String(u.id) === String(item.unit_id)
            );
            if (unitObj && unitObj.conversion_to_kg) {
                unitConversion = parseFloat(unitObj.conversion_to_kg) || 1;
            }
        }
        return qty * unitConversion * harga;
    });
    const totalSubtotals = subtotals.reduce((sum, val) => sum + val, 0);

    // Fee kuli aktif jika semua item valid dan punya kuli_fee > 0
    const kuliFeeActive =
        items.length > 0 &&
        items.every((item) => item && Number(item.kuli_fee) > 0);
    const kuliFee = kuliFeeActive ? Number(items[0]?.kuli_fee ?? 0) : 0;

    // Total akhir: subtotal - fee kuli jika aktif - timbangan
    const totalFinal =
        totalSubtotals - (kuliFeeActive ? kuliFee : 0) - timbanganGlobal;

    return (
        <div className="overflow-x-auto mt-4">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border px-2 py-1">#</th>
                        <th className="border px-2 py-1">Kategori</th>
                        <th className="border px-2 py-1">Subkategori</th>
                        <th className="border px-2 py-1">Produk</th>
                        <th className="border px-2 py-1">Qty</th>
                        <th className="border px-2 py-1">Unit</th>
                        <th className="border px-2 py-1">Gudang</th>
                        <th className="border px-2 py-1">Toko</th>
                        <th className="border px-2 py-1">Harga</th>
                        <th className="border px-2 py-1">Subtotal</th>
                        <th className="border px-2 py-1">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {items.filter(Boolean).map((item, idx) => {
                        const harga = parseFloat(item.harga_pembelian) || 0;
                        const qty = parseFloat(item.qty) || 0;
                        let unitConversion = 1;
                        if (item.unit_id && Array.isArray(units)) {
                            const unitObj = units.find(
                                (u) => String(u.id) === String(item.unit_id)
                            );
                            if (unitObj && unitObj.conversion_to_kg) {
                                unitConversion =
                                    parseFloat(unitObj.conversion_to_kg) || 1;
                            }
                        }
                        const subtotal = qty * unitConversion * harga;
                        return (
                            <tr key={idx}>
                                <td className="border px-2 py-1">{idx + 1}</td>
                                <td className="border px-2 py-1">
                                    {categories.find(
                                        (c) => c.id == item.category_id
                                    )?.name || "-"}
                                </td>
                                <td className="border px-2 py-1">
                                    {subcategories.find(
                                        (sc) => sc.id == item.subcategory_id
                                    )?.name || "-"}
                                </td>
                                <td className="border px-2 py-1">
                                    {products.find(
                                        (p) => p.id == item.product_id
                                    )?.name || "-"}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {item.qty}
                                </td>
                                <td className="border px-2 py-1">
                                    {units.find((u) => u.id == item.unit_id)
                                        ?.name || "-"}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {item.qty_gudang}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {item.qty_toko}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {item.harga_pembelian}
                                </td>
                                <td className="border px-2 py-1 text-right">
                                    {subtotal.toLocaleString("id-ID")}
                                </td>
                                <td className="border px-2 py-1">
                                    {/* Input timbangan di kolom aksi dihapus, biarkan hanya tombol hapus */}
                                    <button
                                        type="button"
                                        onClick={() => onRemove(idx)}
                                        className="text-xs text-red-600 hover:underline ml-2"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    <tr>
                        <td
                            className="border px-2 py-1 font-bold text-right bg-gray-50"
                            colSpan={8}
                        >
                            Fee Kuli (Optional)
                        </td>
                        <td className="border px-2 py-1 bg-gray-50" colSpan={3}>
                            <div>
                                <label className="block text-xs mb-1">
                                    <input
                                        type="checkbox"
                                        className="mr-1"
                                        checked={items
                                            .filter(Boolean)
                                            .every(
                                                (item) =>
                                                    Number(item.kuli_fee) > 0
                                            )}
                                        onChange={(e) => {
                                            if (
                                                typeof onKuliFeeCheckboxChange ===
                                                "function"
                                            ) {
                                                onKuliFeeCheckboxChange(
                                                    e.target.checked
                                                );
                                            }
                                        }}
                                    />
                                    Gunakan Fee Kuli
                                </label>
                                <input
                                    type="number"
                                    name="kuli_fee"
                                    min="0"
                                    value={
                                        items.length > 0
                                            ? Number(items[0]?.kuli_fee ?? 0)
                                            : 0
                                    }
                                    onChange={(e) => {
                                        if (
                                            typeof onKuliFeeChange ===
                                            "function"
                                        ) {
                                            onKuliFeeChange(
                                                Number(e.target.value) || 0
                                            );
                                        }
                                    }}
                                    className="w-full border rounded-md px-1 py-1 text-xs"
                                    disabled={
                                        !items
                                            .filter(Boolean)
                                            .every(
                                                (item) =>
                                                    Number(item.kuli_fee) > 0
                                            )
                                    }
                                />
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td
                            className="border px-2 py-1 font-bold text-right bg-gray-50"
                            colSpan={8}
                        >
                            Timbangan
                        </td>
                        <td className="border px-2 py-1 bg-gray-50" colSpan={3}>
                            <input
                                type="number"
                                name="timbangan"
                                min="0"
                                value={timbanganGlobal}
                                onChange={(e) =>
                                    setTimbanganGlobal(
                                        Number(e.target.value) || 0
                                    )
                                }
                                className="w-full border rounded-md px-1 py-1 text-xs"
                                placeholder="Masukkan berat (kg)"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td
                            className="border px-2 py-1 font-bold text-right"
                            colSpan={8}
                        >
                            Total
                        </td>
                        <td
                            className="border px-2 py-1 font-bold text-right"
                            colSpan={3}
                        >
                            {totalFinal.toLocaleString("id-ID")}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
}
