import React, { useState, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function Index({ purchases = [] }) {
    const { delete: destroy } = useForm();
    const [groupBy, setGroupBy] = useState("category");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterSupplier, setFilterSupplier] = useState("");
    const [filterWarehouse, setFilterWarehouse] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Handle delete action
    const handleDelete = (id) => {
        if (
            window.confirm("Apakah Anda yakin ingin menghapus pembelian ini?")
        ) {
            destroy(route("purchases.destroy", id), {
                onSuccess: () => toast.success("Pembelian berhasil dihapus!"),
                onError: (errors) => {
                    console.error("Error deleting purchase:", errors);
                    toast.error("Terjadi kesalahan saat menghapus.");
                },
            });
        }
    };

    // Get unique product names from items
    const getProductNames = (items) => {
        if (!Array.isArray(items)) {
            console.warn("Items is not an array:", items);
            return "-";
        }
        return (
            items
                .map((item) => item.product?.name || item.product_name || "-")
                .filter(
                    (name, index, self) => name && self.indexOf(name) === index
                )
                .join(", ") || "-"
        );
    };

    // Get unique categories from items
    const getCategories = (items) => {
        if (!Array.isArray(items)) {
            console.warn("Items is not an array:", items);
            return "-";
        }
        return (
            items
                .map((item) => item.category?.name || item.category_name || "-")
                .filter(
                    (name, index, self) => name && self.indexOf(name) === index
                )
                .join(", ") || "-"
        );
    };

    // Group purchases based on selected criteria
    const groupPurchases = () => {
        const filteredPurchases = useMemo(() => {
            if (!Array.isArray(purchases)) {
                console.error("Purchases is not an array:", purchases);
                return [];
            }
            return purchases.filter((purchase) => {
                if (!purchase || typeof purchase !== "object") {
                    console.warn("Invalid purchase data:", purchase);
                    return false;
                }
                const purchaseDate = purchase.purchase_date
                    ? new Date(purchase.purchase_date).toLocaleDateString(
                          "id-ID"
                      )
                    : "-";
                const matchesSearch =
                    searchTerm === "" ||
                    (purchase.supplier?.name?.toLowerCase() || "").includes(
                        searchTerm.toLowerCase()
                    ) ||
                    (purchase.warehouse?.name?.toLowerCase() || "").includes(
                        searchTerm.toLowerCase()
                    ) ||
                    getProductNames(purchase.items || [])
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    getCategories(purchase.items || [])
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    purchaseDate
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase());

                const matchesSupplier =
                    filterSupplier === "" ||
                    (purchase.supplier?.name || "Tanpa Supplier") ===
                        filterSupplier;
                const matchesWarehouse =
                    filterWarehouse === "" ||
                    (purchase.warehouse?.name || "Tanpa Gudang") ===
                        filterWarehouse;
                const matchesCategory =
                    filterCategory === "" ||
                    getCategories(purchase.items || []).includes(
                        filterCategory
                    );
                const matchesDate =
                    filterDate === "" ||
                    purchaseDate ===
                        (filterDate
                            ? new Date(filterDate).toLocaleDateString("id-ID")
                            : "-");

                return (
                    matchesSearch &&
                    matchesSupplier &&
                    matchesWarehouse &&
                    matchesCategory &&
                    matchesDate
                );
            });
        }, [
            purchases,
            searchTerm,
            filterSupplier,
            filterWarehouse,
            filterCategory,
            filterDate,
        ]);

        const grouped = filteredPurchases.reduce((acc, purchase) => {
            let key;
            if (groupBy === "purchase_date") {
                key = purchase.purchase_date
                    ? new Date(purchase.purchase_date).toLocaleDateString(
                          "id-ID",
                          {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                          }
                      )
                    : "Tanggal Tidak Valid";
            } else if (groupBy === "supplier") {
                key = purchase.supplier?.name || "Tanpa Supplier";
            } else if (groupBy === "warehouse") {
                key = purchase.warehouse?.name || "Tanpa Gudang";
            } else if (groupBy === "category") {
                const categories = Array.isArray(purchase.items)
                    ? purchase.items
                          .map((item) => item.category?.name)
                          .filter(
                              (name, idx, arr) =>
                                  name && arr.indexOf(name) === idx
                          )
                    : [];
                key =
                    categories.length > 0
                        ? categories.join(", ")
                        : "Tanpa Kategori";
            }

            if (!acc[key]) acc[key] = [];
            acc[key].push(purchase);
            return acc;
        }, {});

        return Object.keys(grouped)
            .sort((a, b) => {
                if (groupBy === "purchase_date")
                    return new Date(a) - new Date(b);
                return a.localeCompare(b);
            })
            .map((key) => ({
                key,
                purchases: grouped[key],
            }));
    };

    const groupedPurchases = groupPurchases();

    // Get unique values for filters
    const uniqueSuppliers = [
        ...new Set(
            purchases.map(
                (p) => p.supplier?.name || p.supplier_name || "Tanpa Supplier"
            )
        ),
    ].sort();
    const uniqueWarehouses = [
        ...new Set(
            purchases.map(
                (p) => p.warehouse?.name || p.warehouse_name || "Tanpa Gudang"
            )
        ),
    ].sort();
    const uniqueCategories = [
        ...new Set(
            purchases
                .flatMap(
                    (p) =>
                        p.items?.map(
                            (i) => i.category?.name || i.category_name
                        ) || []
                )
                .filter(Boolean)
        ),
    ].sort();

    // Hitung total pembelian seluruh data (untuk summary bawah)
    const totalSemuaPembelian = groupedPurchases.reduce((acc, group) => {
        return (
            acc +
            group.purchases.reduce(
                (sum, p) => sum + (Number(p.total_pembelian) || 0),
                0
            )
        );
    }, 0);

    return (
        <>
            <Head title="Daftar Pembelian" />
            <div className="p-2 sm:p-4 lg:p-8 w-full max-w-6xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                    Daftar Pembelian
                </h2>
                {/* Form filter dan pencarian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2 sm:gap-4 mb-6 w-full">
                    <div className="w-full">
                        <input
                            type="text"
                            placeholder="Cari (Supplier, Produk, dll.)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                    </div>
                    <div className="w-full">
                        <select
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        >
                            <option value="">Semua Supplier</option>
                            {uniqueSuppliers.map((supplier, index) => (
                                <option key={index} value={supplier}>
                                    {supplier}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full">
                        <select
                            value={filterWarehouse}
                            onChange={(e) => setFilterWarehouse(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        >
                            <option value="">Semua Gudang</option>
                            {uniqueWarehouses.map((warehouse, index) => (
                                <option key={index} value={warehouse}>
                                    {warehouse}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full">
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        >
                            <option value="">Semua Kategori</option>
                            {uniqueCategories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        />
                    </div>
                    <div className="w-full">
                        <select
                            value={groupBy}
                            onChange={(e) => setGroupBy(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm"
                        >
                            <option value="category">Kategori</option>
                            <option value="purchase_date">Tanggal</option>
                            <option value="supplier">Supplier</option>
                            <option value="warehouse">Gudang</option>
                        </select>
                    </div>
                    <div className="w-full">
                        <Link
                            href={route("dashboard.purchases.create")}
                            className="w-full bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm font-medium h-10"
                        >
                            <i className="fas fa-plus mr-2"></i> Tambah
                            Pembelian
                        </Link>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-sky-100 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    No
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Tanggal
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Supplier
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Gudang
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Kategori
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Subkategori
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Produk
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Harga
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Qty
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-900 dark:text-gray-100 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {groupedPurchases.length > 0 ? (
                                groupedPurchases.map((group, groupIndex) => {
                                    // Hitung subtotal per grup
                                    const subtotal = group.purchases.reduce(
                                        (sum, p) =>
                                            sum +
                                            (Number(p.total_pembelian) || 0),
                                        0
                                    );
                                    return (
                                        <React.Fragment key={group.key}>
                                            {/* Baris judul grup */}
                                            <tr className="bg-gray-100 dark:bg-gray-700 font-semibold">
                                                <td
                                                    colSpan="11"
                                                    className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                                                >
                                                    {groupBy ===
                                                        "purchase_date" &&
                                                        `Tanggal: ${group.key}`}
                                                    {groupBy === "supplier" &&
                                                        `Supplier: ${group.key}`}
                                                    {groupBy === "warehouse" &&
                                                        `Gudang: ${group.key}`}
                                                    {groupBy === "category" &&
                                                        `Kategori: ${group.key}`}
                                                </td>
                                            </tr>
                                            {/* Baris data pembelian per grup */}
                                            {group.purchases.map(
                                                (purchase, index) => (
                                                    <React.Fragment
                                                        key={purchase.id}
                                                    >
                                                        {/* Baris utama pembelian */}
                                                        <tr className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {groupIndex + 1}
                                                                .{index + 1}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {purchase.purchase_date
                                                                    ? new Date(
                                                                          purchase.purchase_date
                                                                      ).toLocaleDateString(
                                                                          "id-ID"
                                                                      )
                                                                    : "-"}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {purchase
                                                                    .supplier
                                                                    ?.name ||
                                                                    purchase.supplier_name ||
                                                                    "-"}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {purchase
                                                                    .warehouse
                                                                    ?.name ||
                                                                    purchase.warehouse_name ||
                                                                    "-"}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {getCategories(
                                                                    purchase.items ||
                                                                        []
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {(
                                                                    purchase.items ||
                                                                    []
                                                                )
                                                                    .map(
                                                                        (
                                                                            item
                                                                        ) =>
                                                                            item
                                                                                .subcategory
                                                                                ?.name ||
                                                                            item.subcategory_name ||
                                                                            "-"
                                                                    )
                                                                    .filter(
                                                                        (
                                                                            name,
                                                                            idx,
                                                                            arr
                                                                        ) =>
                                                                            name &&
                                                                            arr.indexOf(
                                                                                name
                                                                            ) ===
                                                                                idx
                                                                    )
                                                                    .join(
                                                                        ", "
                                                                    ) || "-"}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {getProductNames(
                                                                    purchase.items ||
                                                                        []
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                Rp{" "}
                                                                {Number(
                                                                    (purchase.items ||
                                                                        [])[0]
                                                                        ?.harga_pembelian ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                {Number(
                                                                    (purchase.items ||
                                                                        [])[0]
                                                                        ?.qty ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                Rp{" "}
                                                                {Number(
                                                                    purchase.total_pembelian ||
                                                                        0
                                                                ).toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </td>
                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex gap-2">
                                                                <Link
                                                                    href={route(
                                                                        "purchases.show",
                                                                        purchase.id
                                                                    )}
                                                                    className="text-white bg-blue-600 hover:bg-blue-700 rounded px-2 py-1 text-xs"
                                                                >
                                                                    Lihat
                                                                </Link>
                                                                <Link
                                                                    href={route(
                                                                        "purchases.edit",
                                                                        purchase.id
                                                                    )}
                                                                    className="text-yellow-700 bg-yellow-100 hover:bg-yellow-200 rounded px-2 py-1 text-xs"
                                                                >
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            purchase.id
                                                                        )
                                                                    }
                                                                    className="text-red-700 bg-red-100 hover:bg-red-200 rounded px-2 py-1 text-xs"
                                                                >
                                                                    Hapus
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {/* Baris item tambahan jika ada lebih dari satu item */}
                                                        {Array.isArray(
                                                            purchase.items
                                                        ) &&
                                                            purchase.items
                                                                .length > 1 &&
                                                            purchase.items
                                                                .slice(1)
                                                                .map(
                                                                    (
                                                                        item,
                                                                        itemIdx
                                                                    ) => (
                                                                        <tr
                                                                            key={`${purchase.id}-${itemIdx}`}
                                                                            className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                                                                        >
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"></td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"></td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"></td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"></td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                {item
                                                                                    .category
                                                                                    ?.name ||
                                                                                    item.category_name ||
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                {item
                                                                                    .subcategory
                                                                                    ?.name ||
                                                                                    item.subcategory_name ||
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                {item
                                                                                    .product
                                                                                    ?.name ||
                                                                                    item.product_name ||
                                                                                    "-"}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                Rp{" "}
                                                                                {Number(
                                                                                    item.harga_pembelian ||
                                                                                        0
                                                                                ).toLocaleString(
                                                                                    "id-ID"
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                                                                {Number(
                                                                                    item.qty ||
                                                                                        0
                                                                                ).toLocaleString(
                                                                                    "id-ID"
                                                                                )}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"></td>
                                                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"></td>
                                                                        </tr>
                                                                    )
                                                                )}
                                                    </React.Fragment>
                                                )
                                            )}
                                            {/* Baris subtotal per grup */}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan="11"
                                        className="px-4 py-4 text-center text-gray-500 dark:text-gray-400 text-sm"
                                    >
                                        Tidak ada data pembelian.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {/* Baris total keseluruhan */}
                        <tfoot>
                            <tr className="bg-green-100 dark:bg-green-900">
                                <td
                                    colSpan={9}
                                    className="px-4 py-3 font-bold text-right text-green-800 dark:text-green-200"
                                >
                                    Total Pembelian
                                </td>
                                <td className="px-4 py-3 font-bold text-right text-green-800 dark:text-green-200">
                                    Rp{" "}
                                    {Number(totalSemuaPembelian).toLocaleString(
                                        "id-ID"
                                    )}
                                </td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                {/* ...existing code... */}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
