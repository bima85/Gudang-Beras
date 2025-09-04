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
    Eye,
    MapPin,
    Phone,
    FileText,
} from "lucide-react";

export default function Index({ tokos, filters }) {
    const [search, setSearch] = useState(filters?.search || "");

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route("tokos.index"),
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
            route("tokos.index"),
            {},
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    const handleDelete = (toko) => {
        if (confirm(`Apakah Anda yakin ingin menghapus toko "${toko.name}"?`)) {
            router.delete(route("tokos.destroy", toko.id), {
                onSuccess: () => {
                    toast.success("Toko berhasil dihapus");
                },
                onError: () => {
                    toast.error("Gagal menghapus toko");
                },
            });
        }
    };

    return (
        <DashboardLayout>
            <Head title="Daftar Toko" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Daftar Toko
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola data toko dalam sistem
                        </p>
                    </div>
                    <Link href={route("tokos.create")}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Toko
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
                                    placeholder="Cari nama toko, alamat, atau telepon..."
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
                            Data Toko
                            {tokos?.total && (
                                <span className="text-sm font-normal text-muted-foreground ml-2">
                                    ({tokos.total} toko)
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tokos?.data?.length > 0 ? (
                            <div className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nama Toko</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead>Telepon</TableHead>
                                            <TableHead>Deskripsi</TableHead>
                                            <TableHead className="w-[200px]">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tokos.data.map((toko) => (
                                            <TableRow key={toko.id}>
                                                <TableCell className="font-medium">
                                                    {toko.name}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate max-w-[200px]">
                                                            {toko.address ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span>
                                                            {toko.phone || "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span className="truncate max-w-[150px]">
                                                            {toko.description ||
                                                                "-"}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={route(
                                                                "tokos.show",
                                                                toko.id
                                                            )}
                                                        >
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={route(
                                                                "tokos.edit",
                                                                toko.id
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
                                                                    toko
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
                                {tokos.links && tokos.links.length > 3 && (
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-muted-foreground">
                                            Menampilkan {tokos.from}-{tokos.to}{" "}
                                            dari {tokos.total} data
                                        </div>
                                        <div className="flex gap-2">
                                            {tokos.links.map((link, index) => {
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
                                                            router.get(link.url)
                                                        }
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground mb-4">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    {search
                                        ? "Tidak ada toko yang ditemukan dengan kata kunci tersebut"
                                        : "Belum ada data toko"}
                                </div>
                                {!search && (
                                    <Link href={route("tokos.create")}>
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tambah Toko Pertama
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
