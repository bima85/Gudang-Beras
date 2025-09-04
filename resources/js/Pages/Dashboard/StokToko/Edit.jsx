import React from "react";
import { useForm, Link } from "@inertiajs/react";

export default function Edit({ stock, products, warehouses, units }) {
    const { data, setData, put, errors } = useForm({
        product_id: stock.product_id || "",
        warehouse_id: stock.warehouse_id || "",
        unit_id: stock.unit_id || "",
        qty: stock.qty || "",
    });
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Edit Stok Toko</h1>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    put(route("stok-toko.update", stock.id));
                }}
                className="space-y-4"
            >
                <div>
                    <label>Produk</label>
                    <select
                        value={data.product_id}
                        onChange={(e) => setData("product_id", e.target.value)}
                        className="w-full border rounded"
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
                    <label>Gudang/Toko</label>
                    <select
                        value={data.warehouse_id}
                        onChange={(e) =>
                            setData("warehouse_id", e.target.value)
                        }
                        className="w-full border rounded"
                    >
                        <option value="">Pilih Gudang/Toko</option>
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
                    <label>Satuan</label>
                    <select
                        value={data.unit_id}
                        onChange={(e) => setData("unit_id", e.target.value)}
                        className="w-full border rounded"
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
                    <label>Qty</label>
                    <input
                        type="number"
                        min="0"
                        value={data.qty}
                        onChange={(e) => setData("qty", e.target.value)}
                        className="w-full border rounded"
                    />
                    {errors.qty && (
                        <div className="text-red-500 text-sm">{errors.qty}</div>
                    )}
                </div>
                <div className="flex gap-2 mt-4">
                    <Link
                        href={route("stok-toko.index")}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Kembali
                    </Link>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Update
                    </button>
                </div>
            </form>
        </div>
    );
}
