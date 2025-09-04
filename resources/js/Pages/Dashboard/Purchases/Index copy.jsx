// File: resources/js/Pages/Dashboard/Purchases/Index.jsx

import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import Button from "@/Components/Button";

export default function Index() {
    const { purchases } = usePage().props;
    console.log(purchases);

    return (
        <div className="p-4">
            <Head title="Daftar Pembelian" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    Daftar Pembelian
                </h1>
                <Link href={route("purchases.create")}>
                    <Button className="bg-green-600 hover:bg-green-700 text-white font-bold text-base px-4 py-2 rounded shadow">
                        <span className="text-xl mr-2">+</span>Tambah Pembelian
                    </Button>
                </Link>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                No
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                Tanggal
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                No PO
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                Supplier
                            </th>

                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                Satuan
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                Total Harga
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-200">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {purchases.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                                >
                                    Tidak ada data pembelian.
                                </td>
                            </tr>
                        )}
                        {purchases.map((purchase, idx) => {
                            const total =
                                purchase.total ??
                                purchase.items?.reduce(
                                    (sum, item) => sum + item.qty * item.price,
                                    0
                                );
                            // Ambil kategori dari setiap item
                            const kategoriList = purchase.items
                                ?.map((d) => d.product?.category?.name || "-")
                                .join(", ");
                            // Tampilkan label satuan sesuai unit_type yang dipilih user
                            const satuanList = purchase.items
                                ?.map((d) => d.unit?.name || "-")
                                .join(", ");
                            return (
                                <tr
                                    key={purchase.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {idx + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {purchase.purchase_date
                                            ? new Date(
                                                  purchase.purchase_date
                                              ).toLocaleDateString("id-ID")
                                            : "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {purchase.no_po}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {purchase.supplier?.name || "-"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {satuanList}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        {kategoriList}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">
                                        Rp {total.toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-1 py-3 text-sm flex gap-2">
                                        <Link
                                            href={route(
                                                "purchases.edit",
                                                purchase.id
                                            )}
                                        >
                                            <span className="inline-block">
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm ">
                                                    Edit
                                                </Button>
                                            </span>
                                        </Link>
                                        <Link
                                            href={route(
                                                "purchases.show",
                                                purchase.id
                                            )}
                                        >
                                            <span className="inline-block">
                                                <Button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm">
                                                    Detail
                                                </Button>
                                            </span>
                                        </Link>
                                        <form
                                            method="POST"
                                            action={route(
                                                "purchases.destroy",
                                                purchase.id
                                            )}
                                            onSubmit={(e) => {
                                                if (
                                                    !confirm(
                                                        "Yakin ingin menghapus data ini?"
                                                    )
                                                )
                                                    e.preventDefault();
                                            }}
                                            style={{ display: "inline" }}
                                        >
                                            <input
                                                type="hidden"
                                                name="_method"
                                                value="delete"
                                            />
                                            <input
                                                type="hidden"
                                                name="_token"
                                                value={
                                                    window?.Laravel
                                                        ?.csrfToken ||
                                                    document.querySelector(
                                                        'meta[name="csrf-token"]'
                                                    ).content
                                                }
                                            />
                                            <Button
                                                type="submit"
                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Hapus
                                            </Button>
                                        </form>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
