import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { toast } from "react-toastify";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Building,
    MapPin,
    Phone,
    FileText,
    Calendar,
} from "lucide-react";

export default function Show({ toko }) {
    const handleDelete = () => {
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

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <DashboardLayout>
            <Head title={`Detail Toko - ${toko.name}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route("tokos.index")}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                Detail Toko
                            </h1>
                            <p className="text-muted-foreground">
                                Informasi lengkap toko
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route("tokos.edit", toko.id)}>
                            <Button variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Hapus
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Informasi Dasar
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    ID Toko
                                </div>
                                <Badge variant="outline">#{toko.id}</Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Nama Toko
                                </div>
                                <div className="text-lg font-semibold">
                                    {toko.name}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    Alamat
                                </div>
                                <div className="text-sm">
                                    {toko.address || (
                                        <span className="text-muted-foreground italic">
                                            Alamat tidak tersedia
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Telepon
                                </div>
                                <div className="text-sm">
                                    {toko.phone || (
                                        <span className="text-muted-foreground italic">
                                            Telepon tidak tersedia
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Tambahan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">
                                    Deskripsi
                                </div>
                                <div className="text-sm">
                                    {toko.description || (
                                        <span className="text-muted-foreground italic">
                                            Tidak ada deskripsi
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Tanggal Dibuat
                                </div>
                                <div className="text-sm">
                                    {formatDate(toko.created_at)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Terakhir Diperbarui
                                </div>
                                <div className="text-sm">
                                    {formatDate(toko.updated_at)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Aksi Cepat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Link href={route("tokos.edit", toko.id)}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit Toko
                                </Button>
                            </Link>
                            <Link href={route("tokos.index")}>
                                <Button variant="outline">
                                    <Building className="h-4 w-4 mr-2" />
                                    Lihat Semua Toko
                                </Button>
                            </Link>
                            {/* Add more quick actions here if needed */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
