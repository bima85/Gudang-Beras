import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Card from "@/Components/Dashboard/Card";
import Button from "@/Components/Dashboard/Button";
import { IconPencilPlus, IconUsersPlus } from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";
import toast from "react-hot-toast";
import InputSelect from "@/Components/Dashboard/InputSelect";

export default function Create({ categories, units, subcategories }) {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        name: "",
        category_id: "",
        subcategory_id: "",
        unit_id: "",
        barcode: "",
        image: "",
        min_stock: "",
        description: "",
    });

    const [barcodeTouched, setBarcodeTouched] = useState(false);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filteredSubcategories, setFilteredSubcategories] = useState([]);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);

    // (dihapus, dipindahkan ke dalam fungsi komponen)

    // Filter subkategori sesuai kategori yang dipilih
    useEffect(() => {
        if (selectedCategory) {
            const filtered = subcategories.filter(
                (sub) => sub.category_id === selectedCategory.id
            );
            setFilteredSubcategories(filtered);
            setSelectedSubcategory(null);
            setData("subcategory_id", "");
        } else {
            setFilteredSubcategories([]);
            setSelectedSubcategory(null);
            setData("subcategory_id", "");
        }
    }, [selectedCategory, subcategories]);

    // Auto-generate barcode when category, subcategory, or product name changes
    useEffect(() => {
        if (barcodeTouched) return;

        if (selectedCategory && selectedSubcategory) {
            const getCode = (item) => {
                if (!item) return "";
                if (item.code && String(item.code).trim().length > 0)
                    return String(item.code).toUpperCase();

                const name = String(item.name || "").trim();
                if (name.length === 0) return "";

                if (!/\s+/.test(name)) {
                    const alnum = name.replace(/[^a-z0-9]/gi, "");
                    return alnum.toUpperCase().slice(0, 3);
                }

                return name
                    .split(/\s+/)
                    .map((w) => w.charAt(0))
                    .join("")
                    .toUpperCase()
                    .slice(0, 3);
            };

            const sanitizeProductName = (n) => {
                if (!n) return "";
                // remove non-alphanum, collapse spaces, capitalize first letters
                const cleaned = String(n)
                    .replace(/[^a-z0-9\s]/gi, " ")
                    .replace(/\s+/g, " ")
                    .trim();
                if (cleaned.length === 0) return "";
                // join words without spaces, capitalize first letter of each word
                return cleaned
                    .split(/\s+/)
                    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)))
                    .join("");
            };

            const catCode = getCode(selectedCategory);
            const subCode = getCode(selectedSubcategory);
            const namePart = sanitizeProductName(data.name).replace(/\s+/g, "");

            const generated = `${catCode}${subCode}${namePart}`;
            setData("barcode", generated);
        }
    }, [selectedCategory, selectedSubcategory, data.name, barcodeTouched, setData]);

    const setSelectedCategoryHandler = (value) => {
        setSelectedCategory(value);
        setData("category_id", value ? Number(value.id) : "");
    };

    const setSelectedSubcategoryHandler = (value) => {
        setSelectedSubcategory(value);
        setData("subcategory_id", value ? Number(value.id) : "");
    };

    // Track manual edits to barcode so auto-generation won't override
    const handleBarcodeChange = (val) => {
        setBarcodeTouched(true);
        setData("barcode", val);
    };

    const submit = (e) => {
        e.preventDefault();

        if (!data.category_id) {
            toast("Kategori wajib dipilih!", {
                icon: "⚠️",
                style: {
                    borderRadius: "10px",
                    background: "#FF0000",
                    color: "#fff",
                },
            });
            return;
        }

        if (!data.subcategory_id) {
            toast("Subkategori wajib dipilih!", {
                icon: "⚠️",
                style: {
                    borderRadius: "10px",
                    background: "#FF0000",
                    color: "#fff",
                },
            });
            return;
        }

        post(route("products.store"), data, {
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
            onError: () => {
                toast("Terjadi kesalahan dalam penyimpanan data", {
                    style: {
                        borderRadius: "10px",
                        background: "#FF0000",
                        color: "#fff",
                    },
                });
            },
        });
    };

    return (
        <>
            <Head title="Tambah Data Produk" />
            <Card
                title="Tambah Data Produk"
                icon={<IconUsersPlus size={20} strokeWidth={1.5} />}
                footer={
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            label="Kembali"
                            className="border bg-gray-300 text-gray-800 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors px-4 py-2 rounded shadow"
                            onClick={() => window.history.back()}
                        />
                        <Button
                            type="submit"
                            label="Simpan"
                            icon={
                                <IconPencilPlus size={20} strokeWidth={1.5} />
                            }
                            className="border bg-blue-600 text-white hover:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors px-4 py-2 rounded shadow"
                            processing={!!processing}
                            disabled={processing}
                            onClick={submit}
                        />
                    </div>
                }
                form={submit}
            >
                <div className="grid grid-cols-12 gap-6 md:gap-4">
                    {/* Kategori & Subkategori */}
                    <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
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
                            data={filteredSubcategories}
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
                        />
                    </div>

                    {/* Barcode & Nama */}
                    <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
                        <Input
                            type="text"
                            label="Kode Produk/Barcode"
                            value={data.barcode}
                            onChange={(e) => handleBarcodeChange(e.target.value)}
                            error={errors.barcode}
                            placeholder="Barcode"
                        />
                        <Input
                            type="text"
                            label="Nama"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            error={errors.name}
                            placeholder="Nama produk"
                        />
                    </div>

                    {/* Satuan */}
                    <div className="col-span-12 md:col-span-6">
                        <InputSelect
                            label="Satuan"
                            data={units}
                            selected={
                                units.find((u) => u.id === data.unit_id) || null
                            }
                            setSelected={(unit) =>
                                setData("unit_id", unit ? unit.id : "")
                            }
                            placeholder="Pilih satuan"
                            error={errors.unit_id}
                            displayKey="name"
                        />
                    </div>

                    {/* Stok Minimal */}
                    <div className="col-span-12 md:col-span-6">
                        <Input
                            type="number"
                            label="Stok Minimal"
                            value={data.min_stock}
                            onChange={(e) =>
                                setData("min_stock", e.target.value)
                            }
                            error={errors.min_stock}
                            placeholder="Stok minimal"
                        />
                    </div>

                    {/* Deskripsi */}
                    <div className="col-span-12 md:col-span-6">
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
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                        <ul className="list-disc pl-5">
                            {Object.entries(errors).map(([field, msg]) => (
                                <li key={field}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </Card>
        </>
    );
}

Create.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
