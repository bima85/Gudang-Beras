import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
} from "@tabler/icons-react";
import Search from "@/Components/Dashboard/Search";
import {
    Table,
    Card,
    Thead,
    Tbody,
    Th,
    Td,
    Empty,
} from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";

export default function Index({ warehouses }) {
    const { errors } = usePage().props;
    console.log(warehouses.data);
    return (
        <>
            <Head title="Warehouse" />
            <div className="mb-2">
                <div className="flex justify-between items-center gap-2">
                    <Button
                        type={"link"}
                        icon={<IconCirclePlus size={20} strokeWidth={1.5} />}
                        className={
                            "border bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:text-white dark:border-blue-700 dark:hover:bg-blue-800"
                        }
                        label={"Tambah Data Warehouse"}
                        href={route("dashboard.warehouses.create")}
                    />
                    <div className="w-full md:w-4/12">
                        <Search
                            url={route("dashboard.warehouses.index")}
                            placeholder="Cari data berdasarkan nama warehouse..."
                        />
                    </div>
                </div>
            </div>
            <Card
                title={
                    <span className="text-blue-800 font-bold text-lg">
                        Data Warehouse
                    </span>
                }
            >
                <Table>
                    <Thead>
                        <tr>
                            <Th className="w-10 text-blue-700 font-semibold">
                                No
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Kode Gudang
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                No.Telp
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Nama
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Lokasi
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Deskripsi
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Option
                            </Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {warehouses.data.length ? (
                            warehouses.data.map((warehouse, i) => (
                                <tr
                                    className="hover:bg-blue-50 dark:hover:bg-gray-900"
                                    key={i}
                                >
                                    <Td className="text-center text-blue-900 font-semibold">
                                        {++i +
                                            (warehouses.current_page - 1) *
                                                warehouses.per_page}
                                    </Td>
                                    <Td className="font-mono text-blue-700 font-bold">
                                        {warehouse.code}
                                    </Td>
                                    <Td className="text-gray-700">
                                        {warehouse.phone}
                                    </Td>
                                    <Td className="text-gray-900 font-semibold">
                                        {warehouse.name}
                                    </Td>
                                    <Td className="text-gray-700">
                                        {warehouse.address}
                                    </Td>
                                    <Td className="text-gray-600">
                                        {warehouse.description}
                                    </Td>
                                    <Td>
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
                                                    "dashboard.warehouses.edit",
                                                    warehouse.id
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
                                                    "dashboard.warehouses.destroy",
                                                    warehouse.id
                                                )}
                                            />
                                        </div>
                                    </Td>
                                </tr>
                            ))
                        ) : (
                            <Empty
                                colSpan={7}
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
                                            Data Warehouse
                                        </span>{" "}
                                        <span className="text-rose-500 underline underline-offset-2">
                                            tidak ditemukan.
                                        </span>
                                    </>
                                }
                            />
                        )}
                    </Tbody>
                </Table>
            </Card>
            {warehouses.last_page !== 1 && (
                <Pagination links={warehouses.links} />
            )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
