import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
    IconEyeBolt,
} from "@tabler/icons-react";
import Search from "@/Components/Dashboard/Search";
import * as Table from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";

export default function Index({ suppliers }) {
    const { roles, permissions, errors } = usePage().props;

    return (
        <>
            <Head title="Supplier" />
            <div className="mb-2">
                <div className="flex justify-between items-center gap-2">
                    <Button
                        type={"link"}
                        icon={<IconCirclePlus size={20} strokeWidth={1.5} />}
                        className={
                            "border bg-white text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200"
                        }
                        label={"Tambah Data Supplier"}
                        href={route("suppliers.create")}
                    />
                    <div className="w-full md:w-4/12">
                        <Search
                            url={route("suppliers.index")}
                            placeholder="Cari data berdasarkan nama supplier..."
                        />
                    </div>
                </div>
            </div>
            <Table.Card title={"Data Supplier"}>
                <Table.Table>
                    <Table.Thead>
                        <tr>
                            <Table.Th className="w-10">No</Table.Th>
                            <Table.Th className="w-40">Nama</Table.Th>
                            <Table.Th className="w-40">No. Handphone</Table.Th>
                            <Table.Th className="w-40">Alamat</Table.Th>
                            <Table.Th></Table.Th>
                        </tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {suppliers.length ? (
                            suppliers.map((supplier, i) => (
                                <tr
                                    className="hover:bg-gray-100 dark:hover:bg-gray-900"
                                    key={i}
                                >
                                    <Table.Td className="text-center">
                                        {i + 1}
                                    </Table.Td>
                                    <Table.Td>{supplier.name}</Table.Td>
                                    <Table.Td>{supplier.phone}</Table.Td>
                                    <Table.Td>{supplier.address}</Table.Td>
                                    <Table.Td>
                                        <div className="flex gap-2">
                                            <Button
                                                type={"edit"}
                                                icon={
                                                    <IconPencilCog
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                }
                                                className={
                                                    "border bg-orange-100 border-orange-300 text-orange-500 hover:bg-orange-200 dark:bg-orange-950 dark:border-orange-800 dark:text-gray-300  dark:hover:bg-orange-900"
                                                }
                                                href={route(
                                                    "suppliers.edit",
                                                    supplier.id
                                                )}
                                            />
                                            <Button
                                                type={"delete"}
                                                icon={
                                                    <IconTrash
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                }
                                                className={
                                                    "border bg-rose-100 border-rose-300 text-rose-500 hover:bg-rose-200 dark:bg-rose-950 dark:border-rose-800 dark:text-gray-300  dark:hover:bg-rose-900"
                                                }
                                                url={route(
                                                    "suppliers.destroy",
                                                    supplier.id
                                                )}
                                            />
                                            <Button
                                                type={"link"}
                                                icon={
                                                    <IconEyeBolt
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                }
                                                className={
                                                    "border bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:border-green-800 dark:text-gray-300 dark:hover:bg-green-900"
                                                }
                                                href={route(
                                                    "suppliers.show",
                                                    supplier.id
                                                )}
                                                label={"Detail"}
                                            />
                                        </div>
                                    </Table.Td>
                                </tr>
                            ))
                        ) : (
                            <Table.Empty
                                colSpan={5}
                                message={
                                    <>
                                        <div className="flex justify-center items-center text-center mb-2">
                                            <IconDatabaseOff
                                                size={24}
                                                strokeWidth={1.5}
                                                className="text-gray-500 dark:text-white"
                                            />
                                        </div>
                                        <span className="text-gray-500">
                                            Data supplier
                                        </span>{" "}
                                        <span className="text-rose-500 underline underline-offset-2">
                                            tidak ditemukan.
                                        </span>
                                    </>
                                }
                            />
                        )}
                    </Table.Tbody>
                </Table.Table>
            </Table.Card>
            {/* Pagination jika diperlukan */}
            {/* {suppliers.last_page !== 1 && (<Pagination links={suppliers.links} />)} */}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
