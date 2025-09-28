import React, { useState, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender } from "@tanstack/react-table";
import { ChevronUp, ChevronDown, Search, Calendar, MapPin } from "lucide-react";

export default function Index({ stockCards }) {
    const page = usePage();
    const { flash } = page.props;

    // Filter states
    const [productSearch, setProductSearch] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    // Prepare data for table
    const allCards = stockCards.data || [];
    const pagination = stockCards;

    // Function to reload with filters
    const reloadWithFilters = (params) => {
        router.visit(route('stock-cards.index'), {
            data: params,
            preserveScroll: true,
            only: ['stockCards'],
        });
    };

    // Handle filter changes
    const handleProductSearchChange = (value) => {
        setProductSearch(value);
        setCurrentPage(1);
        const params = {
            product_search: value,
            start_date: startDate,
            end_date: endDate,
            location: location,
            page: 1,
        };
        reloadWithFilters(params);
    };

    const handleDateChange = (start, end) => {
        setStartDate(start);
        setEndDate(end);
        setCurrentPage(1);
        const params = {
            product_search: productSearch,
            start_date: start,
            end_date: end,
            location: location,
            page: 1,
        };
        reloadWithFilters(params);
    };

    const handleLocationChange = (value) => {
        setLocation(value);
        setCurrentPage(1);
        const locationValue = value === "all" ? "" : value;
        const params = {
            product_search: productSearch,
            start_date: startDate,
            end_date: endDate,
            location: locationValue,
            page: 1,
        };
        reloadWithFilters(params);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        const locationValue = location === "all" ? "" : location;
        const params = {
            product_search: productSearch,
            start_date: startDate,
            end_date: endDate,
            location: locationValue,
            page: page,
        };
        reloadWithFilters(params);
    };

    // Table columns
    const columns = useMemo(() => [
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="h-auto p-0 font-semibold"
                >
                    Tanggal
                    {column.getIsSorted() === "asc" && <ChevronUp className="ml-2 h-4 w-4" />}
                    {column.getIsSorted() === "desc" && <ChevronDown className="ml-2 h-4 w-4" />}
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-sm">
                    {row.original.created_at
                        ? new Date(row.original.created_at).toLocaleDateString('id-ID')
                        : "-"}
                </div>
            ),
        },
        {
            accessorKey: "product.name",
            header: "Produk",
            cell: ({ row }) => (
                <div className="text-sm font-medium">{row.original.product?.name}</div>
            ),
        },
        {
            accessorKey: "category_name",
            header: "Kategori",
            cell: ({ row }) => (
                <div className="text-sm">{row.original.category_name || "-"}</div>
            ),
        },
        {
            accessorKey: "product.subcategory.name",
            header: "Subkategori",
            cell: ({ row }) => (
                <div className="text-sm">{row.original.product?.subcategory?.name || "-"}</div>
            ),
        },
        {
            accessorKey: "location",
            header: "Lokasi",
            cell: ({ row }) => {
                const card = row.original;
                if (card.warehouse_id) {
                    return (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Gudang: {card.warehouse?.name}
                        </Badge>
                    );
                } else if (card.toko_id) {
                    return (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Toko: {card.toko?.name}
                        </Badge>
                    );
                }
                return <Badge variant="outline">-</Badge>;
            },
        },
        {
            accessorKey: "type",
            header: "Jenis",
            cell: ({ row }) => {
                const card = row.original;
                let variant = "secondary";
                let label = card.type;

                if (card.type === 'in') {
                    variant = "default";
                    label = "Masuk";
                } else if (card.type === 'out') {
                    variant = "destructive";
                    label = "Keluar";
                } else if (card.type === 'adjustment') {
                    variant = "secondary";
                    label = "Penyesuaian";
                }

                // Check if it's a transfer
                if (card.note && card.note.includes('Transfer')) {
                    variant = "outline";
                    label = card.type === 'in' ? "Transfer Masuk" : "Transfer Keluar";
                }

                return <Badge variant={variant}>{label}</Badge>;
            },
        },
        {
            accessorKey: "qty_original",
            header: "Qty",
            cell: ({ row }) => (
                <div className="text-sm text-right">
                    {row.original.qty_original || row.original.qty}{" "}
                    {row.original.unit?.name || ""}
                </div>
            ),
        },
        {
            accessorKey: "saldo",
            header: "Saldo",
            cell: ({ row }) => (
                <div className="text-sm text-right flex items-center justify-end gap-2">
                    <span className={row.original.actual_saldo !== undefined ? "text-green-600 font-medium" : ""}>
                        {row.original.actual_saldo !== undefined ? row.original.actual_saldo : row.original.saldo}
                    </span>
                    {row.original.actual_saldo !== undefined && row.original.actual_saldo !== row.original.saldo && (
                        <Badge variant="outline" className="text-xs">
                            ✓
                        </Badge>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "note",
            header: "Catatan",
            cell: ({ row }) => (
                <div className="text-sm">{row.original.note || "-"}</div>
            ),
        },
    ], []);

    // Create table
    const table = useReactTable({
        data: allCards,
        columns: columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        pageCount: pagination.last_page || 1,
    });

    return (
        <>
            <Head title="Kartu Stok" />
            <div className="p-4 mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold">Kartu Stok</h1>
                    <Link href={route("stock-cards.create")}>
                        <Button>
                            Tambah
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-search" className="flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Cari Produk
                                </Label>
                                <Input
                                    id="product-search"
                                    type="text"
                                    placeholder="Nama produk..."
                                    value={productSearch}
                                    onChange={(e) => handleProductSearchChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="start-date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Tanggal Mulai
                                </Label>
                                <Input
                                    id="start-date"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => handleDateChange(e.target.value, endDate)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Tanggal Akhir
                                </Label>
                                <Input
                                    id="end-date"
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => handleDateChange(startDate, e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="location" className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Lokasi
                                </Label>
                                <Select value={location} onValueChange={handleLocationChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua lokasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Lokasi</SelectItem>
                                        <SelectItem value="warehouse">Gudang</SelectItem>
                                        <SelectItem value="store">Toko</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Combined Stock Cards Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Kartu Stok</CardTitle>
                        <div className="text-sm text-muted-foreground">
                            Menampilkan {pagination.from || 0} sampai {pagination.to || 0} dari {pagination.total || 0} entri kartu stok
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[600px]">
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow key={row.id}>
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
                                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                                Tidak ada data kartu stok
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                        <div className="flex items-center justify-between space-x-2 py-4">
                            <div className="flex-1 text-sm text-muted-foreground">
                                Halaman {pagination.current_page || 1} dari {pagination.last_page || 1}
                            </div>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange((pagination.current_page || 1) - 1)}
                                    disabled={!(pagination.prev_page_url)}
                                >
                                    Sebelumnya
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePageChange((pagination.current_page || 1) + 1)}
                                    disabled={!(pagination.next_page_url)}
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

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
