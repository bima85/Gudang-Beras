import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { toast } from "react-toastify";
import {
    Save,
    ArrowLeft,
    Building,
    MapPin,
    Phone,
    FileText,
} from "lucide-react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        address: "",
        phone: "",
        description: "",
    });

    function handleSubmit(e) {
        e.preventDefault();
        post(route("tokos.store"), {
            onSuccess: () => {
                toast.success("Toko berhasil ditambahkan");
            },
            onError: () => {
                toast.error("Gagal menambahkan toko");
            },
        });
    }

    return (
        <DashboardLayout>
            <Head title="Tambah Toko" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route("tokos.index")}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Tambah Toko
                        </h1>
                        <p className="text-muted-foreground">
                            Isi form di bawah untuk menambahkan toko baru
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building className="h-5 w-5" />
                                Informasi Toko
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="required">
                                        Nama Toko
                                    </Label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            className="pl-10"
                                            placeholder="Masukkan nama toko"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-sm text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="address">Alamat</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="address"
                                            className="pl-10 resize-none"
                                            placeholder="Masukkan alamat toko"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    "address",
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>
                                    {errors.address && (
                                        <p className="text-sm text-destructive">
                                            {errors.address}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telepon</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            className="pl-10"
                                            placeholder="Masukkan nomor telepon"
                                            value={data.phone}
                                            onChange={(e) =>
                                                setData("phone", e.target.value)
                                            }
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-sm text-destructive">
                                            {errors.phone}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Deskripsi
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="description"
                                            className="pl-10 resize-none"
                                            placeholder="Masukkan deskripsi toko (opsional)"
                                            value={data.description}
                                            onChange={(e) =>
                                                setData(
                                                    "description",
                                                    e.target.value
                                                )
                                            }
                                            rows={3}
                                        />
                                    </div>
                                    {errors.description && (
                                        <p className="text-sm text-destructive">
                                            {errors.description}
                                        </p>
                                    )}
                                </div>

                                <div className="flex justify-end gap-4 pt-4">
                                    <Link href={route("tokos.index")}>
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? "Menyimpan..." : "Simpan"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
