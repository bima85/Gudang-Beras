import React from "react";
import { Head } from "@inertiajs/react";

export default function Toko({
    totalTransaksi,
    totalOmzet,
    totalPelanggan,
    totalProduk,
}) {
    return (
        <>
            <Head title="Dashboard Toko" />
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Dashboard Toko</h1>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold">
                        Statistik Hari Ini
                    </h2>
                    <p>Total Transaksi: {totalTransaksi}</p>
                    <p>Total Omzet: {totalOmzet}</p>
                    <p>Total Pelanggan: {totalPelanggan}</p>
                    <p>Total Produk: {totalProduk}</p>
                </section>
            </div>
        </>
    );
}
