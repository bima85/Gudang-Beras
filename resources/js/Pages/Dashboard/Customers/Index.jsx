import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    IconCirclePlus,
    IconPencilCog,
    IconTrash,
    IconSearch,
} from "@tabler/icons-react";

export default function Index({ customers }) {
    const { errors } = usePage().props;
    const [filterField, setFilterField] = useState("name");
    const [filterValue, setFilterValue] = useState("");

    const filteredCustomers = customers.data.filter((customer) =>
        customer[filterField]
            ?.toString()
            .toLowerCase()
            .includes(filterValue.toLowerCase())
    );

    return (
        <>
            <Head title="Pelanggan" />
            <div className="space-y-4">
                {/* Header with Add Button */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            Data Pelanggan
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Kelola data pelanggan toko
                        </p>
                    </div>

                    <Button asChild className="w-full sm:w-auto">
                        <Link href={route("customers.create")}>
                            <IconCirclePlus className="w-4 h-4 mr-2" />
                            Tambah Pelanggan
                        </Link>
                    </Button>
                </div>

                {/* Search Filter */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <Select
                                value={filterField}
                                onValueChange={setFilterField}
                            >
                                <SelectTrigger className="w-full sm:w-48">
                                    <SelectValue placeholder="Pilih filter" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Nama</SelectItem>
                                    <SelectItem value="no_telp">
                                        No. Handphone
                                    </SelectItem>
                                    <SelectItem value="address">
                                        Alamat
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="relative flex-1">
                                <IconSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                                <Input
                                    type="text"
                                    value={filterValue}
                                    onChange={(e) =>
                                        setFilterValue(e.target.value)
                                    }
                                    placeholder={`Cari berdasarkan ${
                                        filterField === "name"
                                            ? "nama"
                                            : filterField === "no_telp"
                                            ? "no. handphone"
                                            : "alamat"
                                    }...`}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Daftar Pelanggan</span>
                            <span className="text-sm font-normal text-gray-500">
                                {filteredCustomers.length} dari{" "}
                                {customers.total} pelanggan
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredCustomers.length > 0 ? (
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">
                                                No
                                            </TableHead>
                                            <TableHead>Nama</TableHead>
                                            <TableHead>No. Handphone</TableHead>
                                            <TableHead>Alamat</TableHead>
                                            <TableHead className="w-32">
                                                Deposit
                                            </TableHead>
                                            <TableHead className="w-24 text-center">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers.map(
                                            (customer, i) => (
                                                <TableRow key={customer.id}>
                                                    <TableCell className="font-medium">
                                                        {++i +
                                                            (customers.current_page -
                                                                1) *
                                                                customers.per_page}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {customer.name}
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.no_telp}
                                                    </TableCell>
                                                    <TableCell>
                                                        {customer.address ||
                                                            "-"}
                                                    </TableCell>
                                                    <TableCell className="font-mono">
                                                        Rp{" "}
                                                        {parseFloat(
                                                            customer.deposit ||
                                                                0
                                                        ).toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        "customers.edit",
                                                                        customer.id
                                                                    )}
                                                                >
                                                                    <IconPencilCog className="w-4 h-4" />
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => {
                                                                    if (
                                                                        confirm(
                                                                            "Apakah Anda yakin ingin menghapus pelanggan ini?"
                                                                        )
                                                                    ) {
                                                                        router.delete(
                                                                            route(
                                                                                "customers.destroy",
                                                                                customer.id
                                                                            )
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <IconTrash className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-gray-800">
                                    <IconSearch className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                                    Tidak ada data
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {filterValue
                                        ? "Tidak ada pelanggan yang sesuai dengan pencarian."
                                        : "Belum ada data pelanggan."}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination - if needed, can be added later with Shadcn UI Pagination */}
                {customers.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="text-sm text-gray-500">
                            Halaman {customers.current_page} dari{" "}
                            {customers.last_page}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
