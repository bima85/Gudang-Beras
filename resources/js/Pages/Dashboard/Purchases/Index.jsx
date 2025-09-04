import React, { useState, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function Index({ purchases = [] }) {
    const { delete: destroy } = useForm();

    const [search, setSearch] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");
    const [filterSupplier, setFilterSupplier] = useState("");
    const [filterWarehouse, setFilterWarehouse] = useState("");
    const [openWarehouses, setOpenWarehouses] = useState({}); // <-- untuk accordion

    const supplierList = useMemo(
        () => [...new Set(purchases.map((p) => p.supplier?.name || "-"))],
        [purchases]
    );

    const warehouseList = useMemo(
        () => [...new Set(purchases.map((p) => p.warehouse?.name || "-"))],
        [purchases]
    );

    const handleDelete = (id) => {
        if (confirm("Yakin hapus pembelian ini?")) {
            destroy(route("purchases.destroy", id), {
                onSuccess: () => toast.success("Berhasil dihapus"),
                onError: () => toast.error("Gagal menghapus"),
            });
        }
    };

    const filtered = useMemo(() => {
        return purchases.filter((p) => {
            const tanggalObj = new Date(p.purchase_date);
            const matchSearch =
                search === "" ||
                p.supplier?.name
                    ?.toLowerCase()
                    .includes(search.toLowerCase()) ||
                p.items?.some((i) =>
                    i.product?.name
                        ?.toLowerCase()
                        .includes(search.toLowerCase())
                );

            let matchDate = true;
            if (filterStartDate) {
                const start = new Date(filterStartDate);
                start.setHours(0, 0, 0, 0);
                matchDate = tanggalObj >= start;
            }
            if (filterEndDate && matchDate) {
                const end = new Date(filterEndDate);
                end.setHours(23, 59, 59, 999);
                matchDate = tanggalObj <= end;
            }

            const matchSupplier =
                filterSupplier === "" ||
                (p.supplier?.name || "-") === filterSupplier;
            const matchWarehouse =
                filterWarehouse === "" ||
                (p.warehouse?.name || "-") === filterWarehouse;

            return matchSearch && matchDate && matchSupplier && matchWarehouse;
        });
    }, [
        purchases,
        search,
        filterStartDate,
        filterEndDate,
        filterSupplier,
        filterWarehouse,
    ]);

    const warehouseGroups = useMemo(() => {
        const groups = {};
        filtered.forEach((p) => {
            const warehouseName = p.warehouse?.name || "-";
            if (!groups[warehouseName]) groups[warehouseName] = [];
            p.items?.forEach((item) => {
                groups[warehouseName].push({ purchase: p, item });
            });
        });
        return groups;
    }, [filtered]);

    const grandTotal = Object.values(warehouseGroups)
        .flat()
        .reduce((total, { item }) => total + (item.subtotal || 0), 0);

    const toggleWarehouse = (name) => {
        setOpenWarehouses((prev) => ({
            ...prev,
            [name]: !prev[name],
        }));
    };

    return (
        <>
            <Head title="Pembelian" />
            <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen flex flex-col">
                <div className="container mx-auto space-y-6">
                    {/* Header & Actions */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        <h1 className="text-2xl font-bold">Daftar Pembelian</h1>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route("purchases.create")}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                            >
                                + Tambah Pembelian
                            </Link>
                            <a
                                href={route("purchases.export", {
                                    format: "excel",
                                })}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Export Excel
                            </a>
                            <a
                                href={route("purchases.export", {
                                    format: "pdf",
                                })}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Export PDF
                            </a>
                        </div>
                    </div>
                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                        <input
                            type="text"
                            placeholder="Cari supplier/produk..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-3 py-2 rounded border text-sm w-full"
                        />
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="px-3 py-2 rounded border text-sm w-full"
                        />
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="px-3 py-2 rounded border text-sm w-full"
                        />
                        <select
                            value={filterSupplier}
                            onChange={(e) => setFilterSupplier(e.target.value)}
                            className="px-3 py-2 rounded border text-sm w-full"
                        >
                            <option value="">Semua Supplier</option>
                            {supplierList.map((s, i) => (
                                <option key={i} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterWarehouse}
                            onChange={(e) => setFilterWarehouse(e.target.value)}
                            className="px-3 py-2 rounded border text-sm w-full"
                        >
                            <option value="">Semua Gudang</option>
                            {warehouseList.map((w, i) => (
                                <option key={i} value={w}>
                                    {w}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Table Data */}
                    {Object.keys(warehouseGroups).length === 0 ? (
                        <p className="text-gray-500">
                            Tidak ada data pembelian.
                        </p>
                    ) : (
                        Object.entries(warehouseGroups).map(
                            ([warehouse, records]) => {
                                const warehouseTotal = records.reduce(
                                    (sum, r) => sum + (r.item.subtotal || 0),
                                    0
                                );
                                const isOpen =
                                    openWarehouses[warehouse] ?? true;

                                return (
                                    <div
                                        key={warehouse}
                                        className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden"
                                    >
                                        {/* Accordion Header */}
                                        <button
                                            onClick={() =>
                                                toggleWarehouse(warehouse)
                                            }
                                            className="w-full flex justify-between items-center px-4 py-2 bg-blue-50 dark:bg-blue-900 font-semibold text-blue-800 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 transition"
                                        >
                                            <span>Gudang: {warehouse}</span>
                                            <span>{isOpen ? "▲" : "▼"}</span>
                                        </button>

                                        {/* Table Content */}
                                        {isOpen && (
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 text-sm">
                                                    <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                                                        <tr>
                                                            {/* Tambahkan kolom Timbangan di header */}
                                                            {[
                                                                "Tanggal",
                                                                "Supplier",
                                                                "Gudang",
                                                                "Subkategori",
                                                                "Produk",
                                                                "Qty",
                                                                "Harga",
                                                                "Kuli Fee",
                                                                "Timbangan",
                                                                "Subtotal",
                                                                "Toko",
                                                                "Aksi",
                                                            ].map((h) => (
                                                                <th
                                                                    key={h}
                                                                    className="px-3 py-2 text-left"
                                                                >
                                                                    {h}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                                        {records.map(
                                                            (
                                                                {
                                                                    purchase,
                                                                    item,
                                                                },
                                                                index
                                                            ) => (
                                                                <tr
                                                                    key={`${purchase.id}-${index}`}
                                                                >
                                                                    <td className="px-3 py-2">
                                                                        {new Date(
                                                                            purchase.purchase_date
                                                                        ).toLocaleDateString(
                                                                            "id-ID"
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {purchase
                                                                            .supplier
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {purchase
                                                                            .warehouse
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {item
                                                                            .subcategory
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {item
                                                                            .product
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {
                                                                            item.qty
                                                                        }{" "}
                                                                        {item
                                                                            .unit
                                                                            ?.name ||
                                                                            ""}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        Rp{" "}
                                                                        {Number(
                                                                            item.harga_pembelian
                                                                        ).toLocaleString(
                                                                            "id-ID"
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        Rp{" "}
                                                                        {Number(
                                                                            item.kuli_fee ||
                                                                                0
                                                                        ).toLocaleString(
                                                                            "id-ID"
                                                                        )}
                                                                    </td>
                                                                    {/* Kolom Timbangan */}
                                                                    <td className="px-3 py-2">
                                                                        {item.timbangan !==
                                                                            undefined &&
                                                                        item.timbangan !==
                                                                            null
                                                                            ? item.timbangan.toLocaleString(
                                                                                  "id-ID"
                                                                              )
                                                                            : "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        Rp{" "}
                                                                        {Number(
                                                                            item.subtotal
                                                                        ).toLocaleString(
                                                                            "id-ID"
                                                                        )}
                                                                    </td>
                                                                    <td className="px-3 py-2">
                                                                        {purchase
                                                                            .toko
                                                                            ?.name ||
                                                                            "-"}
                                                                    </td>
                                                                    <td className="px-3 py-2 flex flex-wrap gap-1">
                                                                        <Link
                                                                            href={route(
                                                                                "purchases.receipt",
                                                                                purchase.id
                                                                            )}
                                                                            className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                                                            target="_blank"
                                                                        >
                                                                            Cetak
                                                                            Nota
                                                                        </Link>
                                                                        <Link
                                                                            href={route(
                                                                                "purchases.show",
                                                                                purchase.id
                                                                            )}
                                                                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                                                        >
                                                                            Lihat
                                                                        </Link>
                                                                        <Link
                                                                            href={route(
                                                                                "purchases.edit",
                                                                                purchase.id
                                                                            )}
                                                                            className="text-xs bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    purchase.id
                                                                                )
                                                                            }
                                                                            className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                                                        >
                                                                            Hapus
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr className="bg-green-100 dark:bg-green-900">
                                                            <td
                                                                colSpan={11}
                                                                className="text-right px-3 py-2 font-bold text-green-800 dark:text-green-200"
                                                            >
                                                                Total Gudang:
                                                            </td>
                                                            <td className="px-3 py-2 font-bold text-green-800 dark:text-green-200">
                                                                Rp{" "}
                                                                {warehouseTotal.toLocaleString(
                                                                    "id-ID"
                                                                )}
                                                            </td>
                                                            <td></td>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                        )
                    )}

                    {/* Grand Total */}
                    <div className="text-right text-lg font-semibold text-green-700 dark:text-green-300">
                        Total Seluruh Pembelian: Rp{" "}
                        {grandTotal.toLocaleString("id-ID")}
                    </div>
                </div>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
