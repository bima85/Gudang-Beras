import React, { useState } from "react";
import axios from "axios";
import { Link, router, usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";

function Index({
    stocks,
    products = [],
    tokos = [],
    filterProduct = null,
    filterToko = null,
}) {
    const [selectedProduct, setSelectedProduct] = useState(filterProduct || "");
    const [selectedToko, setSelectedToko] = useState(filterToko || "");
    const [customers, setCustomers] = useState([]);

    // Fetch customers saat mount dan setelah tambah customer
    React.useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const res = await axios.get(route("customers.index"));
            setCustomers(res.data.customers.data || []);
        } catch (e) {
            // handle error
        }
    };

    // Handler setelah modal tambah customer sukses
    const handleCustomerAdded = () => {
        fetchCustomers().then(() => {
            // Pilih customer terakhir (baru) jika ada
            if (customers.length > 0) {
                const lastCustomer = customers[customers.length - 1];
                setSelectedCustomer(lastCustomer.id);
            }
        });
    };

    const handleFilter = () => {
        router.get(
            route("stok-toko.index"),
            {
                ...(selectedProduct ? { product_id: selectedProduct } : {}),
                ...(selectedToko ? { toko_id: selectedToko } : {}),
            },
            { preserveState: true, replace: true }
        );
    };
    const handleReset = () => {
        setSelectedProduct("");
        setSelectedToko("");
        router.get(route("stok-toko.index"));
    };

    // Hapus polling otomatis stok toko
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         router.get(
    //             route("stok-toko.index"),
    //             {
    //                 ...(selectedProduct ? { product_id: selectedProduct } : {}),
    //                 ...(selectedToko ? { toko_id: selectedToko } : {}),
    //             },
    //             { preserveState: false, replace: false, only: ["stocks"] }
    //         );
    //     }, 5000);

    //     return () => clearInterval(interval);
    // }, [selectedProduct, selectedToko]);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                        Daftar Stok Toko
                    </h1>
                    <Link
                        href={route("stok-toko.create")}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow text-sm font-semibold"
                    >
                        + Tambah Stok Toko
                    </Link>
                </div>
                {/* Filter Section */}
                {/* ...existing code for filter... */}
                <div className="overflow-x-auto">
                    <table className="min-w-[1000px] w-full text-sm text-left text-gray-700 dark:text-gray-300">
                        <thead className="bg-gray-200 dark:bg-gray-700 sticky top-0 z-10">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    No
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Tanggal
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Barcode
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Kategori
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Produk
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Deskripsi
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Min Stok
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Toko
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Unit
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Qty
                                </th>
                                <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {stocks.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="text-center py-6 text-gray-500 dark:text-gray-400"
                                    >
                                        Data stok toko belum ada.
                                    </td>
                                </tr>
                            ) : (
                                stocks.map((stock, i) => (
                                    <tr
                                        key={`${stock.product_id}-${stock.toko_id}-${i}`}
                                        className="bg-white dark:bg-gray-800 border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <td className="px-4 py-2 text-center">
                                            {i + 1}
                                        </td>
                                        <td className="px-4 py-2">
                                            {stock.last_update
                                                ? new Date(
                                                      stock.last_update
                                                  ).toLocaleDateString()
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {stock.product?.barcode || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {stock.product?.category?.name ||
                                                "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {stock.product?.name || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {stock.product?.description || "-"}
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            {stock.product?.min_stock
                                                ? Number(
                                                      stock.product.min_stock
                                                  ).toLocaleString("id-ID")
                                                : "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                            {stock.toko?.name || "-"}
                                        </td>
                                        <td className="px-4 py-2">kg</td>
                                        <td className="px-4 py-2 text-right">
                                            {stock.total_kg
                                                ? Number(
                                                      stock.total_kg
                                                  ).toLocaleString("id-ID")
                                                : 0}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <Link
                                                href={route(
                                                    "stok-toko.edit",
                                                    stock.id
                                                )}
                                                className="text-blue-600 mr-2"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                href={route(
                                                    "stok-toko.destroy",
                                                    stock.id
                                                )}
                                                method="delete"
                                                as="button"
                                                className="text-red-600"
                                            >
                                                Delete
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Index;
