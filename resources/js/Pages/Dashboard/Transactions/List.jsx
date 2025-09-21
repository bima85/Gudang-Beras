import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";

export default function List() {
    const { transactions = [] } = usePage().props;
    const [search, setSearch] = useState("");

    // Contoh penggunaan useEffect jika ingin fetch/filter data
    useEffect(() => {
        // Bisa tambahkan logic pencarian/filter di sini
    }, [search]);

    return (
        <DashboardLayout>
            <div className="p-4">
                <Head title="Daftar Transaksi Penjualan" />
                <h1 className="text-2xl font-bold mb-4">
                    Daftar Transaksi Penjualan
                </h1>
                {/* Input pencarian/filter jika dibutuhkan */}
                <div className="mb-4">
                    <Input
                        type="text"
                        placeholder="Cari invoice/pelanggan..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <table className="w-full border">
                    <thead>
                        <tr>
                            <th>Invoice</th>
                            <th>Tanggal</th>
                            <th>Jam</th>
                            <th>Pelanggan</th>
                            <th>Total</th>
                            <th>Deposit</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions
                            .filter(
                                (trx) =>
                                    trx.invoice
                                        .toLowerCase()
                                        .includes(search.toLowerCase()) ||
                                    (trx.customer?.name || "")
                                        .toLowerCase()
                                        .includes(search.toLowerCase())
                            )
                            .map((trx) => (
                                <tr key={trx.id}>
                                    <td>{trx.invoice}</td>
                                    <td>
                                        {new Date(
                                            trx.created_at
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>
                                        {trx.created_at
                                            ? new Date(
                                                trx.created_at
                                            ).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "-"}
                                    </td>
                                    <td>{trx.customer?.name}</td>
                                    <td>{trx.grand_total}</td>
                                    <td>{trx.deposit_amount}</td>
                                    <td className="flex gap-2">
                                        <Link
                                            href={route(
                                                "transactions.print",
                                                trx.invoice
                                            )}
                                            className="btn btn-sm btn-primary"
                                        >
                                            Cetak
                                        </Link>
                                        {/** Tombol buat surat jalan: hanya untuk role gudang/admin/super-admin dan jika transaksi sudah dibayar */}
                                        {(() => {
                                            const roles =
                                                usePage().props.auth?.user
                                                    ?.roles || [];
                                            const allowed = roles.some((r) =>
                                                [
                                                    "super-admin",
                                                    "toko",
                                                    "gudang",
                                                ].includes(r.name)
                                            );
                                            if (!allowed) return null;

                                            // Check if transaction appears paid
                                            const isPaid = (() => {
                                                if (!trx) return false;
                                                if (
                                                    trx.payment_method &&
                                                    trx.payment_method !==
                                                    "tempo"
                                                )
                                                    return true;
                                                const cash = parseFloat(
                                                    trx.cash || 0
                                                );
                                                const deposit = parseFloat(
                                                    trx.deposit_amount || 0
                                                );
                                                const grand = parseFloat(
                                                    trx.grand_total || 0
                                                );
                                                return cash + deposit >= grand;
                                            })();

                                            if (!isPaid)
                                                return (
                                                    <button
                                                        disabled
                                                        className="btn btn-sm btn-secondary opacity-50"
                                                        title="Transaksi belum dibayar"
                                                    >
                                                        Buat Surat Jalan
                                                    </button>
                                                );

                                            return (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        axios
                                                            .post(
                                                                route(
                                                                    "transactions.delivery",
                                                                    trx.id
                                                                )
                                                            )
                                                            .then((res) => {
                                                                if (
                                                                    res.data &&
                                                                    res.data
                                                                        .success
                                                                ) {
                                                                    alert(
                                                                        "Surat jalan dibuat: " +
                                                                        (res
                                                                            .data
                                                                            .surat
                                                                            .no_surat ||
                                                                            "")
                                                                    );
                                                                } else {
                                                                    alert(
                                                                        res.data
                                                                            .message ||
                                                                        "Gagal membuat surat jalan"
                                                                    );
                                                                }
                                                            })
                                                            .catch((err) => {
                                                                alert(
                                                                    err
                                                                        ?.response
                                                                        ?.data
                                                                        ?.message ||
                                                                    "Gagal membuat surat jalan"
                                                                );
                                                            });
                                                    }}
                                                    className="btn btn-sm btn-secondary"
                                                >
                                                    Buat Surat Jalan
                                                </button>
                                            );
                                        })()}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
