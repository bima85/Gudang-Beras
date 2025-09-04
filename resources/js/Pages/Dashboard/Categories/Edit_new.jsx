import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { ArrowLeft, Save, Package } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Edit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        code: category.code || "",
        name: category.name,
        description: category.description || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("categories.update", category.id), {
            onSuccess: () => {
                toast.success("Kategori berhasil diperbarui!");
            },
            onError: (errors) => {
                toast.error("Terjadi kesalahan. Silakan periksa input Anda.");
            },
        });
    };

    return (
        <>
            <Head title="Edit Kategori" />
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.visit(route("categories.index"))}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            <Package className="h-6 w-6" />
                            Edit Kategori
                        </h2>
                        <p className="text-muted-foreground">
                            Perbarui informasi kategori "{category.name}"
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Kategori</CardTitle>
                            <CardDescription>
                                Perbarui detail kategori produk
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Kode Kategori */}
                                <div className="space-y-2">
                                    <Label htmlFor="code">Kode Kategori</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        type="text"
                                        placeholder="Masukkan kode kategori"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData("code", e.target.value)
                                        }
                                        className={
                                            errors.code ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                {/* Nama Kategori */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Nama Kategori *
                                    </Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Masukkan nama kategori"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className={
                                            errors.name ? "border-red-500" : ""
                                        }
                                        required
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Deskripsi */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Masukkan deskripsi kategori (opsional)"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    className={
                                        errors.description
                                            ? "border-red-500"
                                            : ""
                                    }
                                    rows={4}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Display current image if exists */}
                            {category.image && (
                                <div className="space-y-2">
                                    <Label>Gambar Saat Ini</Label>
                                    <div className="w-32 h-32 rounded-lg overflow-hidden border">
                                        <img
                                            src={
                                                category.image.startsWith(
                                                    "http"
                                                )
                                                    ? category.image
                                                    : `/storage/${category.image}`
                                            }
                                            alt={category.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    "/assets/default-category.png";
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                                router.visit(route("categories.index"))
                            }
                            disabled={processing}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="gap-2"
                        >
                            {processing ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Perbarui Kategori
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
