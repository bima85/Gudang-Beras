import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { ArrowLeft, Edit, Calendar, Hash, FileText, Tag } from "lucide-react";

export default function Show({ subcategory }) {
    return (
        <>
            <Head title={`Detail Subkategori - ${subcategory.name}`} />
            <div className="container mx-auto p-4 max-w-3xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route("subcategories.index")}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Detail Subkategori
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Informasi lengkap subkategori
                            </p>
                        </div>
                    </div>
                    <Button asChild>
                        <Link
                            href={route("subcategories.edit", subcategory.id)}
                        >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Subkategori
                        </Link>
                    </Button>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Dasar
                            </CardTitle>
                            <CardDescription>
                                Detail informasi subkategori
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Hash className="h-4 w-4" />
                                    Kode Subkategori
                                </div>
                                <div className="font-mono text-lg font-semibold bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                                    {subcategory.code}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Tag className="h-4 w-4" />
                                    Nama Subkategori
                                </div>
                                <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {subcategory.name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="h-4 w-4" />
                                    Tanggal Dibuat
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                    {new Date(
                                        subcategory.created_at
                                    ).toLocaleDateString("id-ID", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Category & Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Tag className="h-5 w-5" />
                                Kategori & Deskripsi
                            </CardTitle>
                            <CardDescription>
                                Kategori induk dan deskripsi subkategori
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Kategori Induk
                                </div>
                                <div>
                                    {subcategory.category?.name ? (
                                        <Badge
                                            variant="secondary"
                                            className="text-base px-3 py-1"
                                        >
                                            {subcategory.category.name}
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-base px-3 py-1"
                                        >
                                            Tanpa Kategori
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Deskripsi
                                </div>
                                <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                                    {subcategory.description || (
                                        <span className="italic text-gray-500 dark:text-gray-400">
                                            Tidak ada deskripsi
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Information */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Informasi Tambahan</CardTitle>
                        <CardDescription>
                            Metadata dan informasi sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <div className="font-medium text-gray-600 dark:text-gray-400">
                                    ID Subkategori
                                </div>
                                <div className="font-mono text-gray-900 dark:text-white">
                                    {subcategory.id}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="font-medium text-gray-600 dark:text-gray-400">
                                    Terakhir Diperbarui
                                </div>
                                <div className="text-gray-700 dark:text-gray-300">
                                    {new Date(
                                        subcategory.updated_at
                                    ).toLocaleDateString("id-ID", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Show.layout = (page) => <DashboardLayout children={page} />;
