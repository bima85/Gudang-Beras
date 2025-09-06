import DashboardLayout from "@/Layouts/DashboardLayout";
import React, { useEffect, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    IconDatabaseOff,
    IconCirclePlus,
    IconTrash,
    IconPencilCog,
    IconUsers,
    IconSearch,
} from "@tabler/icons-react";
import Swal from "sweetalert2";
export default function Index() {
    // destruct users from props
    const { users } = usePage().props;
    const [search, setSearch] = useState("");

    const {
        data,
        setData,
        delete: destroy,
        reset,
    } = useForm({
        selectedUser: [],
    });

    // method selected user
    const setSelectedUser = (userId, checked) => {
        let items = [...data.selectedUser];

        if (checked) {
            if (!items.includes(userId)) {
                items.push(userId);
            }
        } else {
            items = items.filter((id) => id !== userId);
        }

        setData("selectedUser", items);
    };

    // method select all users
    const setSelectAllUsers = (checked) => {
        if (checked) {
            const allUserIds = users.data.map((user) => user.id.toString());
            setData("selectedUser", allUserIds);
        } else {
            setData("selectedUser", []);
        }
    };

    // method bulk delete
    const deleteData = async (id) => {
        Swal.fire({
            title: "Apakah kamu yakin ingin menghapus data ini ?",
            text: "Data yang dihapus tidak dapat dikembalikan!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, tolong hapus!",
            cancelButtonText: "Tidak",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route("users.destroy", [id]));

                Swal.fire({
                    title: "Success!",
                    text: "Data berhasil dihapus!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });

                setData("selectedUser", []);
            }
        });
    };

    // Handle search
    const handleSearch = () => {
        window.location.href = route("users.index", { search });
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <DashboardLayout>
            <Head title="Pengguna" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Data Pengguna
                        </h1>
                        <p className="mt-1 text-gray-600">
                            Kelola pengguna dan hak akses sistem
                        </p>
                    </div>
                </div>

                {/* Actions & Search */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex gap-2">
                        <Button asChild>
                            <a href={route("users.create")}>
                                <IconCirclePlus className="w-4 h-4 mr-2" />
                                Tambah Pengguna
                            </a>
                        </Button>

                        {data.selectedUser.length > 0 && (
                            <Button
                                variant="destructive"
                                onClick={() => deleteData(data.selectedUser)}
                            >
                                <IconTrash className="w-4 h-4 mr-2" />
                                Hapus {data.selectedUser.length} data
                            </Button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <IconSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <Input
                            placeholder="Cari berdasarkan nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="pl-10"
                        />
                        <Button
                            size="sm"
                            onClick={handleSearch}
                            className="absolute transform -translate-y-1/2 right-1 top-1/2"
                        >
                            Cari
                        </Button>
                    </div>
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <IconUsers className="w-5 h-5" />
                            Daftar Pengguna ({users.data?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.data?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-10">
                                                <Checkbox
                                                    checked={
                                                        users.data.length > 0 &&
                                                        data.selectedUser
                                                            .length ===
                                                            users.data.length
                                                    }
                                                    onCheckedChange={
                                                        setSelectAllUsers
                                                    }
                                                />
                                            </TableHead>
                                            <TableHead className="w-16">
                                                No
                                            </TableHead>
                                            <TableHead>Nama Pengguna</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Grup Akses</TableHead>
                                            <TableHead className="w-24">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user, index) => (
                                            <TableRow key={user.id}>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={data.selectedUser.includes(
                                                            user.id.toString()
                                                        )}
                                                        onCheckedChange={(
                                                            checked
                                                        ) =>
                                                            setSelectedUser(
                                                                user.id.toString(),
                                                                checked
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {index +
                                                        1 +
                                                        (users.current_page -
                                                            1) *
                                                            users.per_page}
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {user.name}
                                                </TableCell>
                                                <TableCell>
                                                    {user.email}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles?.map(
                                                            (
                                                                role,
                                                                roleIndex
                                                            ) => (
                                                                <Badge
                                                                    key={
                                                                        roleIndex
                                                                    }
                                                                    variant="secondary"
                                                                    className="text-xs"
                                                                >
                                                                    {role.name}
                                                                </Badge>
                                                            )
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            asChild
                                                        >
                                                            <a
                                                                href={route(
                                                                    "users.edit",
                                                                    user.id
                                                                )}
                                                            >
                                                                <IconPencilCog className="w-4 h-4" />
                                                            </a>
                                                        </Button>

                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() =>
                                                                deleteData(
                                                                    user.id
                                                                )
                                                            }
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
                            <div className="py-12 text-center">
                                <IconDatabaseOff className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    Belum Ada Data Pengguna
                                </h3>
                                <p className="mb-4 text-gray-500">
                                    Mulai dengan menambahkan pengguna pertama
                                </p>
                                <Button asChild>
                                    <a href={route("users.create")}>
                                        <IconCirclePlus className="w-4 h-4 mr-2" />
                                        Tambah Pengguna
                                    </a>
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {users.links && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {users.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        link.url &&
                                        (window.location.href = link.url)
                                    }
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
