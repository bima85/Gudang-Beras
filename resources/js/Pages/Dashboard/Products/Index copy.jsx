import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
} from "@tabler/icons-react";
import Button from "@/Components/Dashboard/Button";
import Search from "@/Components/Dashboard/Search";
import DataTable from "react-data-table-component";
import Barcode from "@/Components/Dashboard/Barcode";
import Pagination from "@/Components/Dashboard/Pagination";

export default function Index({ products }) {
    const { errors } = usePage().props;

    const handleDelete = (id, name) => {
        if (confirm(`Yakin ingin menghapus produk "${name}"?`)) {
            Inertia.delete(route("products.destroy", id));
        }
    };

    const columns = [
        {
            name: "No",
            selector: (row, i) =>
                i + 1 + (products.current_page - 1) * products.per_page,
            width: "60px",
            cell: (row, i) => (
                <div className="text-center w-full">
                    {i + 1 + (products.current_page - 1) * products.per_page}
                </div>
            ),
        },
        {
            name: "Kode",
            selector: (row) => row.barcode,
            cell: (row) => (
                <div className="flex flex-col items-center">
                    <Barcode
                        value={row.barcode}
                        format="CODE39"
                        width={1}
                        height={35}
                        lineColor="#000"
                        displayValue={false}
                        className="max-w-[100px]"
                    />
                    <span className="text-xs mt-1 text-gray-600">
                        {row.barcode}
                    </span>
                </div>
            ),
            sortable: true,
        },
        {
            name: "Kategori",
            className: "gap-2",
            selector: (row) => row.category?.name || "-",
            sortable: true,
        },
        {
            name: "Nama",
            selector: (row) => row.name || "-",
            sortable: true,
        },
        {
            name: "Deskripsi",
            selector: (row) => row.description || "-",
            wrap: true,
            sortable: false,
        },
        {
            name: "Satuan",
            selector: (row) =>
                row.unit
                    ? `${row.unit.name}${
                          row.unit.multiplier
                              ? ` (${row.unit.multiplier} kg)`
                              : ""
                      }`
                    : "-",
            sortable: true,
        },
        {
            name: "Harga Beli",
            selector: (row) =>
                row.purchase_price !== null
                    ? `Rp ${Number(row.purchase_price).toLocaleString()}`
                    : "-",
            sortable: true,
        },
        {
            name: "Harga Jual",
            selector: (row) =>
                row.sell_price !== null
                    ? `Rp ${Number(row.sell_price).toLocaleString()}`
                    : "-",
            sortable: true,
        },
        {
            name: "Opsi",
            cell: (row) => (
                <div className="flex gap-2 justify-center">
                    <Button
                        type="edit"
                        icon={<IconPencilCog size={18} />}
                        href={route("products.edit", row.id)}
                        aria-label={`Edit produk ${row.name}`}
                        className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 px-2 py-1 rounded"
                    />
                    <Button
                        type="button"
                        icon={<IconTrash size={18} />}
                        onClick={() => handleDelete(row.id, row.name)}
                        aria-label={`Hapus produk ${row.name}`}
                        className="bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 rounded"
                    />
                </div>
            ),
            ignoreRowClick: true,
            width: "140px",
        },
    ];

    return (
        <>
            <Head title="Produk" />
            <div className="p-4 space-y-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                    <Button
                        type="link"
                        href={route("products.create")}
                        icon={<IconCirclePlus size={20} />}
                        label="Tambah Data Produk"
                        className="bg-white border text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-50"
                    />
                    <div className="w-full md:w-1/3">
                        <Search
                            url={route("products.index")}
                            placeholder="Cari produk..."
                        />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-2 md:p-4 overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={products.data || []}
                        pagination
                        paginationServer
                        paginationTotalRows={products.total}
                        paginationPerPage={products.per_page}
                        paginationDefaultPage={products.current_page}
                        highlightOnHover
                        striped
                        responsive
                        noDataComponent={
                            <div className="text-center py-4 text-gray-500">
                                <IconDatabaseOff
                                    size={40}
                                    className="mx-auto mb-2"
                                />
                                <p>Data Produk tidak ditemukan.</p>
                            </div>
                        }
                        customStyles={{
                            headRow: {
                                style: {
                                    backgroundColor: "#f3f4f6",
                                },
                            },
                            rows: {
                                style: {
                                    backgroundColor: "#ffffff",
                                    minHeight: "50px",
                                },
                            },
                            headCells: {
                                style: {
                                    fontWeight: "600",
                                    fontSize: "13px",
                                    whiteSpace: "nowrap",
                                },
                            },
                            cells: {
                                style: {
                                    paddingTop: "12px",
                                    paddingBottom: "12px",
                                    fontSize: "14px",
                                    whiteSpace: "nowrap",
                                    color: "#374151",
                                },
                            },
                        }}
                    />
                </div>

                {products.last_page > 1 && (
                    <div className="mt-4">
                        <Pagination links={products.links} />
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
