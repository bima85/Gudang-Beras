import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Button from "@/Components/Dashboard/Button";

export default function Create({
    products,
    units,
    categories = [],
    warehouses = [],
}) {
    const { errors } = usePage().props;
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedUnit, setSelectedUnit] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [errorMessage, setErrorMessage] = useState(""); // Menambahkan state errorMessage
    const { data, setData, post, processing } = useForm({
        product_id: "",
        stok_awal: "",
        category_id: "",
        warehouse_id: "",
        date: "",
    });
    // Debugging: Log props untuk memeriksa data dari backend
    console.log("Debug - Props:", { products, units, categories, warehouses });
    console.log("Debug - Form Data:", data);
    console.log("Debug - Selected Unit:", selectedUnit);
    // Dropdown satuan dari database
    const satuanOptions = useMemo(
        () => [
            { label: "---Pilih Satuan---", value: "" },
            ...units.map((u) => ({
                label: u.name
                    ? u.name +
                      (u.qty > 1
                          ? ` (${u.qty} x ${u.multiplier || 1}kg)`
                          : ` (${u.multiplier || 1}kg)`)
                    : "Satuan Tidak Diketahui",
                value: u.id || "",
                multiplier: u.multiplier || 1,
                qty: u.qty || 1,
                name: u.name || "",
            })),
        ],
        [units]
    );

    // Cari unit berdasarkan nama
    const getUnit = (name) =>
        units.find((u) => u.name.toLowerCase().includes(name.toLowerCase()));
    const unitTon = getUnit("ton");
    const unitSak = getUnit("sak");
    const unitInner = getUnit("inner");
    const unitKg = getUnit("kg");
    console.log("Debug - Units:", { unitTon, unitSak, unitInner, unitKg });

    // State untuk semua satuan
    const [qtyTon, setQtyTon] = useState("");
    const [qtySak, setQtySak] = useState("");
    const [qtyInner, setQtyInner] = useState("");
    const [qtyKg, setQtyKg] = useState("");

    // Fungsi konversi dua arah
    const handleQtyChange = (val, satuan) => {
        if (val === "") {
            setQtyTon("");
            setQtySak("");
            setQtyInner("");
            setQtyKg("");
            setData("stok_awal", "");
            setErrorMessage("");
            return;
        }

        if (!unitTon || !unitSak || !unitInner || !unitKg) {
            setErrorMessage(
                "Data satuan tidak lengkap. Silakan hubungi admin."
            );
            return;
        }

        let ton = 0,
            sak = 0,
            inner = 0,
            kg = 0;
        val = parseFloat(val);
        if (isNaN(val) || val < 0) val = 0;

        if (satuan === "ton") {
            ton = val;
            kg = ton * unitTon.multiplier;
            sak = kg / unitSak.multiplier;
            inner = kg / unitInner.multiplier;
        } else if (satuan === "sak") {
            sak = val;
            kg = sak * unitSak.multiplier;
            ton = kg / unitTon.multiplier;
            inner = kg / unitInner.multiplier;
        } else if (satuan === "inner") {
            inner = val;
            kg = inner * unitInner.multiplier;
            ton = kg / unitTon.multiplier;
            sak = kg / unitSak.multiplier;
        } else if (satuan === "kg") {
            kg = val;
            ton = kg / unitTon.multiplier;
            sak = kg / unitSak.multiplier;
            inner = kg / unitInner.multiplier;
        }

        setQtyTon(ton === 0 ? "" : ton.toFixed(2));
        setQtySak(sak === 0 ? "" : sak.toFixed(2));
        setQtyInner(inner === 0 ? "" : inner.toFixed(2));
        setQtyKg(kg === 0 ? "" : kg.toFixed(2));
        setData("stok_awal", kg === 0 ? "" : kg.toFixed(2));
        setErrorMessage("");
        console.log("Debug - Konversi:", { ton, sak, inner, kg });
    };
    // Efek untuk memicu konversi saat selectedUnit berubah (opsional)
    useEffect(() => {
        if (selectedUnit && (qtyTon || qtySak || qtyInner || qtyKg)) {
            const currentUnit = [unitTon, unitSak, unitInner, unitKg].find(
                (u) => u?.id === selectedUnit
            );
            if (currentUnit) {
                handleQtyChange(
                    qtyTon || qtySak || qtyInner || qtyKg,
                    currentUnit.name.toLowerCase()
                );
            }
        }
    }, [
        selectedUnit,
        qtyTon,
        qtySak,
        qtyInner,
        qtyKg,
        unitTon,
        unitSak,
        unitInner,
        unitKg,
    ]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            !data.date ||
            !data.product_id ||
            !data.category_id ||
            !data.warehouse_id
        ) {
            setErrorMessage("Semua field wajib diisi!");
            return;
        }
        setErrorMessage("");
        post(route("stocks.store"));
    };

    return (
        <>
            <Head title="Tambah Stok" />
            <form
                onSubmit={handleSubmit}
                className="max-w-lg mx-auto mt-6 bg-white dark:bg-gray-900 p-6 rounded shadow"
            >
                <h1 className="text-xl font-bold mb-4">Tambah Stok</h1>
                {errorMessage && (
                    <div className="text-red-500 text-sm mb-4">
                        {errorMessage}
                    </div>
                )}
                {Object.keys(errors).length > 0 && (
                    <div className="text-red-500 text-sm mb-4">
                        {Object.values(errors).map((error, idx) => (
                            <p key={idx}>{error}</p>
                        ))}
                    </div>
                )}
                <div className="mb-4">
                    <label
                        htmlFor="date-input"
                        className="block text-xs font-semibold mb-1 ml-1"
                    >
                        Tanggal
                    </label>
                    <input
                        id="date-input"
                        type="date"
                        className="w-full border rounded px-2 py-1 text-sm text-black bg-white"
                        value={data.date}
                        onChange={(e) => setData("date", e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <InputSelect
                        label="Kategori"
                        data={categories}
                        selected={selectedCategory}
                        setSelected={(cat) => {
                            setSelectedCategory(cat);
                            setData("category_id", cat ? cat.id : "");
                        }}
                        placeholder="Pilih Kategori"
                        displayKey="name"
                        errors={errors.category_id}
                    />
                </div>
                <div className="mb-4">
                    <InputSelect
                        label="Gudang"
                        data={warehouses}
                        selected={selectedWarehouse}
                        setSelected={(wh) => {
                            setSelectedWarehouse(wh);
                            setData("warehouse_id", wh ? wh.id : "");
                        }}
                        placeholder="Pilih Gudang"
                        displayKey="name"
                        errors={errors.warehouse_id}
                    />
                </div>
                <div className="mb-4">
                    <InputSelect
                        label="Produk"
                        data={products}
                        selected={selectedProduct}
                        setSelected={(prod) => {
                            setSelectedProduct(prod);
                            setData("product_id", prod ? prod.id : "");
                        }}
                        placeholder="Pilih Produk"
                        displayKey="title"
                        errors={errors.product_id}
                    />
                </div>
                <div className="mb-4 flex flex-col md:flex-row gap-2 items-end bg-gray-100 p-4 rounded-md">
                    <div className="w-full md:w-1/3">
                        <label
                            htmlFor="unit-select"
                            className="block text-xs font-semibold mb-1 ml-1"
                        >
                            Satuan
                        </label>
                        <select
                            id="unit-select"
                            className="w-full border rounded px-2 py-1 text-sm text-black bg-white"
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                            {satuanOptions.map((opt) => (
                                <option
                                    key={opt.value}
                                    value={opt.value}
                                    className="text-black bg-white"
                                >
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-2/3">
                        <label className="block text-xs text-gray-500 font-semibold mb-1 ml-1">
                            Hasil Konversi
                        </label>
                        <div className="border rounded px-2 py-1 text-sm bg-gray-50 min-h-[36px] flex flex-col gap-1 text-black">
                            <span>Ton: {qtyTon || 0}</span>
                            <span>Sak: {qtySak || 0}</span>
                            <span>Inner: {qtyInner || 0}</span>
                        </div>
                    </div>
                </div>
                <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Input
                        type="number"
                        label="Ton"
                        value={qtyTon}
                        onChange={(e) =>
                            selectedUnit === unitTon?.id
                                ? handleQtyChange(e.target.value, "ton")
                                : null
                        }
                        disabled={selectedUnit !== unitTon?.id}
                        min={0}
                    />
                    <Input
                        type="number"
                        label="Sak"
                        value={qtySak}
                        onChange={(e) =>
                            selectedUnit === unitSak?.id
                                ? handleQtyChange(e.target.value, "sak")
                                : null
                        }
                        disabled={selectedUnit !== unitSak?.id}
                        min={0}
                    />
                    <Input
                        type="number"
                        label="Inner"
                        value={qtyInner}
                        onChange={(e) =>
                            selectedUnit === unitInner?.id
                                ? handleQtyChange(e.target.value, "inner")
                                : null
                        }
                        disabled={selectedUnit !== unitInner?.id}
                        min={0}
                    />
                    <Input
                        type="number"
                        label="Kg"
                        value={qtyKg}
                        onChange={(e) =>
                            selectedUnit === unitKg?.id
                                ? handleQtyChange(e.target.value, "kg")
                                : null
                        }
                        disabled={selectedUnit !== unitKg?.id}
                        min={0}
                    />
                </div>
                <div className="flex gap-2 justify-end mt-4">
                    <Button
                        type="submit"
                        label={processing ? "Menyimpan..." : "Simpan"}
                        className="border bg-sky-500 text-white transition-colors duration-200 hover:bg-sky-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 w-full md:w-auto"
                        disabled={processing}
                    />
                    <Button
                        type="button"
                        label="Reset"
                        className="border bg-gray-300 text-gray-700 transition-colors duration-200 hover:bg-gray-200 w-full md:w-auto"
                        onClick={() => {
                            setSelectedProduct(null);
                            setSelectedUnit("");
                            setSelectedCategory(null);
                            setSelectedWarehouse(null);
                            setData({
                                product_id: "",
                                stok_awal: "",
                                category_id: "",
                                warehouse_id: "",
                                date: "",
                            });
                            setQtyTon("");
                            setQtySak("");
                            setQtyInner("");
                            setQtyKg("");
                            setErrorMessage("");
                        }}
                    />
                    <Button
                        type="button"
                        label="Kembali"
                        className="border bg-yellow-300 text-gray-700 transition-colors duration-200 hover:bg-yellow-200 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900 w-full md:w-auto"
                        onClick={() => window.history.back()}
                    />
                </div>
            </form>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
