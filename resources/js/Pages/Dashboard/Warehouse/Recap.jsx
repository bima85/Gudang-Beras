import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { toast } from "react-toastify";
import {
    Download,
    Filter,
    RotateCcw,
    Warehouse,
    BarChart3,
} from "lucide-react";

export default function WarehouseRecap({
    warehouses,
    totalWarehouse = 0,
    start_date = "",
    end_date = "",
}) {
    const [start, setStart] = useState(start_date || "");
    const [end, setEnd] = useState(end_date || "");

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route("dashboard.warehouses.recap"),
            { start_date: start, end_date: end },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetFilter = () => {
        setStart("");
        setEnd("");
        router.get(
            route("dashboard.warehouses.recap"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleExport = () => {
        let csv = "Kode,Nama,Lokasi,Telepon,Deskripsi,Dibuat Pada\n";
        warehouses.data.forEach((w) => {
            csv += `${w.code || ""},${w.name},${w.address || ""},${
                w.phone || ""
            },${w.description || ""},${w.created_at}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rekap-gudang-${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Data berhasil diekspor");
    };

    return (
        <DashboardLayout>
            <Head title="Rekap Gudang" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Rekap Data Gudang
                        </h1>
                        <p className="text-muted-foreground">
                            Laporan dan ringkasan data gudang
                        </p>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Gudang
                            </CardTitle>
                            <Warehouse className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-primary">
                                {totalWarehouse}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Gudang terdaftar dalam sistem
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="start_date">
                                        Tanggal Mulai
                                    </Label>
                                    <Input
                                        id="start_date"
                                        type="date"
                                        value={start}
                                        onChange={(e) =>
                                            setStart(e.target.value)
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="end_date">
                                        Tanggal Akhir
                                    </Label>
                                    <Input
                                        id="end_date"
                                        type="date"
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    className="flex items-center gap-2"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    Filter
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={resetFilter}
                                    className="flex items-center gap-2"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleExport}
                                    className="flex items-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Data Gudang
                            {warehouses?.total && (
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({warehouses.total} gudang)
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {warehouses?.data?.length > 0 ? (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">
                                                No
                                            </TableHead>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead>Dibuat</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {warehouses.data.map((warehouse, i) => (
                                            <TableRow key={warehouse.id}>
                                                <TableCell className="text-center font-medium">
                                                    {i +
                                                        1 +
                                                        (warehouses.current_page -
                                                            1) *
                                                            warehouses.per_page}
                                                </TableCell>
                                                <TableCell className="font-mono">
                                                    {warehouse.code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {warehouse.name}
                                                </TableCell>
                                                <TableCell>
                                                    {warehouse.address || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {warehouse.phone || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    <span className="truncate max-w-[150px] block">
                                                        {warehouse.description ||
                                                            "-"}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {warehouse.created_at
                                                        ? new Date(
                                                              warehouse.created_at
                                                          ).toLocaleDateString(
                                                              "id-ID"
                                                          )
                                                        : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {warehouses.links &&
                                    warehouses.links.length > 3 && (
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-muted-foreground">
                                                Menampilkan {warehouses.from}-
                                                {warehouses.to} dari{" "}
                                                {warehouses.total} data
                                            </div>
                                            <div className="flex gap-2">
                                                {warehouses.links.map(
                                                    (link, index) => {
                                                        if (link.url === null)
                                                            return null;

                                                        return (
                                                            <Button
                                                                key={index}
                                                                variant={
                                                                    link.active
                                                                        ? "default"
                                                                        : "outline"
                                                                }
                                                                size="sm"
                                                                onClick={() =>
                                                                    router.get(
                                                                        link.url
                                                                    )
                                                                }
                                                                dangerouslySetInnerHTML={{
                                                                    __html: link.label,
                                                                }}
                                                            />
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground mb-4">
                                    <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    Tidak ada data gudang yang ditemukan
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
