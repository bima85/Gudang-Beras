import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import BackToDashboard from "@/Components/Dashboard/BackToDashboard";

export default function Show({ purchase }) {
    // Helper untuk fallback field
    const getField = (obj, ...fields) =>
        obj
            ? fields.reduce(
                  (val, key) =>
                      val !== undefined && val !== null ? val : obj[key],
                  undefined
              )
            : "";

    return (
        <>
            <Head title={`Detail Pembelian #${purchase.id}`} />
            <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                    Detail Pembelian
                </h2>
                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Kolom kiri */}
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Tanggal
                                </label>
                                <input
                                    type="text"
                                    value={
                                        purchase.purchase_date
                                            ? new Date(
                                                  purchase.purchase_date
                                              ).toLocaleDateString("id-ID")
                                            : "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    No. Invoice
                                </label>
                                <input
                                    type="text"
                                    value={purchase.invoice_number || "-"}
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Supplier
                                </label>
                                <input
                                    type="text"
                                    value={purchase.supplier?.name || "-"}
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    No. Telp Supplier
                                </label>
                                <input
                                    type="text"
                                    value={
                                        getField(purchase.supplier, "phone") ||
                                        "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Alamat Supplier
                                </label>
                                <input
                                    type="text"
                                    value={
                                        getField(
                                            purchase.supplier,
                                            "address"
                                        ) || "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                        </div>
                        {/* Kolom kanan */}
                        <div className="space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Toko
                                </label>
                                <input
                                    type="text"
                                    value={purchase.toko?.name || "-"}
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Nama Toko
                                </label>
                                <input
                                    type="text"
                                    value={purchase.toko?.name || "-"}
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Alamat Toko
                                </label>
                                <input
                                    type="text"
                                    value={
                                        getField(
                                            purchase.toko,
                                            "address",
                                            "alamat"
                                        ) || "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    No. Telp Toko
                                </label>
                                <input
                                    type="text"
                                    value={
                                        getField(
                                            purchase.toko,
                                            "phone",
                                            "telp"
                                        ) || "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Gudang
                                </label>
                                <input
                                    type="text"
                                    value={purchase.warehouse?.name || "-"}
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Nama Gudang
                                </label>
                                <input
                                    type="text"
                                    value={purchase.warehouse?.name || "-"}
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    Alamat Gudang
                                </label>
                                <input
                                    type="text"
                                    value={
                                        getField(
                                            purchase.warehouse,
                                            "address",
                                            "alamat"
                                        ) || "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    No. Telp Gudang
                                </label>
                                <input
                                    type="text"
                                    value={
                                        getField(
                                            purchase.warehouse,
                                            "phone",
                                            "telp"
                                        ) || "-"
                                    }
                                    className="w-full border rounded-md px-2 py-2 text-sm bg-gray-100"
                                    readOnly
                                />
                            </div>
                        </div>
                    </div>
                    {/* Tabel daftar item pembelian */}
                    <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold mb-2">
                            Daftar Item
                        </h3>
                        <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                                <tr>
                                    <th className="py-1 px-2 border-b">
                                        Produk
                                    </th>
                                    <th className="py-1 px-2 border-b">
                                        Kategori
                                    </th>
                                    <th className="py-1 px-2 border-b">
                                        Subkategori
                                    </th>
                                    <th className="py-1 px-2 border-b">Unit</th>
                                    <th className="py-1 px-2 border-b">Qty</th>
                                    <th className="py-1 px-2 border-b">
                                        Harga
                                    </th>
                                    <th className="py-1 px-2 border-b">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(purchase.items) &&
                                purchase.items.length > 0 ? (
                                    purchase.items.map((item, idx) => (
                                        <tr key={item.id || idx}>
                                            <td className="py-1 px-2">
                                                {item.product?.name ||
                                                    item.product_name ||
                                                    "-"}
                                            </td>
                                            <td className="py-1 px-2">
                                                {item.category?.name ||
                                                    item.category_name ||
                                                    "-"}
                                            </td>
                                            <td className="py-1 px-2">
                                                {item.subcategory?.name ||
                                                    item.subcategory_name ||
                                                    "-"}
                                            </td>
                                            <td className="py-1 px-2">
                                                {item.unit?.name ||
                                                    item.unit_name ||
                                                    "-"}
                                            </td>
                                            <td className="py-1 px-2">
                                                {item.qty}
                                            </td>
                                            <td className="py-1 px-2">
                                                Rp{" "}
                                                {Number(
                                                    item.harga_pembelian ??
                                                        item.price ??
                                                        0
                                                ).toLocaleString("id-ID")}
                                            </td>
                                            <td className="py-1 px-2">
                                                Rp{" "}
                                                {Number(
                                                    item.subtotal !==
                                                        undefined &&
                                                        item.subtotal !== null
                                                        ? item.subtotal
                                                        : Number(item.qty) *
                                                              Number(
                                                                  item.harga_pembelian ??
                                                                      item.price ??
                                                                      0
                                                              )
                                                ).toLocaleString("id-ID")}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-2 text-center text-gray-500 dark:text-gray-400"
                                        >
                                            Tidak ada item.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-6 space-y-2">
                        <BackToDashboard />
                        <Link
                            href={route("purchases.index")}
                            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                        >
                            Kembali ke Daftar Pembelian
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}

Show.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
