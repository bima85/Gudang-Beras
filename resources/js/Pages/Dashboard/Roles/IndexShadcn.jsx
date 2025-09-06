import React, { useState } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import {
    IconDatabaseOff,
    IconPlus,
    IconTrash,
    IconUserShield,
    IconEdit,
    IconSearch,
} from "@tabler/icons-react";
import DashboardLayout from "@/Layouts/DashboardLayout";

// Shadcn UI Components
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Checkbox } from "@/Components/ui/checkbox";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import { toast } from "sonner";
import Pagination from "@/Components/Dashboard/Pagination";
import Search from "@/Components/Dashboard/Search";

export default function Index() {
    const { roles, permissions, errors } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {
        data,
        setData,
        post,
        put,
        delete: destroy,
        processing,
        reset,
    } = useForm({
        id: "",
        name: "",
        selectedPermissions: [],
        isUpdate: false,
    });

    // Filter roles based on search
    const filteredRoles = roles.data.filter((role) =>
        role.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openCreateDialog = () => {
        reset();
        setData({
            id: "",
            name: "",
            selectedPermissions: [],
            isUpdate: false,
        });
        setIsDialogOpen(true);
    };

    const openEditDialog = (role) => {
        setData({
            id: role.id,
            name: role.name,
            selectedPermissions: role.permissions.map((p) => p.id),
            isUpdate: true,
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log("Form data:", data);
        console.log("Role ID:", data.id);
        console.log("Is Update:", data.isUpdate);

        // Build payload object with correct key name expected by server
        const submitPayload = {
            name: data.name,
            selectedPermission: data.selectedPermissions,
        };

        console.log("Submit payload:", submitPayload);

        if (data.isUpdate) {
            // For update, send a plain object so validation sees 'selectedPermission'
            router.put(route("roles.update", data.id), submitPayload, {
                onSuccess: () => {
                    toast.success("Role berhasil diupdate!");
                    closeDialog();
                },
                onError: (errors) => {
                    console.log("Update errors:", errors);
                    if (errors.name) {
                        toast.error(`Error: ${errors.name[0]}`);
                    } else if (errors.selectedPermission) {
                        toast.error(`Error: ${errors.selectedPermission[0]}`);
                    } else {
                        toast.error("Terjadi kesalahan saat update!");
                    }
                },
            });
        } else {
            // For create, use normal POST with same payload key
            router.post(route("roles.store"), submitPayload, {
                onSuccess: () => {
                    toast.success("Role berhasil dibuat!");
                    closeDialog();
                },
                onError: (errors) => {
                    console.log("Create errors:", errors);
                    if (errors.name) {
                        toast.error(`Error: ${errors.name[0]}`);
                    } else if (errors.selectedPermission) {
                        toast.error(`Error: ${errors.selectedPermission[0]}`);
                    } else {
                        toast.error("Terjadi kesalahan saat membuat role!");
                    }
                },
            });
        }
    };

    const handlePermissionChange = (permissionId, checked) => {
        if (checked) {
            setData("selectedPermissions", [
                ...data.selectedPermissions,
                permissionId,
            ]);
        } else {
            setData(
                "selectedPermissions",
                data.selectedPermissions.filter((id) => id !== permissionId)
            );
        }
    };

    const deleteRole = (roleId) => {
        if (confirm("Apakah Anda yakin ingin menghapus role ini?")) {
            destroy(route("roles.destroy", roleId), {
                onSuccess: () => {
                    toast.success("Role berhasil dihapus!");
                },
                onError: (errors) => {
                    console.log("Delete errors:", errors);
                    toast.error("Gagal menghapus role!");
                },
            });
        }
    };

    return (
        <>
            <Head title="Manajemen Role" />

            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Manajemen Role
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola role dan permission pengguna sistem
                        </p>
                    </div>
                    <Button onClick={openCreateDialog} className="md:w-auto">
                        <IconPlus className="w-4 h-4 mr-2" />
                        Tambah Role
                    </Button>
                </div>

                {/* Search Section */}
                <Search
                    value={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Cari role berdasarkan nama..."
                />

                {/* Table Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconUserShield className="w-5 h-5" />
                            Daftar Role
                        </CardTitle>
                        <CardDescription>
                            Total {roles.total} role terdaftar dalam sistem
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {filteredRoles.length > 0 ? (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[100px]">
                                                No
                                            </TableHead>
                                            <TableHead>Nama Role</TableHead>
                                            <TableHead>Permissions</TableHead>
                                            <TableHead className="text-right">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredRoles.map((role, index) => (
                                            <TableRow key={role.id}>
                                                <TableCell className="font-medium">
                                                    {index +
                                                        1 +
                                                        (roles.current_page -
                                                            1) *
                                                            roles.per_page}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">
                                                        {role.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {role.permissions.map(
                                                            (permission) => (
                                                                <Badge
                                                                    key={
                                                                        permission.id
                                                                    }
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                openEditDialog(
                                                                    role
                                                                )
                                                            }
                                                        >
                                                            <IconEdit className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                deleteRole(
                                                                    role.id
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <IconTrash className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <IconDatabaseOff className="w-12 h-12 mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium">
                                    Tidak ada role ditemukan
                                </h3>
                                <p className="mb-4 text-muted-foreground">
                                    {searchTerm
                                        ? "Coba ubah kata kunci pencarian Anda"
                                        : "Mulai dengan membuat role pertama"}
                                </p>
                                {!searchTerm && (
                                    <Button onClick={openCreateDialog}>
                                        <IconPlus className="w-4 h-4 mr-2" />
                                        Tambah Role
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {roles.data.length > 0 && <Pagination links={roles.links} />}

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <IconUserShield className="w-5 h-5" />
                                {data.isUpdate
                                    ? "Edit Role"
                                    : "Tambah Role Baru"}
                            </DialogTitle>
                            <DialogDescription>
                                {data.isUpdate
                                    ? "Ubah informasi role dan permissions yang diperlukan"
                                    : "Buat role baru dengan mengisi informasi dan memilih permissions"}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Role</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    placeholder="Masukkan nama role"
                                    className={
                                        errors.name ? "border-red-500" : ""
                                    }
                                />
                                {errors.name && (
                                    <Alert variant="destructive">
                                        <AlertDescription>
                                            {errors.name}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label>Permissions</Label>
                                <Card>
                                    <CardContent className="pt-4">
                                        <ScrollArea className="h-64">
                                            <div className="space-y-3">
                                                {permissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-2"
                                                        >
                                                            <Checkbox
                                                                id={`permission-${permission.id}`}
                                                                checked={data.selectedPermissions.includes(
                                                                    permission.id
                                                                )}
                                                                onCheckedChange={(
                                                                    checked
                                                                ) =>
                                                                    handlePermissionChange(
                                                                        permission.id,
                                                                        checked
                                                                    )
                                                                }
                                                            />
                                                            <Label
                                                                htmlFor={`permission-${permission.id}`}
                                                                className="text-sm font-normal cursor-pointer"
                                                            >
                                                                {
                                                                    permission.name
                                                                }
                                                            </Label>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </ScrollArea>
                                        {errors.selectedPermission && (
                                            <Alert
                                                variant="destructive"
                                                className="mt-3"
                                            >
                                                <AlertDescription>
                                                    {errors.selectedPermission}
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={closeDialog}
                                >
                                    Batal
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing
                                        ? "Menyimpan..."
                                        : data.isUpdate
                                        ? "Update"
                                        : "Simpan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
