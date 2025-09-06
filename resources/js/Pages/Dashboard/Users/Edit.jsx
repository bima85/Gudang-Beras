import React, { useState } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    IconUsersPlus,
    IconPencilPlus,
    IconUserShield,
    IconArrowLeft,
    IconEdit,
} from "@tabler/icons-react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Checkbox } from "@/Components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import toast from "react-hot-toast";

export default function Edit() {
    // destruct props roles and user from use page
    const { roles, user } = usePage().props;

    // Initialize permissions state based on user's existing permissions
    const [purchasesAccess, setPurchasesAccess] = useState(
        user.permissions?.some(
            (permission) => permission.name === "purchases-access"
        ) || false
    );
    const [transactionsAccess, setTransactionsAccess] = useState(
        user.permissions?.some(
            (permission) => permission.name === "transactions-access"
        ) || false
    );

    const { data, setData, post, errors } = useForm({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        selectedRoles: user.roles.map((role) => role.name),
        _method: "PUT",
    });

    const setSelectedRoles = (e) => {
        // Copy array to avoid mutating Inertia form state directly
        let items = Array.isArray(data.selectedRoles)
            ? [...data.selectedRoles]
            : [];

        if (items.some((name) => name === e.target.value)) {
            items = items.filter((name) => name !== e.target.value);
        } else {
            items.push(e.target.value);
        }

        setData("selectedRoles", items);
    };

    const updateUser = async (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            purchasesAccess: purchasesAccess,
            transactionsAccess: transactionsAccess,
        };

        post(route("users.update", user.id), {
            data: payload,
            onSuccess: () => {
                toast("Data berhasil disimpan", {
                    icon: "👏",
                    style: {
                        borderRadius: "10px",
                        background: "#1C1F29",
                        color: "#fff",
                    },
                });
            },
            onError: (errors) => {
                console.error("Gagal update user:", errors);
                toast(
                    "Gagal menyimpan data!\n" +
                        Object.values(errors).join("\n"),
                    {
                        icon: "❌",
                        style: {
                            borderRadius: "10px",
                            background: "#B91C1C",
                            color: "#fff",
                        },
                    }
                );
            },
        });
    };

    return (
        <DashboardLayout>
            <Head title="Ubah Data Pengguna" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <a href={route("users.index")}>
                                <IconArrowLeft className="w-4 h-4 mr-2" />
                                Kembali
                            </a>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Ubah Data Pengguna
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Perbarui informasi pengguna dan hak akses
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={updateUser} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconEdit className="w-5 h-5" />
                                Informasi Pengguna
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama Pengguna</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="Masukkan nama pengguna"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className={
                                            errors.name ? "border-red-500" : ""
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-500">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">
                                        Email Pengguna
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Email pengguna"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className={
                                            errors.email ? "border-red-500" : ""
                                        }
                                        disabled
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500">
                                            {errors.email}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500">
                                        Email tidak dapat diubah
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="password">
                                        Kata Sandi Baru (Opsional)
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Kosongkan jika tidak ingin mengubah"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        className={
                                            errors.password
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500">
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password_confirmation">
                                        Konfirmasi Kata Sandi Baru
                                    </Label>
                                    <Input
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Konfirmasi kata sandi baru"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                "password_confirmation",
                                                e.target.value
                                            )
                                        }
                                        className={
                                            errors.password_confirmation
                                                ? "border-red-500"
                                                : ""
                                        }
                                    />
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-500">
                                            {errors.password_confirmation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <IconUserShield className="w-5 h-5" />
                                Akses Group & Permissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Roles */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">
                                    Grup Akses (Roles)
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {roles.map((role, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center space-x-2"
                                        >
                                            <Checkbox
                                                id={`role-${role.name}`}
                                                value={role.name}
                                                checked={data.selectedRoles.includes(
                                                    role.name
                                                )}
                                                onCheckedChange={(checked) => {
                                                    const e = {
                                                        target: {
                                                            value: role.name,
                                                            checked: checked,
                                                        },
                                                    };
                                                    setSelectedRoles(e);
                                                }}
                                            />
                                            <Label
                                                htmlFor={`role-${role.name}`}
                                                className="text-sm font-normal capitalize cursor-pointer"
                                            >
                                                {role.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Permissions */}
                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-base font-medium">
                                    Permission Tambahan
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="purchases-access"
                                            checked={purchasesAccess}
                                            onCheckedChange={setPurchasesAccess}
                                        />
                                        <Label
                                            htmlFor="purchases-access"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            Akses Pembelian (purchases-access)
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="transactions-access"
                                            checked={transactionsAccess}
                                            onCheckedChange={
                                                setTransactionsAccess
                                            }
                                        />
                                        <Label
                                            htmlFor="transactions-access"
                                            className="text-sm font-normal cursor-pointer"
                                        >
                                            Akses Transaksi
                                            (transactions-access)
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            {errors.selectedRoles && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        {errors.selectedRoles}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" asChild>
                            <a href={route("users.index")}>Batal</a>
                        </Button>

                        <Button type="submit">
                            <IconPencilPlus className="w-4 h-4 mr-2" />
                            Perbarui Pengguna
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}
