import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
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
import { Label } from "@/Components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Badge } from "@/Components/ui/badge";
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
import { Checkbox } from "@/Components/ui/checkbox";
import {
    Plus,
    Save,
    MoreHorizontal,
    Edit,
    Trash2,
    Scale,
    X,
    RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function Index({ units }) {
    const { data, setData, reset, post, put, processing, errors } = useForm({
        name: "",
        conversion_to_kg: "",
        is_default: false,
    });

    const [editingId, setEditingId] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            put(route("units.update", editingId), {
                onSuccess: () => {
                    reset();
                    setEditingId(null);
                    toast.success("Satuan berhasil diperbarui");
                },
                onError: () => {
                    toast.error("Gagal memperbarui satuan");
                },
            });
        } else {
            post(route("units.store"), {
                onSuccess: () => {
                    reset();
                    toast.success("Satuan berhasil ditambahkan");
                },
                onError: () => {
                    toast.error("Gagal menambah satuan");
                },
            });
        }
    };

    const handleEdit = (unit) => {
        setEditingId(unit.id);
        setData({
            name: unit.name,
            conversion_to_kg: unit.conversion_to_kg,
            is_default: unit.is_default,
        });
    };

    const handleDelete = (id) => {
        router.delete(route("units.destroy", id), {
            onSuccess: () => {
                toast.success("Satuan berhasil dihapus");
            },
            onError: () => {
                toast.error("Gagal menghapus satuan");
            },
        });
    };

    const handleCancel = () => {
        reset();
        setEditingId(null);
    };

    return (
        <>
            <Head title="Manajemen Satuan" />
            <div className="container p-4 mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Manajemen Satuan
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Kelola satuan produk dan konversi
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Scale className="w-4 h-4" />
                        {units.length} Satuan
                    </Badge>
                </div>

                {/* Form Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {editingId ? (
                                <Edit className="w-5 h-5" />
                            ) : (
                                <Plus className="w-5 h-5" />
                            )}
                            {editingId ? "Edit Satuan" : "Tambah Satuan Baru"}
                        </CardTitle>
                        <CardDescription>
                            {editingId
                                ? "Perbarui informasi satuan yang dipilih"
                                : "Tambahkan satuan baru dengan konversi ke kilogram"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Satuan</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="Contoh: Kg, Gram, Liter"
                                        className={
                                            errors.name ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="conversion_to_kg">
                                        Konversi ke Kilogram
                                    </Label>
                                    <Input
                                        id="conversion_to_kg"
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        value={data.conversion_to_kg}
                                        onChange={(e) =>
                                            setData(
                                                "conversion_to_kg",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Contoh: 1 untuk Kg, 0.001 untuk Gram"
                                        className={
                                            errors.conversion_to_kg
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.conversion_to_kg && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.conversion_to_kg}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_default"
                                    checked={data.is_default}
                                    onCheckedChange={(checked) =>
                                        setData("is_default", checked)
                                    }
                                />
                                <Label
                                    htmlFor="is_default"
                                    className="text-sm font-medium"
                                >
                                    Jadikan sebagai satuan default
                                </Label>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col justify-between gap-4 pt-6 border-t border-gray-200 sm:flex-row dark:border-gray-700">
                                <div className="order-2 sm:order-1">
                                    {editingId && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleCancel}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Batal Edit
                                        </Button>
                                    )}
                                </div>

                                <div className="flex order-1 gap-3 sm:order-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => reset()}
                                    >
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reset
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="w-4 h-4 mr-2" />
                                        {processing
                                            ? editingId
                                                ? "Memperbarui..."
                                                : "Menyimpan..."
                                            : editingId
                                            ? "Perbarui"
                                            : "Simpan"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Table Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Satuan</CardTitle>
                        <CardDescription>
                            Kelola satuan yang tersedia dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Satuan</TableHead>
                                        <TableHead>Konversi (kg)</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-20 text-center">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {units.length > 0 ? (
                                        units.map((unit) => (
                                            <TableRow
                                                key={unit.id}
                                                className={
                                                    editingId === unit.id
                                                        ? "bg-blue-50 dark:bg-blue-900/20"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                }
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <Scale className="w-4 h-4 text-gray-400" />
                                                        {unit.name}
                                                        {editingId ===
                                                            unit.id && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                Sedang diedit
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="font-mono text-sm">
                                                        {(() => {
                                                            const num =
                                                                parseFloat(
                                                                    unit.conversion_to_kg
                                                                );
                                                            // Format to 2 decimal places, remove trailing zeros
                                                            const formatted =
                                                                num
                                                                    .toFixed(2)
                                                                    .replace(
                                                                        /\.?0+$/,
                                                                        ""
                                                                    );
                                                            // Display as "1Kg" for whole numbers, "0.5kg" for decimals
                                                            return (
                                                                formatted +
                                                                (formatted.includes(
                                                                    "."
                                                                )
                                                                    ? "kg"
                                                                    : "Kg")
                                                            );
                                                        })()}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    {unit.is_default ? (
                                                        <Badge className="text-green-800 bg-green-100 dark:bg-green-900 dark:text-green-300">
                                                            Default
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline">
                                                            Normal
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="w-8 h-8 p-0"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        unit
                                                                    )
                                                                }
                                                                disabled={
                                                                    editingId ===
                                                                    unit.id
                                                                }
                                                            >
                                                                <Edit className="w-4 h-4 mr-2" />
                                                                {editingId ===
                                                                unit.id
                                                                    ? "Sedang diedit"
                                                                    : "Edit"}
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
                                                                        <Trash2 className="w-4 h-4 mr-2" />
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
                                                                            satuan
                                                                            "
                                                                            {
                                                                                unit.name
                                                                            }
                                                                            "?
                                                                            Tindakan
                                                                            ini
                                                                            tidak
                                                                            dapat
                                                                            dibatalkan
                                                                            dan
                                                                            dapat
                                                                            mempengaruhi
                                                                            data
                                                                            produk.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>
                                                                            Batal
                                                                        </AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() =>
                                                                                handleDelete(
                                                                                    unit.id
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
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={4}
                                                className="py-8 text-center"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
                                                    <Scale className="w-8 h-8" />
                                                    <p className="font-medium">
                                                        Belum ada satuan
                                                    </p>
                                                    <p className="text-sm">
                                                        Tambahkan satuan pertama
                                                        untuk memulai
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
            </div>
        </>
    );
}
Index.layout = (page) => <DashboardLayout children={page} />;
