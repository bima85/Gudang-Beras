import React, { useState, useMemo } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import { route } from "ziggy-js";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
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
import { Badge } from "@/Components/ui/badge";
import { toast } from "sonner";
import {
    Plus,
    Search as SearchIcon,
    MoreHorizontal,
    Eye,
    Edit,
    Trash2,
    RotateCcw,
    Filter,
    Calendar,
} from "lucide-react";

export default function Index({ subcategories }) {
    const [selectedCategory, setSelectedCategory] = useState("");
    const [searchName, setSearchName] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const { delete: destroy } = useForm();

    const handleResetFilter = () => {
        setSearchName("");
        setSelectedCategory("");
        setSelectedDate("");
    };

    const categories = useMemo(() => {
        const cats = subcategories.data
            .map((s) => s.category?.name)
            .filter((v, i, arr) => v && arr.indexOf(v) === i);
        return cats;
    }, [subcategories]);

    const filteredData = useMemo(() => {
        return subcategories.data.filter((s) => {
            const matchCategory = selectedCategory
                ? s.category?.name === selectedCategory
                : true;
            const matchName = searchName
                ? s.name.toLowerCase().includes(searchName.toLowerCase())
                : true;
            const matchDate = selectedDate
                ? new Date(s.created_at).toISOString().split("T")[0] ===
                  selectedDate
                : true;
            return matchCategory && matchName && matchDate;
        });
    }, [subcategories, selectedCategory, searchName, selectedDate]);

    const grouped = useMemo(() => {
        const group = {};
        filteredData.forEach((s) => {
            const cat = s.category?.name || "Tanpa Kategori";
            if (!group[cat]) group[cat] = [];
            group[cat].push(s);
        });
        return group;
    }, [filteredData]);

    const handleDelete = (id) => {
        destroy(route("subcategories.destroy", id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Subkategori berhasil dihapus");
            },
            onError: () => {
                toast.error("Gagal menghapus subkategori");
            },
        });
    };

    return (
        <>
            <Head title="Subkategori" />
            <div className="container mx-auto p-4 space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Subkategori
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola subkategori produk
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={route("subcategories.create")}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Subkategori
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter & Pencarian
                        </CardTitle>
                        <CardDescription>
                            Filter subkategori berdasarkan kategori, nama, atau
                            tanggal
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Cari nama subkategori..."
                                        value={searchName}
                                        onChange={(e) =>
                                            setSearchName(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="sm:w-48">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) =>
                                        setSelectedCategory(e.target.value)
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
                                >
                                    <option value="">Semua Kategori</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="sm:w-40">
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) =>
                                            setSelectedDate(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={handleResetFilter}
                                className="sm:w-auto"
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16 text-center">
                                            No
                                        </TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Kategori</TableHead>
                                        <TableHead>Kode</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Deskripsi</TableHead>
                                        <TableHead className="w-20 text-center">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {Object.keys(grouped).length ? (
                                        Object.keys(grouped).map((cat, idx) => (
                                            <React.Fragment key={cat}>
                                                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                                    <TableCell
                                                        colSpan={7}
                                                        className="font-semibold text-gray-900 dark:text-white"
                                                    >
                                                        <Badge
                                                            variant="secondary"
                                                            className="mr-2"
                                                        >
                                                            {
                                                                grouped[cat]
                                                                    .length
                                                            }
                                                        </Badge>
                                                        {cat}
                                                    </TableCell>
                                                </TableRow>
                                                {grouped[cat].map(
                                                    (subcategory, i) => (
                                                        <TableRow
                                                            key={subcategory.id}
                                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                        >
                                                            <TableCell className="text-center">
                                                                {(subcategories.current_page -
                                                                    1) *
                                                                    subcategories.per_page +
                                                                    Object.values(
                                                                        grouped
                                                                    )
                                                                        .slice(
                                                                            0,
                                                                            idx
                                                                        )
                                                                        .reduce(
                                                                            (
                                                                                acc,
                                                                                group
                                                                            ) =>
                                                                                acc +
                                                                                group.length,
                                                                            0
                                                                        ) +
                                                                    i +
                                                                    1}
                                                            </TableCell>
                                                            <TableCell>
                                                                {new Date(
                                                                    subcategory.created_at
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        year: "numeric",
                                                                        month: "short",
                                                                        day: "numeric",
                                                                    }
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline">
                                                                    {subcategory
                                                                        .category
                                                                        ?.name ||
                                                                        "-"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="font-mono text-sm">
                                                                {
                                                                    subcategory.code
                                                                }
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {
                                                                    subcategory.name
                                                                }
                                                            </TableCell>
                                                            <TableCell className="max-w-xs truncate">
                                                                {subcategory.description ||
                                                                    "-"}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger
                                                                        asChild
                                                                    >
                                                                        <Button
                                                                            variant="ghost"
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <MoreHorizontal className="h-4 w-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end">
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    "subcategories.show",
                                                                                    subcategory.id
                                                                                )}
                                                                            >
                                                                                <Eye className="mr-2 h-4 w-4" />
                                                                                Detail
                                                                            </Link>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            asChild
                                                                        >
                                                                            <Link
                                                                                href={route(
                                                                                    "subcategories.edit",
                                                                                    subcategory.id
                                                                                )}
                                                                            >
                                                                                <Edit className="mr-2 h-4 w-4" />
                                                                                Edit
                                                                            </Link>
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
                                                                                >
                                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                                    Hapus
                                                                                </DropdownMenuItem>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>
                                                                                        Konfirmasi
                                                                                        Hapus
                                                                                    </AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        Apakah
                                                                                        Anda
                                                                                        yakin
                                                                                        ingin
                                                                                        menghapus
                                                                                        subkategori
                                                                                        "
                                                                                        {
                                                                                            subcategory.name
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
                                                                                                subcategory.id
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
                                            </React.Fragment>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="text-center py-8"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                        <SearchIcon className="h-6 w-6" />
                                                    </div>
                                                    <p className="font-medium">
                                                        Data subkategori tidak
                                                        ditemukan
                                                    </p>
                                                    <p className="text-sm">
                                                        Coba ubah filter atau
                                                        buat subkategori baru
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {subcategories.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-2">
                            {subcategories.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? "default" : "outline"
                                    }
                                    size="sm"
                                    asChild={link.url}
                                    disabled={!link.url}
                                >
                                    {link.url ? (
                                        <Link
                                            href={link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
