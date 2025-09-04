import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function Index({ purchases }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (
            window.confirm("Apakah Anda yakin ingin menghapus pembelian ini?")
        ) {
            destroy(route("purchases.destroy", id), {
                onSuccess: () => toast.success("Pembelian berhasil dihapus!"),
                onError: () => toast.error("Terjadi kesalahan saat menghapus."),
            });
        }
    };

    const getProductNames = (items) => {
        if (!Array.isArray(items)) return "";
        return items
            .map((item) => item.product?.name || "Produk Tidak Tersedia") // Penanganan null/undefined
            .filter((name, index, self) => self.indexOf(name) === index)
            .join(", ");
    };

    const getCategories = (items) => {
        return items
            .map((item) => item.category?.name || "Tanpa Kategori")
            .filter((name, index, self) => self.indexOf(name) === index)
            .join(", ");
    };

    return (
        <>
            <Head title="Daftar Pembelian" />
            <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Daftar Pembelian
                    </h2>
                    <Link
                        href={route("purchases.create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        + Tambah Pembelian
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                            <tr>
                                <th className="py-3 px-4 border-b">No</th>
                                <th className="py-3 px-4 border-b">Tanggal</th>
                                <th className="py-3 px-4 border-b">Supplier</th>
                                <th className="py-3 px-4 border-b">Gudang</th>
                                <th className="py-3 px-4 border-b">
                                    Nama Produk
                                </th>
                                <th className="py-3 px-4 border-b">Kategori</th>
                                <th className="py-3 px-4 border-b">Total</th>
                                <th className="py-3 px-4 border-b">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchases.length > 0 ? (
                                purchases.map((purchase, index) => (
                                    <tr
                                        key={purchase.id}
                                        className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-4">
                                            {new Date(
                                                purchase.purchase_date
                                            ).toLocaleDateString("id-ID")}
                                        </td>
                                        <td className="py-3 px-4">
                                            {purchase.supplier.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            {purchase.warehouse.name}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getProductNames(purchase.items)}
                                        </td>
                                        <td className="py-3 px-4">
                                            {getCategories(purchase.items)}
                                        </td>
                                        <td className="py-3 px-4">
                                            Rp{" "}
                                            {purchase.total.toLocaleString(
                                                "id-ID"
                                            )}
                                        </td>
                                        <td className="py-3 px-4 flex space-x-2">
                                            <Link
                                                href={route(
                                                    "purchases.show",
                                                    purchase.id
                                                )}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Lihat
                                            </Link>
                                            <Link
                                                href={route(
                                                    "purchases.edit",
                                                    purchase.id
                                                )}
                                                className="text-yellow-600 hover:text-yellow-800"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(purchase.id)
                                                }
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-4 text-center text-gray-500 dark:text-gray-400"
                                    >
                                        Tidak ada data pembelian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {purchases.length > 0 && (
                    <div className="mt-4 flex justify-end">
                        <button
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 disabled:bg-gray-200"
                            disabled
                        >
                            Halaman Selanjutnya
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
