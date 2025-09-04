import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import { IconBuildingWarehouse } from "@tabler/icons-react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        code: "",
        phone: "",
        address: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("dashboard.warehouses.store"));
    };

    return (
        <>
            <Head title="Tambah Warehouse" />
            <div className="max-w-2xl mx-auto p-4 sm:p-6 mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md sm:shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 mb-5 sm:mb-6">
                    <div className="bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded-full">
                        <IconBuildingWarehouse
                            size={28}
                            className="text-blue-600 dark:text-blue-400"
                        />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">
                        Tambah Gudang
                    </h1>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 sm:space-y-5"
                >
                    <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Kode Gudang
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                            required
                        />
                        {errors.code && (
                            <div className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.code}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Nama Warehouse
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            required
                        />
                        {errors.name && (
                            <div className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.name}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            No. Telp
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                            value={data.phone}
                            onChange={(e) => setData("phone", e.target.value)}
                        />
                        {errors.phone && (
                            <div className="text-red-500 text-xs sm:text-sm mt-1">
                                {errors.phone}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Lokasi
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                            Deskripsi
                        </label>
                        <textarea
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-colors resize-y min-h-[100px]"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-4">
                        <Button
                            type="submit"
                            label="Simpan"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow transition-colors w-full sm:w-auto"
                            disabled={processing}
                        />
                        <Button
                            type="button"
                            label="Kembali"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow transition-colors w-full sm:w-auto"
                            onClick={() => window.history.back()}
                        />
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
