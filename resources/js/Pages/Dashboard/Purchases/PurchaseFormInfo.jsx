import React, { useEffect } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import TokoManualModal from "./TokoManualModal";
import SupplierManualModal from "./SupplierManualModal";
import GudangManualModal from "./GudangManualModal";

export default function PurchaseFormInfo({
    data,
    suppliers,
    tokos,
    warehouses,
    handleChange,
    setData,
    location,
    // Toko
    showTokoModal,
    setShowTokoModal,
    manualToko,
    setManualToko,
    handleManualTokoChange,
    handleManualTokoSubmit,
    // Supplier
    showSupplierModal,
    setShowSupplierModal,
    manualSupplier,
    setManualSupplier,
    handleManualSupplierChange,
    handleManualSupplierSubmit,
    // Gudang
    showGudangModal,
    setShowGudangModal,
    manualGudang,
    setManualGudang,
    handleManualGudangChange,
    handleManualGudangSubmit,
}) {
    useEffect(() => {
        if (location && (!data.toko_name || data.toko_name === "")) {
            setData("toko_name", location);
            setData("toko_id", null);
        }
    }, [location]);

    return (
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Lokasi
                            </label>
                            <Input
                                type="text"
                                name="toko_name"
                                value={data.toko_name || location || ""}
                                onChange={handleChange}
                                className="text-base bg-gray-50"
                                readOnly
                            />

                            {data.toko_name && !data.toko_id && (
                                <div className="p-3 mt-3 text-sm border rounded bg-gray-50">
                                    <div>
                                        <span className="font-semibold">
                                            Nama:
                                        </span>{" "}
                                        {data.toko_name}
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Keep a small area for date or helper text */}
                        <div className="text-sm text-right text-gray-500 w-44">
                            Tgl: {data.purchase_date || "-"}
                        </div>
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle>Informasi Pembelian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Tanggal
                            </label>
                            <Input
                                type="date"
                                name="purchase_date"
                                value={data.purchase_date}
                                onChange={handleChange}
                                className="text-base"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                No. Urut Invoice (3 digit)
                            </label>
                            <Input
                                type="number"
                                name="invoice_seq"
                                value={data.invoice_seq}
                                onChange={(e) => {
                                    let v = e.target.value.replace(/\D/g, "");
                                    if (v.length > 3) v = v.slice(0, 3);
                                    setData("invoice_seq", v);
                                }}
                                className="text-base"
                                min="1"
                                max="999"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                No. Invoice (Otomatis)
                            </label>
                            <span className="block w-full px-4 py-3 text-base border rounded-md bg-gray-50">
                                {data.invoice_number || "-"}
                            </span>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Supplier
                            </label>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <Select
                                        key={`supplier-select-${suppliers.length}`}
                                        value={data.supplier_name || ""}
                                        onValueChange={(value) => {
                                            handleChange({
                                                target: {
                                                    name: "supplier_name",
                                                    value,
                                                },
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="text-base">
                                            <SelectValue placeholder="Pilih Supplier" />
                                        </SelectTrigger>
                                        <SelectContent
                                            className="z-[100] max-h-60"
                                            position="popper"
                                            sideOffset={4}
                                        >
                                            {suppliers
                                                .filter(
                                                    (supplier, index, self) =>
                                                        index ===
                                                        self.findIndex(
                                                            (s) =>
                                                                s.name ===
                                                                supplier.name
                                                        )
                                                )
                                                .map((s) => (
                                                    <SelectItem
                                                        key={`supplier-${s.id}-${s.name}`}
                                                        value={s.name}
                                                    >
                                                        {s.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => {
                                        setManualSupplier({
                                            name: "",
                                            address: "",
                                            phone: "",
                                        });
                                        setShowSupplierModal(true);
                                    }}
                                    title="Tambah Supplier Manual"
                                >
                                    +
                                </Button>
                            </div>

                            {data.supplier_name &&
                                !suppliers.some(
                                    (s) => s.name === data.supplier_name
                                ) && (
                                    <div className="p-3 mt-3 text-sm border rounded bg-gray-50">
                                        <div>
                                            <span className="font-semibold">
                                                Nama:
                                            </span>{" "}
                                            {data.supplier_name}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Alamat:
                                            </span>{" "}
                                            {data.address}
                                        </div>
                                        <div>
                                            <span className="font-semibold">
                                                Telepon:
                                            </span>{" "}
                                            {data.phone}
                                        </div>
                                    </div>
                                )}
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                No. Telp Supplier
                            </label>
                            <Input
                                type="text"
                                name="phone"
                                value={data.phone}
                                onChange={handleChange}
                                className="text-base"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Alamat Supplier
                            </label>
                            <Input
                                type="text"
                                name="address"
                                value={data.address}
                                onChange={handleChange}
                                className="text-base"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Warehouse Information Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Gudang</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-700">
                                    Pilih Gudang
                                </label>
                                {data.warehouse_id && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData("warehouse_id", null)
                                        }
                                        className="text-xs text-red-600 hover:text-red-800"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <Select
                                key={`warehouse-select-${warehouses.length}`}
                                value={
                                    data.warehouse_id?.toString() || undefined
                                }
                                onValueChange={(value) => {
                                    const warehouseId = value
                                        ? parseInt(value)
                                        : null;
                                    const selectedWarehouse = warehouses.find(
                                        (w) => w.id.toString() === value
                                    );
                                    setData((prev) => ({
                                        ...prev,
                                        warehouse_id: warehouseId,
                                    }));
                                    if (selectedWarehouse) {
                                        console.log(
                                            "Selected warehouse:",
                                            selectedWarehouse
                                        );
                                    }
                                }}
                            >
                                <SelectTrigger className="text-base">
                                    <SelectValue placeholder="Pilih Gudang" />
                                </SelectTrigger>
                                <SelectContent
                                    className="max-h-60 overflow-y-auto"
                                    sideOffset={5}
                                >
                                    {warehouses.map((warehouse) => (
                                        <SelectItem
                                            key={warehouse.id}
                                            value={warehouse.id.toString()}
                                        >
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Informasi Warehouse yang dipilih */}
                        {data.warehouse_id &&
                            (() => {
                                const selectedWarehouse = warehouses.find(
                                    (w) =>
                                        w.id.toString() ===
                                        data.warehouse_id?.toString()
                                );
                                return selectedWarehouse ? (
                                    <div className="md:col-span-1">
                                        <div className="p-3 text-sm border rounded bg-gray-50">
                                            <div>
                                                <span className="font-semibold">
                                                    Nama:
                                                </span>{" "}
                                                {selectedWarehouse.name}
                                            </div>
                                            {selectedWarehouse.address && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Alamat:
                                                    </span>{" "}
                                                    {selectedWarehouse.address}
                                                </div>
                                            )}
                                            {selectedWarehouse.phone && (
                                                <div>
                                                    <span className="font-semibold">
                                                        Telepon:
                                                    </span>{" "}
                                                    {selectedWarehouse.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : null;
                            })()}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <TokoManualModal
                show={showTokoModal}
                onClose={() => setShowTokoModal(false)}
                onSubmit={handleManualTokoSubmit}
                manualToko={manualToko}
                onChange={handleManualTokoChange}
            />
            <SupplierManualModal
                show={showSupplierModal}
                onClose={() => setShowSupplierModal(false)}
                onSubmit={handleManualSupplierSubmit}
                manualSupplier={manualSupplier}
                onChange={handleManualSupplierChange}
            />
            <GudangManualModal
                show={showGudangModal}
                onClose={() => setShowGudangModal(false)}
                onSubmit={handleManualGudangSubmit}
                manualGudang={manualGudang}
                onChange={handleManualGudangChange}
            />
        </div>
    );
}
