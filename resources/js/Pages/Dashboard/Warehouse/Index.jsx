import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
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
import { toast } from "react-toastify";
import {
    Plus,
    Search,
    RotateCcw,
    Edit,
    Trash2,
    MapPin,
    Phone,
    FileText,
    Warehouse,
} from "lucide-react";

export default function Index({ warehouses, filters }) {
    const [search, setSearch] = useState(filters?.search || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("dashboard.warehouses.index"),
            { search },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const resetFilter = () => {
        setSearch("");
        router.get(
            route("dashboard.warehouses.index"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = (warehouse) => {
        if (
            confirm(
                `Apakah Anda yakin ingin menghapus gudang "${warehouse.name}"?`
            )
        ) {
            router.delete(route("dashboard.warehouses.destroy", warehouse.id), {
                onSuccess: () => {
                    toast.success("Gudang berhasil dihapus");
                },
                onError: () => {
                    toast.error("Gagal menghapus gudang");
                },
            });
        }
    };
    return (
        <DashboardLayout>
            <Head title="Daftar Gudang" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Daftar Gudang
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola data gudang dalam sistem
                        </p>
                    </div>
                    <Link href={route("dashboard.warehouses.create")}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Gudang
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filter Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSearch} className="flex gap-4">
                            <div className="flex-1">
                                <Input
                                    type="text"
                                    placeholder="Cari nama gudang, kode, alamat, atau telepon..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <Button type="submit" variant="default">
                                <Search className="h-4 w-4 mr-2" />
                                Cari
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetFilter}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </form>
                    </CardContent>
                </Card>

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
                                            <TableHead>Kode Gudang</TableHead>
                                            <TableHead>Nama Gudang</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead className="w-[200px]">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {warehouses.data.map((warehouse) => (
                                            <TableRow key={warehouse.id}>
                                                <TableCell className="font-mono font-medium">
                                                    {warehouse.code}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Warehouse className="h-4 w-4 text-muted-foreground" />
                                                        {warehouse.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate max-w-[200px]">
                                                            {warehouse.address ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {warehouse.phone ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate max-w-[150px]">
                                                            {warehouse.description ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route(
                                                                "dashboard.warehouses.edit",
                                                                warehouse.id
                                                            )}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    warehouse
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
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
                                    {search
                                        ? "Tidak ada gudang yang ditemukan dengan kata kunci tersebut"
                                        : "Belum ada data gudang"}
                                </div>
                                {!search && (
                                    <Link
                                        href={route(
                                            "dashboard.warehouses.create"
                                        )}
                                    >
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Gudang Pertama
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
