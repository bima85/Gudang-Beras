import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import {
    IconCirclePlus,
    IconPencilCog,
    IconTrash,
    IconEyeBolt,
    IconSearch,
    IconDatabaseOff,
    IconFilter,
} from "@tabler/icons-react";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";

export default function Index({ suppliers }) {
    const { roles, permissions, errors } = usePage().props;

    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);

    const columns = [
        {
            accessorKey: "name",
            header: "Nama",
            cell: ({ row }) => (
                <div className="font-medium">{row.getValue("name")}</div>
            ),
        },
        {
            accessorKey: "phone",
            header: "No. Handphone",
            cell: ({ row }) => <div>{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "address",
            header: "Alamat",
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.getValue("address")}>
                    {row.getValue("address")}
                </div>
            ),
        },
        {
            id: "actions",
            header: "Aksi",
            enableColumnFilter: false,
            cell: ({ row }) => {
                const supplier = row.original;
                return (
                    <div className="flex gap-1 flex-wrap">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <Link href={route("suppliers.edit", supplier.id)}>
                                <IconPencilCog size={14} />
                            </Link>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(supplier.id)}
                        >
                            <IconTrash size={14} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0"
                            asChild
                        >
                            <Link href={route("suppliers.show", supplier.id)}>
                                <IconEyeBolt size={14} />
                            </Link>
                        </Button>
                    </div>
                );
            },
        },
    ];

    const table = useReactTable({
        data: suppliers,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting,
            globalFilter,
            columnFilters,
        },
        initialState: {
            pagination: {
                pageSize: 10,
            },
        },
    });

    const handleDelete = (id) => {
        if (confirm("Apakah kamu yakin ingin menghapus data ini?")) {
            router.delete(route("suppliers.destroy", id));
        }
    };

    return (
        <>
            <Head title="Supplier" />
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route("suppliers.create")}>
                            <IconCirclePlus size={16} />
                            Tambah Data Supplier
                        </Link>
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-80">
                            <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Cari supplier..."
                                value={globalFilter ?? ""}
                                onChange={(event) => setGlobalFilter(event.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setGlobalFilter("");
                                setColumnFilters([]);
                            }}
                            className="w-full sm:w-auto"
                        >
                            <IconFilter size={16} />
                            Hapus Filter
                        </Button>
                    </div>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Data Supplier</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead
                                                    key={header.id}
                                                    className="cursor-pointer select-none"
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                    {{
                                                        asc: " 🔼",
                                                        desc: " 🔽",
                                                    }[header.column.getIsSorted()] ?? null}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                    {/* Filter Row */}
                                    <TableRow>
                                        {table.getHeaderGroups()[0].headers.map((header) => (
                                            <TableHead key={`filter-${header.id}`} className="p-2">
                                                {header.column.getCanFilter() ? (
                                                    <Input
                                                        placeholder={`Filter ${header.column.columnDef.header}...`}
                                                        value={header.column.getFilterValue() ?? ""}
                                                        onChange={(event) =>
                                                            header.column.setFilterValue(event.target.value)
                                                        }
                                                        className="h-8 text-xs"
                                                    />
                                                ) : null}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <IconDatabaseOff className="h-8 w-8 text-muted-foreground" />
                                                    <span className="text-muted-foreground">
                                                        Tidak ada data supplier ditemukan.
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="text-sm text-muted-foreground">
                                Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} sampai{" "}
                                {Math.min(
                                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                    table.getFilteredRowModel().rows.length
                                )}{" "}
                                dari {table.getFilteredRowModel().rows.length} hasil
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Selanjutnya
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
