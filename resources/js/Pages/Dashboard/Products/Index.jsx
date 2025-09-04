import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
import {
    IconCirclePlus,
    IconPencilCog,
    IconTrash,
    IconDatabaseOff,
} from "@tabler/icons-react";
import Search from "@/Components/Dashboard/Search";
import DataTable from "react-data-table-component";
import Pagination from "@/Components/Dashboard/Pagination";
import { route } from "ziggy-js";

function Index({ products, errors }) {
    // Fungsi hapus produk
    const handleDelete = (id, name) => {
        if (confirm(`Yakin ingin menghapus produk "${name}"?`)) {
            router.delete(route("products.destroy", id));
        }
    };

    // Group products by category
    const groupedProducts = {};
    (products.data || []).forEach((prod) => {
        const catName = prod.category?.name || "Tanpa Kategori";
        if (!groupedProducts[catName]) groupedProducts[catName] = [];
        groupedProducts[catName].push(prod);
    });

    const [selectedIds, setSelectedIds] = useState([]);
    const allProductIds = (products.data || []).map((prod) => prod.id);
    const isAllChecked =
        selectedIds.length === allProductIds.length && allProductIds.length > 0;

    // Handle ceklist satu item
    const handleCheck = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };
    // Handle ceklist semua
    const handleCheckAll = () => {
        setSelectedIds(isAllChecked ? [] : allProductIds);
    };
    // Handle hapus bulk
    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        if (
            confirm(
                selectedIds.length === allProductIds.length
                    ? "Yakin ingin menghapus SEMUA produk yang sudah diceklist?"
                    : `Yakin ingin menghapus ${selectedIds.length} produk yang diceklist?`
            )
        ) {
            router.post(route("products.bulkDestroy"), { ids: selectedIds });
        }
    };

    // State untuk search
    const [search, setSearch] = useState("");

    // Fungsi handle cari
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route("products.index"), { search });
    };

    // Fungsi handle reset
    const handleReset = () => {
        setSearch("");
        router.get(route("products.index"));
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen p-4 sm:p-6">
                <Head title="Daftar Produk" />

                <Card className="mb-6">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <CardTitle>Daftar Produk</CardTitle>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button
                                variant="default"
                                onClick={() =>
                                    router.visit(route("products.create"))
                                }
                                className="flex items-center gap-2"
                            >
                                <IconCirclePlus size={16} />
                                Tambah Produk
                            </Button>
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center gap-2"
                            >
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari produk..."
                                    className="w-48"
                                />
                                <Button type="submit">Cari</Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleReset}
                                >
                                    Reset
                                </Button>
                            </form>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {errors && Object.keys(errors).length > 0 && (
                            <div className="mb-4">
                                {Object.values(errors).map((err, i) => (
                                    <div
                                        key={i}
                                        className="text-sm text-red-600"
                                    >
                                        {err}
                                    </div>
                                ))}
                            </div>
                        )}

                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>
                                        <input
                                            type="checkbox"
                                            checked={isAllChecked}
                                            onChange={handleCheckAll}
                                        />
                                    </TableHead>
                                    <TableHead>No</TableHead>
                                    <TableHead>Barcode</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Subkategori</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Satuan</TableHead>
                                    <TableHead>Min Stok</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(groupedProducts).length ===
                                    0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={10}
                                            className="text-center py-6"
                                        >
                                            Data produk belum ada.
                                        </TableCell>
                                    </TableRow>
                                )}

                                {Object.entries(groupedProducts).map(
                                    ([cat, prods], groupIndex) => (
                                        <React.Fragment key={cat}>
                                            <TableRow>
                                                <TableCell
                                                    colSpan={10}
                                                    className="font-semibold bg-gray-50"
                                                >{`Kategori: ${cat}`}</TableCell>
                                            </TableRow>
                                            {prods.map((row, index) => (
                                                <TableRow key={row.id || index}>
                                                    <TableCell>
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedIds.includes(
                                                                row.id
                                                            )}
                                                            onChange={() =>
                                                                handleCheck(
                                                                    row.id
                                                                )
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {groupIndex + 1}.
                                                        {index + 1}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.barcode || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.category?.name ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.subcategory
                                                            ?.name || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.name || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.unit?.name || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.min_stock || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        {row.description || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            <Link
                                                                href={route(
                                                                    "products.edit",
                                                                    row.id
                                                                )}
                                                                className="inline-flex items-center px-2 py-1 bg-yellow-400 text-white rounded"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        row.id,
                                                                        row.name
                                                                    )
                                                                }
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </React.Fragment>
                                    )
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {selectedIds.length > 0 && (
                    <div className="flex justify-end mb-4">
                        <Button
                            variant="destructive"
                            onClick={handleBulkDelete}
                        >
                            {isAllChecked
                                ? "Hapus Semua Produk yang Diceklist"
                                : `Hapus ${selectedIds.length} Produk yang Diceklist`}
                        </Button>
                    </div>
                )}

                {products.last_page > 1 && (
                    <div className="mt-6">
                        <Pagination links={products.links} />
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default Index;
