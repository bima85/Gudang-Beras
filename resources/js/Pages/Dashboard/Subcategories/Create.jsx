import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, Link } from "@inertiajs/react";
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
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function Create({ categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        code: "",
        description: "",
        category_id: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("subcategories.store"), {
            onSuccess: () => {
                toast.success("Subkategori berhasil dibuat");
            },
            onError: () => {
                toast.error("Gagal membuat subkategori");
            },
        });
    };

    return (
        <>
            <Head title="Tambah Subkategori" />
            <div className="container mx-auto p-4 max-w-2xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route("subcategories.index")}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Tambah Subkategori
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Buat subkategori produk baru
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Subkategori</CardTitle>
                        <CardDescription>
                            Masukkan detail subkategori yang akan dibuat
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code">
                                        Kode Subkategori
                                    </Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData("code", e.target.value)
                                        }
                                        placeholder="Masukkan kode subkategori"
                                        className={
                                            errors.code ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.code}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category_id">
                                        Kategori
                                    </Label>
                                    <Select
                                        value={data.category_id}
                                        onValueChange={(value) =>
                                            setData("category_id", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={
                                                errors.category_id
                                                    ? "border-red-500"
                                                    : ""
                                            }
                                        >
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id.toString()}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && (
                                        <p className="text-sm text-red-600 dark:text-red-400">
                                            {errors.category_id}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Subkategori</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Masukkan nama subkategori"
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
                                <Label htmlFor="description">Deskripsi</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData("description", e.target.value)
                                    }
                                    placeholder="Masukkan deskripsi subkategori (opsional)"
                                    rows={4}
                                    className={
                                        errors.description
                                            ? "border-red-500"
                                            : ""
                                    }
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => reset()}
                                    className="order-2 sm:order-1"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset Form
                                </Button>

                                <div className="flex gap-3 order-1 sm:order-2">
                                    <Button variant="outline" asChild>
                                        <Link
                                            href={route("subcategories.index")}
                                        >
                                            Batal
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
