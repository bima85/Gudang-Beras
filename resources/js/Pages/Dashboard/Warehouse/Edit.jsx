import React from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import PhoneInput from "@/Components/ui/phone-input";
import { toast } from "react-toastify";
import {
    Save,
    ArrowLeft,
    Warehouse,
    MapPin,
    FileText,
    Hash,
} from "lucide-react";

export default function Edit({ warehouse }) {
    const { data, setData, put, processing, errors } = useForm({
        name: warehouse.name || "",
        code: warehouse.code || "",
        phone: warehouse.phone || "",
        address: warehouse.address || "",
        description: warehouse.description || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("dashboard.warehouses.update", warehouse.id), {
            onSuccess: () => {
                toast.success("Gudang berhasil diperbarui");
            },
            onError: () => {
                toast.error("Gagal memperbarui gudang");
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Edit Gudang" />

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route("dashboard.warehouses.index")}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Edit Gudang
                        </h1>
                        <p className="text-muted-foreground">
                            Perbarui informasi gudang
                        </p>
                    </div>
                </div>

                <div className="max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Warehouse className="h-5 w-5" />
                                Informasi Gudang
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="required">
                                        Kode Gudang
                                    </Label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="code"
                                            type="text"
                                            className="pl-10"
                                            placeholder="Masukkan kode gudang"
                                            value={data.code}
                                            onChange={(e) =>
                                                setData("code", e.target.value)
                                            }
                                            required
                                            disabled
                                        />
                                    </div>
                                    {errors.code && (
                                        <p className="text-sm text-destructive">
                                            {errors.code}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Kode gudang tidak dapat diubah
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name" className="required">
                                        Nama Gudang
                                    </Label>
                                    <div className="relative">
                                        <Warehouse className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="name"
                                            type="text"
                                            className="pl-10"
                                            placeholder="Masukkan nama gudang"
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
                                            placeholder="Masukkan alamat gudang"
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

                                <PhoneInput
                                    id="phone"
                                    label="Telepon"
                                    value={data.phone}
                                    onChange={(value) =>
                                        setData("phone", value)
                                    }
                                    error={errors.phone}
                                    placeholder="Masukkan nomor telepon (hanya angka)"
                                />

                                <div className="space-y-2">
                                    <Label htmlFor="description">
                                        Deskripsi
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Textarea
                                            id="description"
                                            className="pl-10 resize-none"
                                            placeholder="Masukkan deskripsi gudang (opsional)"
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
                                    <Link
                                        href={route(
                                            "dashboard.warehouses.index"
                                        )}
                                    >
                                        <Button type="button" variant="outline">
                                            Batal
                                        </Button>
                                    </Link>
                                    <Button type="submit" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing
                                            ? "Memperbarui..."
                                            : "Perbarui"}
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
