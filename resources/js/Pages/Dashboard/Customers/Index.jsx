import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconEyeBolt,
    IconPencilCog,
    IconTrash,
} from "@tabler/icons-react";
import {
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Card,
    Empty,
} from "@/Components/Dashboard/Table";
import Pagination from "@/Components/Dashboard/Pagination";

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
            <div className="mb-2">
                <div className="flex justify-between items-center gap-2">
                    <Button
                        type="link"
                        icon={<IconCirclePlus size={20} strokeWidth={1.5} />}
                        className="border bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:text-white dark:border-blue-700 dark:hover:bg-blue-800"
                        label="Tambah Data Pelanggan"
                        href={route("customers.create")}
                    />
                    <div className="w-full md:w-4/12 flex gap-2">
                        <select
                            value={filterField}
                            onChange={(e) => setFilterField(e.target.value)}
                            className="w-1/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        >
                            <option value="name">Nama</option>
                            <option value="no_telp">No. Handphone</option>
                            <option value="address">Alamat</option>
                        </select>
                        <input
                            type="text"
                            value={filterValue}
                            onChange={(e) => setFilterValue(e.target.value)}
                            placeholder={`Cari berdasarkan ${
                                filterField === "name"
                                    ? "nama"
                                    : filterField === "no_telp"
                                    ? "no. handphone"
                                    : "alamat"
                            }...`}
                            className="w-2/3 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        />
                    </div>
                </div>
            </div>
            <Card
                title={
                    <span className="text-blue-800 font-bold text-lg">
                        Data Pelanggan
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
                                Nama
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                No. Handphone
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Alamat
                            </Th>
                            <Th className="text-blue-700 font-semibold">
                                Option
                            </Th>
                        </tr>
                    </Thead>
                    <Tbody>
                        {filteredCustomers.length ? (
                            filteredCustomers.map((customer, i) => (
                                <tr
                                    className="hover:bg-blue-50 dark:hover:bg-gray-900"
                                    key={i}
                                >
                                    <Td className="text-center text-blue-900 font-semibold">
                                        {++i +
                                            (customers.current_page - 1) *
                                                customers.per_page}
                                    </Td>
                                    <Td className="font-mono text-blue-700 font-bold">
                                        {customer.name}
                                    </Td>
                                    <Td className="text-gray-700">
                                        {customer.no_telp}
                                    </Td>
                                    <Td className="text-gray-900 font-semibold">
                                        {customer.address}
                                    </Td>
                                    <Td>
                                        <div className="flex gap-2">
                                            <Button
                                                type="edit"
                                                icon={
                                                    <IconPencilCog
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                }
                                                className="border bg-orange-100 border-orange-300 text-orange-500 hover:bg-orange-200 dark:bg-orange-950 dark:border-orange-800 dark:text-gray-300 dark:hover:bg-orange-900"
                                                href={route(
                                                    "customers.edit",
                                                    customer.id
                                                )}
                                            />
                                            <Button
                                                type="delete"
                                                icon={
                                                    <IconTrash
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                }
                                                className="border bg-rose-100 border-rose-300 text-rose-500 hover:bg-rose-200 dark:bg-rose-950 dark:border-rose-800 dark:text-gray-300 dark:hover:bg-rose-900"
                                                url={route(
                                                    "customers.destroy",
                                                    customer.id
                                                )}
                                            />
                                            <Button
                                                type="link"
                                                icon={
                                                    <IconEyeBolt
                                                        size={16}
                                                        strokeWidth={1.5}
                                                    />
                                                }
                                                className="border bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-950 dark:border-green-800 dark:text-gray-300 dark:hover:bg-green-900"
                                                href={route(
                                                    "customers.show",
                                                    customer.id
                                                )}
                                                label="Detail"
                                            />
                                        </div>
                                    </Td>
                                </tr>
                            ))
                        ) : (
                            <Empty
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
                                            Data pelanggan
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
            {customers.last_page !== 1 && (
                <Pagination links={customers.links} />
            )}
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;
