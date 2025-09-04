import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
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
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export default function Edit({ subcategory, categories }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        code: subcategory.code || "",
        name: subcategory.name,
        description: subcategory.description,
        category_id: subcategory.category_id,
        _method: "PUT",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("subcategories.update", subcategory.id), {
            onSuccess: () => {
                toast.success("Subkategori berhasil diperbarui");
            },
            onError: () => {
                toast.error("Gagal memperbarui subkategori");
            },
        });
    };

    return (
        <>
            <Head title="Edit Subkategori" />
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
                            Edit Subkategori
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Perbarui informasi subkategori
                        </p>
                    </div>
                </div>

                {/* Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Subkategori</CardTitle>
                        <CardDescription>
                            Perbarui detail subkategori "{subcategory.name}"
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="category_id">Kategori</Label>
                                <Select
                                    value={data.category_id?.toString()}
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
                                    <Label htmlFor="name">
                                        Nama Subkategori
                                    </Label>
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
                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button variant="outline" asChild>
                                    <Link href={route("subcategories.index")}>
                                        Batal
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing
                                        ? "Menyimpan..."
                                        : "Simpan Perubahan"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
