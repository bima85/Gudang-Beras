import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";

export default function Create() {
    const { products, warehouses, tokos } = usePage().props;
    const form = useForm({
        transaction_date: new Date().toISOString().slice(0, 16),
        transaction_number: "",
        transaction_type: "purchase",
        product_id: products[0]?.id ?? null,
        quantity: 0,
        unit: "pcs",
        price: "",
        toko_id: tokos && tokos[0]?.id ? tokos[0].id : null,
        related_party: "",
        notes: "",
    });

    function submit(e) {
        e.preventDefault();
        form.post(route("transaction-histories.store"), {
            onSuccess: () => {
                toast.success("Transaksi tersimpan");
            },
        });
    }

    return (
        <>
            <Head title="Tambah Histori Transaksi" />
            <div className="p-4 max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">
                        Tambah Histori Transaksi
                    </h1>
                    <Link href={route("transaction-histories.index")}>
                        <Button variant="outline">Kembali</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Tambah Histori Transaksi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Tanggal
                                    </label>
                                    <Input
                                        type="datetime-local"
                                        value={form.data.transaction_date}
                                        onChange={(e) =>
                                            form.setData(
                                                "transaction_date",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {form.errors.transaction_date && (
                                        <div className="text-sm text-red-600">
                                            {form.errors.transaction_date}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Nomor Transaksi
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Masukkan nomor transaksi"
                                        value={form.data.transaction_number}
                                        onChange={(e) =>
                                            form.setData(
                                                "transaction_number",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {form.errors.transaction_number && (
                                        <div className="text-sm text-red-600">
                                            {form.errors.transaction_number}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Jenis Transaksi
                                    </label>
                                    <Select
                                        value={form.data.transaction_type}
                                        onValueChange={(value) =>
                                            form.setData(
                                                "transaction_type",
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis transaksi" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="purchase">
                                                Purchase
                                            </SelectItem>
                                            <SelectItem value="sale">
                                                Sale
                                            </SelectItem>
                                            <SelectItem value="return">
                                                Return
                                            </SelectItem>
                                            <SelectItem value="transfer">
                                                Transfer
                                            </SelectItem>
                                            <SelectItem value="adjustment">
                                                Adjustment
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Produk
                                    </label>
                                    <Select
                                        value={form.data.product_id?.toString()}
                                        onValueChange={(value) =>
                                            form.setData(
                                                "product_id",
                                                parseInt(value)
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih produk" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map((p) => (
                                                <SelectItem
                                                    key={p.id}
                                                    value={p.id.toString()}
                                                >
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Quantity
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={form.data.quantity}
                                        onChange={(e) =>
                                            form.setData(
                                                "quantity",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Unit
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="pcs, kg, liter"
                                        value={form.data.unit}
                                        onChange={(e) =>
                                            form.setData("unit", e.target.value)
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Harga
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={form.data.price}
                                        onChange={(e) =>
                                            form.setData(
                                                "price",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Toko
                                    </label>
                                    <Select
                                        value={form.data.toko_id?.toString()}
                                        onValueChange={(value) =>
                                            form.setData(
                                                "toko_id",
                                                parseInt(value)
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih toko" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {tokos &&
                                                tokos.map((t) => (
                                                    <SelectItem
                                                        key={t.id}
                                                        value={t.id.toString()}
                                                    >
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">
                                        Pihak Terkait
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Nama supplier/customer"
                                        value={form.data.related_party}
                                        onChange={(e) =>
                                            form.setData(
                                                "related_party",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Catatan
                                </label>
                                <Textarea
                                    placeholder="Catatan tambahan..."
                                    value={form.data.notes}
                                    onChange={(e) =>
                                        form.setData("notes", e.target.value)
                                    }
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-4">
                                <Button type="submit">Simpan</Button>
                                <Link
                                    href={route("transaction-histories.index")}
                                >
                                    <Button variant="outline">Batal</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
