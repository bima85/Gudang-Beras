import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import Card from "@/Components/Dashboard/Card";
import Button from "@/Components/Dashboard/Button";
import { IconPencilPlus, IconUsersPlus } from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";
import toast from "react-hot-toast";
import InputSelect from "@/Components/Dashboard/InputSelect";

export default function Edit({ categories, product, subcategories, units }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing, recentlySuccessful, reset } =
        useForm({
            name: product.name || "",
            category_id: product.category_id || "",
            subcategory_id: product.subcategory_id || "",
            unit_id: product.unit_id || "",
            barcode: product.barcode || "",
            min_stock: product.min_stock || "",
            description: product.description || "",
            _method: "PUT",
        });

    const [selectedCategory, setSelectedCategory] = useState(
        product.category_id
            ? categories.find((c) => c.id === product.category_id)
            : null
    );
    const [selectedSubcategory, setSelectedSubcategory] = useState(
        product.subcategory_id
            ? subcategories.find((s) => s.id === product.subcategory_id)
            : null
    );
    const [selectedUnit, setSelectedUnit] = useState(
        product.unit_id ? units.find((u) => u.id === product.unit_id) : null
    );
    const [toastId, setToastId] = useState(null);

    useEffect(() => {
        if (product.category_id && categories.length) {
            setSelectedCategory(
                categories.find(
                    (category) => category.id === product.category_id
                ) || null
            );
        }
        if (product.subcategory_id && subcategories.length) {
            setSelectedSubcategory(
                subcategories.find(
                    (subcategory) => subcategory.id === product.subcategory_id
                ) || null
            );
        }
        if (product.unit_id && units.length) {
            setSelectedUnit(
                units.find((unit) => unit.id === product.unit_id) || null
            );
        }
    }, [
        product.category_id,
        product.subcategory_id,
        product.unit_id,
        categories,
        subcategories,
        units,
    ]);

    useEffect(() => {
        if (recentlySuccessful && !toastId) {
            const id = toast.success("Data berhasil diubah", {
                icon: "👏",
                style: {
                    borderRadius: "10px",
                    background: "#1C1F29",
                    color: "#fff",
                },
                autoClose: 3000,
            });
            setToastId(id);
        }
        return () => {
            if (toastId) {
                toast.dismiss(toastId);
                setToastId(null);
            }
        };
    }, [recentlySuccessful, toastId]);

    useEffect(() => {
        return () => {
            reset();
            router.reload({ only: ["errors"], onSuccess: () => {} });
        };
    }, []);

    const setSelectedCategoryHandler = (value) => {
        setSelectedCategory(value);
        setData("category_id", value ? value.id : "");
        setSelectedSubcategory(null);
        setData("subcategory_id", "");
    };

    const setSelectedSubcategoryHandler = (value) => {
        setSelectedSubcategory(value);
        setData("subcategory_id", value ? value.id : "");
    };

    const setSelectedUnitHandler = (value) => {
        setSelectedUnit(value);
        setData("unit_id", value ? value.id : "");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("products.update", product.id), {
            onError: () => {
                toast.error("Terjadi kesalahan dalam penyimpanan data", {
                    style: {
                        borderRadius: "10px",
                        background: "#FF0000",
                        color: "#fff",
                    },
                });
            },
        });
    };

    const handleBack = () => {
        reset();
        router.visit(route("products.index"), {
            preserveState: false,
            onSuccess: () => {
                router.reload({ only: ["errors"], onSuccess: () => {} });
            },
        });
    };

    return (
        <>
            <Head title="Ubah Data Produk" />
            <Card
                title="Ubah Data Produk"
                icon={<IconUsersPlus size={20} strokeWidth={1.5} />}
                footer={
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                            type="button"
                            label="Kembali"
                            className="border bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors px-3 py-1.5 sm:px-4 sm:py-2 rounded shadow w-full sm:w-auto"
                            onClick={handleBack}
                        />
                        <Button
                            type="submit"
                            label="Simpan Perubahan"
                            icon={
                                <IconPencilPlus size={20} strokeWidth={1.5} />
                            }
                            className="border bg-blue-600 text-white hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors px-3 py-1.5 sm:px-4 sm:py-2 rounded shadow w-full sm:w-auto"
                            processing={processing}
                            disabled={processing}
                            onClick={handleSubmit}
                        />
                    </div>
                }
            >
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        {/* Kategori & Subkategori */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            <InputSelect
                                label="Kategori"
                                data={categories}
                                selected={selectedCategory}
                                setSelected={setSelectedCategoryHandler}
                                placeholder="Pilih kategori"
                                error={errors.category_id}
                                displayKey="name"
                                className="w-full"
                            />
                            <InputSelect
                                label="Subkategori"
                                data={subcategories.filter(
                                    (sub) =>
                                        !selectedCategory ||
                                        sub.category_id === selectedCategory.id
                                )}
                                selected={selectedSubcategory}
                                setSelected={setSelectedSubcategoryHandler}
                                placeholder={
                                    selectedCategory
                                        ? "Pilih subkategori"
                                        : "Pilih kategori dulu"
                                }
                                error={errors.subcategory_id}
                                displayKey="name"
                                className="w-full"
                                disabled={!selectedCategory}
                            />
                        </div>

                        {/* Barcode & Nama */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                            <Input
                                type="text"
                                label="Kode Produk/Barcode"
                                value={data.barcode}
                                onChange={(e) =>
                                    setData("barcode", e.target.value)
                                }
                                error={errors.barcode}
                                placeholder="Barcode"
                            />
                            <Input
                                type="text"
                                label="Nama"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                                placeholder="Nama produk"
                            />
                        </div>

                        {/* Satuan */}
                        <InputSelect
                            label="Satuan"
                            data={units}
                            selected={selectedUnit}
                            setSelected={setSelectedUnitHandler}
                            placeholder="Pilih satuan"
                            error={errors.unit_id}
                            displayKey="name"
                            className="w-full col-span-2 sm:col-span-1"
                        />

                        {/* Stok Minimal */}
                        <Input
                            type="number"
                            label="Stok Minimal"
                            value={data.min_stock}
                            onChange={(e) =>
                                setData("min_stock", e.target.value)
                            }
                            error={errors.min_stock}
                            placeholder="Stok minimal"
                            className="col-span-2 sm:col-span-1"
                        />

                        {/* Deskripsi */}
                        <div className="col-span-2">
                            <Input
                                type="text"
                                label="Deskripsi"
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                error={errors.description}
                                placeholder="Deskripsi produk"
                            />
                        </div>
                    </div>

                    {errors && Object.keys(errors).length > 0 && (
                        <div className="mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                            <ul className="list-disc pl-5">
                                {Object.entries(errors).map(([field, msg]) => (
                                    <li key={field}>{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>
            </Card>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
