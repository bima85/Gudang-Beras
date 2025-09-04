import React from "react";
import { Link } from "@inertiajs/react";

export default function Show({ stock }) {
    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Detail Stok Toko</h1>
            <div className="space-y-2">
                <div>
                    <strong>Produk:</strong> {stock.product?.name}
                </div>
                <div>
                    <strong>Gudang/Toko:</strong> {stock.warehouse?.name}
                </div>
                <div>
                    <strong>Satuan:</strong> {stock.unit?.name}
                </div>
                <div>
                    <strong>Qty:</strong> {stock.qty}
                </div>
            </div>
            <div className="mt-4">
                <Link
                    href={route("stok-toko.index")}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Kembali
                </Link>
            </div>
        </div>
    );
}
