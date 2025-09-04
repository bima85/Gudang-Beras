// Backup sebelum perubahan besar pada komponen InitialStockModal
// File hasil backup dari resources/js/Components/Dashboard/InitialStockModal.jsx

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";

export default function InitialStockModal({
    productId,
    units = [],
    onClose,
    errors = {},
}) {
    const [unitId, setUnitId] = useState("");
    const [qty, setQty] = useState(1);
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(
            "/stocks/initial",
            { product_id: productId, unit_id: unitId, qty },
            {
                onSuccess: () => {
                    setProcessing(false);
                    onClose && onClose();
                },
                onError: () => setProcessing(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                    onClick={onClose}
                    type="button"
                >
                    ×
                </button>
                <h2 className="text-lg font-bold mb-4">
                    Input Stok Awal Produk
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Satuan
                        </label>
                        <select
                            className="w-full border rounded px-3 py-2"
                            value={unitId}
                            onChange={(e) => setUnitId(e.target.value)}
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
                            <div className="text-red-500 text-xs mt-1">
                                {errors.unit_id}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Jumlah Stok
                        </label>
                        <input
                            type="number"
                            className="w-full border rounded px-3 py-2"
                            min={1}
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                            required
                        />
                        {errors.qty && (
                            <div className="text-red-500 text-xs mt-1">
                                {errors.qty}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <Button
                            type="submit"
                            label="Simpan"
                            className="bg-sky-500 text-white px-4 py-2 rounded"
                            disabled={processing}
                        />
                        <Button
                            type="button"
                            label="Batal"
                            className="bg-gray-300 text-black px-4 py-2 rounded"
                            onClick={onClose}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
