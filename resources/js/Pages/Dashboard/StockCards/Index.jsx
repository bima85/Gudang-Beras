import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";

export default function Index({ stockCards }) {
    // Pisahkan data berdasarkan asal: gudang atau toko
    const gudangCards = stockCards.data.filter(
        (card) => card.warehouse_id && !card.toko_id
    );
    const tokoCards = stockCards.data.filter(
        (card) => card.toko_id && !card.warehouse_id
    );

    return (
        <>
            <Head title="Kartu Stok" />
            <div className="p-4 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Kartu Stok</h1>
                    <Link
                        href={route("stock-cards.create")}
                        className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                        Tambah
                    </Link>
                </div>

                {/* Tabel Gudang */}
                <div className="mb-8 bg-white rounded shadow">
                    <div className="px-4 py-2 text-lg font-semibold bg-gray-100">
                        Gudang
                    </div>
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left">Tanggal</th>
                                <th className="px-4 py-2 text-left">Produk</th>
                                <th className="px-4 py-2 text-left">
                                    Kategori
                                </th>
                                <th className="px-4 py-2 text-left">
                                    Subkategori
                                </th>
                                <th className="px-4 py-2 text-left">Gudang</th>
                                <th className="px-4 py-2 text-left">Jenis</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2 text-right">Saldo</th>
                                <th className="px-4 py-2 text-left">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {gudangCards.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="py-4 text-center text-gray-400"
                                    >
                                        Tidak ada data gudang
                                    </td>
                                </tr>
                            ) : (
                                gudangCards.map((card) => (
                                    <tr key={card.id} className="border-t">
                                        <td className="px-4 py-2">
                                            {card.created_at
                                                ? new Date(
                                                      card.created_at
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.product?.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.category_name || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.product?.subcategory?.name ||
                                                "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.warehouse?.name || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.type}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {card.qty_original || card.qty}{" "}
                                            {card.unit?.name || ""}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span
                                                    className={
                                                        card.actual_saldo !==
                                                        undefined
                                                            ? "text-green-600 font-medium"
                                                            : ""
                                                    }
                                                >
                                                    {card.actual_saldo !==
                                                    undefined
                                                        ? card.actual_saldo
                                                        : card.saldo}
                                                </span>
                                                {card.actual_saldo !==
                                                    undefined &&
                                                    card.actual_saldo !==
                                                        card.saldo && (
                                                        <span
                                                            className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded"
                                                            title={`Saldo asli: ${card.saldo}`}
                                                        >
                                                            ✓
                                                        </span>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.note || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tabel Toko */}
                <div className="mb-8 bg-white rounded shadow">
                    <div className="px-4 py-2 text-lg font-semibold bg-gray-100">
                        Toko
                    </div>
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left">Tanggal</th>
                                <th className="px-4 py-2 text-left">Produk</th>
                                <th className="px-4 py-2 text-left">
                                    Kategori
                                </th>
                                <th className="px-4 py-2 text-left">
                                    Subkategori
                                </th>
                                <th className="px-4 py-2 text-left">Toko</th>
                                <th className="px-4 py-2 text-left">Jenis</th>
                                <th className="px-4 py-2 text-right">Qty</th>
                                <th className="px-4 py-2 text-right">Saldo</th>
                                <th className="px-4 py-2 text-left">Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tokoCards.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="py-4 text-center text-gray-400"
                                    >
                                        Tidak ada data toko
                                    </td>
                                </tr>
                            ) : (
                                tokoCards.map((card) => (
                                    <tr key={card.id} className="border-t">
                                        <td className="px-4 py-2">
                                            {card.created_at
                                                ? new Date(
                                                      card.created_at
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.product?.name}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.category_name || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.product?.subcategory?.name ||
                                                "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.toko?.name || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.type}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {card.qty_original || card.qty}{" "}
                                            {card.unit?.name || ""}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <span
                                                    className={
                                                        card.actual_saldo !==
                                                        undefined
                                                            ? "text-green-600 font-medium"
                                                            : ""
                                                    }
                                                >
                                                    {card.actual_saldo !==
                                                    undefined
                                                        ? card.actual_saldo
                                                        : card.saldo}
                                                </span>
                                                {card.actual_saldo !==
                                                    undefined &&
                                                    card.actual_saldo !==
                                                        card.saldo && (
                                                        <span
                                                            className="text-xs bg-green-100 text-green-800 px-1 py-0.5 rounded"
                                                            title={`Saldo asli: ${card.saldo}`}
                                                        >
                                                            ✓
                                                        </span>
                                                    )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-2">
                                            {card.note || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
