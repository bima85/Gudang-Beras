import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Package,
    Filter,
    MoreHorizontal,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import Pagination from "@/Components/Dashboard/Pagination";
import { cn } from "@/lib/utils";

export default function Index({ categories }) {
    const { errors } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        setIsLoading(true);
        router.get(
            route("categories.index"),
            { search: searchTerm },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleDelete = (id) => {
        router.delete(route("categories.destroy", id), {
            onSuccess: () => {
                // Success handled by backend
            },
        });
    };

    return (
        <>
            <Head title="Kategori" />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Package className="h-6 w-6" />
                            Kategori
                            <Badge variant="secondary" className="ml-2">
                                {categories.total}
                            </Badge>
                        </h2>
                        <p className="text-muted-foreground">
                            Kelola data kategori produk
                        </p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
                        <Button
                            onClick={() =>
                                router.visit(route("categories.create"))
                            }
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Kategori
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form
                        onSubmit={handleSearch}
                        className="flex gap-2 flex-1 max-w-md"
                    >
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Cari kategori..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={isLoading}
                        >
                            <Filter className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                {/* Error Messages */}
                {errors && Object.keys(errors).length > 0 && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                        <div className="space-y-1">
                            {Object.values(errors).map((error, index) => (
                                <p key={index} className="text-sm font-medium">
                                    {error}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kategori</CardTitle>
                        <CardDescription>
                            Menampilkan {categories.data.length} dari{" "}
                            {categories.total} kategori
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {categories.data.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">
                                                No
                                            </TableHead>
                                            <TableHead>Kode</TableHead>
                                            <TableHead>Nama Kategori</TableHead>
                                            <TableHead className="hidden md:table-cell">
                                                Deskripsi
                                            </TableHead>
                                            <TableHead className="w-[100px]">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.data.map(
                                            (category, index) => (
                                                <TableRow
                                                    key={category.id}
                                                    className="hover:bg-muted/50"
                                                >
                                                    <TableCell className="font-medium">
                                                        {index +
                                                            1 +
                                                            (categories.current_page -
                                                                1) *
                                                                categories.per_page}
                                                    </TableCell>
                                                    <TableCell>
                                                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                                                            {category.code ||
                                                                "-"}
                                                        </code>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        {category.name}
                                                    </TableCell>
                                                    <TableCell className="hidden md:table-cell text-muted-foreground">
                                                        {category.description ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger
                                                                asChild
                                                            >
                                                                <Button
                                                                    variant="ghost"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <span className="sr-only">
                                                                        Buka
                                                                        menu
                                                                    </span>
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            route(
                                                                                "categories.edit",
                                                                                category.id
                                                                            )
                                                                        )
                                                                    }
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Edit2 className="h-4 w-4 mr-2" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger
                                                                        asChild
                                                                    >
                                                                        <DropdownMenuItem
                                                                            onSelect={(
                                                                                e
                                                                            ) =>
                                                                                e.preventDefault()
                                                                            }
                                                                            className="cursor-pointer text-red-600 focus:text-red-600"
                                                                        >
                                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                                            Hapus
                                                                        </DropdownMenuItem>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>
                                                                                Hapus
                                                                                Kategori
                                                                            </AlertDialogTitle>
                                                                            <AlertDialogDescription>
                                                                                Apakah
                                                                                Anda
                                                                                yakin
                                                                                ingin
                                                                                menghapus
                                                                                kategori
                                                                                "
                                                                                {
                                                                                    category.name
                                                                                }
                                                                                "?
                                                                                Tindakan
                                                                                ini
                                                                                tidak
                                                                                dapat
                                                                                dibatalkan.
                                                                            </AlertDialogDescription>
                                                                        </AlertDialogHeader>
                                                                        <AlertDialogFooter>
                                                                            <AlertDialogCancel>
                                                                                Batal
                                                                            </AlertDialogCancel>
                                                                            <AlertDialogAction
                                                                                onClick={() =>
                                                                                    handleDelete(
                                                                                        category.id
                                                                                    )
                                                                                }
                                                                                className="bg-red-600 hover:bg-red-700"
                                                                            >
                                                                                Hapus
                                                                            </AlertDialogAction>
                                                                        </AlertDialogFooter>
                                                                    </AlertDialogContent>
                                                                </AlertDialog>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Package className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold">
                                    Tidak ada kategori
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Belum ada kategori yang tersedia. Mulai
                                    dengan menambahkan kategori baru.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.visit(route("categories.create"))
                                    }
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tambah Kategori
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {categories.last_page > 1 && (
                    <div className="flex justify-center">
                        <Pagination links={categories.links} />
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
