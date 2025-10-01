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

export default function PurchaseFormInfo({
    data,
    suppliers,
    tokos,
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
    manualSupplierErrors = {},
    manualSupplierSubmitting = false,
}) {
    useEffect(() => {
        if (location && (!data.toko_name || data.toko_name === "")) {
            setData("toko_name", location);
            setData("toko_id", null);
        }
    }, [location]);

    // Fetch next invoice number for given purchase_date
    useEffect(() => {
        const fetchNext = async () => {
            if (!data.purchase_date) return;
            try {
                // use explicit dashboard-prefixed path to match routes group
                const url =
                    typeof route === "function" &&
                        typeof route("purchases.next-invoice") === "string"
                        ? route("purchases.next-invoice", {
                            date: data.purchase_date,
                        })
                        : `/dashboard/purchases/next-invoice?date=${encodeURIComponent(
                            data.purchase_date
                        )}`;
                const res = await fetch(url, {
                    headers: {
                        Accept: "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                    },
                    // include credentials (cookies) to support authenticated dashboard routes
                    credentials: "include",
                    // avoid stale cache for diagnostic
                    cache: "no-store",
                });
                console.debug("next-invoice fetch", url, "status", res.status);
                if (res.status === 401) {
                    console.warn(
                        "next-invoice: 401 Unauthorized — session/cookie may be missing. Ensure you are logged in and assets are fresh."
                    );
                    return;
                }
                if (res.status === 404) {
                    console.warn(
                        "next-invoice: 404 Not Found — route may be unreachable. URL:",
                        url
                    );
                    return;
                }
                if (!res.ok) return;
                const json = await res.json();
                if (json && json.invoice_number) {
                    setData("invoice_number", json.invoice_number);
                    // keep optional invoice_seq if needed elsewhere
                    setData("invoice_seq", json.invoice_seq || "");
                }
            } catch (e) {
                console.error("Failed to fetch next invoice:", e);
            }
        };
        fetchNext();
    }, [data.purchase_date]);

    return (
        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardContent>
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <label className="block p-2 mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                                Lokasi
                            </label>
                            <Input
                                type="text"
                                name="toko_name"
                                value={data.toko_name || location || ""}
                                onChange={handleChange}
                                className="text-base bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                                readOnly
                            />

                            {data.toko_name && !data.toko_id && (
                                <div className=" p-2 mt-3 text-sm rounded bg-gray-50 dark:bg-gray-800 dark:text-gray-200">
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
                        <div className=" p-2 text-sm text-right text-gray-500 w-44 dark:text-gray-400">
                            Tgl: {data.purchase_date || "-"}
                        </div>
                    </div>
                </CardContent>
                <CardHeader>
                    <CardTitle>Informasi Pembelian</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 dark:text-gray-200">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                Tanggal
                            </label>
                            <Input
                                type="date"
                                name="purchase_date"
                                value={data.purchase_date}
                                onChange={handleChange}
                                className="text-base bg-gray-50 dark:bg-gray-800 dark:text-gray-200 w-50"
                                required
                            />
                        </div>

                        {/* No. urut invoice di-generate otomatis di backend; input manual dihapus */}

                        <div className="md:col-span-2 ">
                            <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                                No. Invoice (Otomatis)
                            </label>
                            <span className="block w-full px-4 py-3 text-base border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-200">
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
                errors={typeof manualSupplierErrors !== 'undefined' ? manualSupplierErrors : {}}
                submitting={typeof manualSupplierSubmitting !== 'undefined' ? manualSupplierSubmitting : false}
            />
        </div>
    );
}
