import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";

export default function Dashboard() {
    const { auth, location } = usePage().props;
    const roles = auth?.user?.roles || [];
    // Prefer explicit selected location from session (`location`) if present,
    // otherwise fall back to user's roles.
    const isGudang =
        (location && String(location).toLowerCase().includes("gudang")) ||
        roles.some((r) => r.name === "gudang");
    const locationText = location
        ? location
        : isGudang
            ? "Gudang"
            : roles[0]
                ? roles[0].name
                : "-";

    return (
        <>
            <Head title="Dashboard" />

            <div className="mb-6">
                <div className="rounded-lg overflow-hidden shadow-md">
                    <div className="p-6 bg-gradient-to-r from-blue-500 to-violet-500 text-white">
                        <h2 className="text-2xl md:text-3xl font-extrabold">
                            Selamat datang, {auth.user.name}{" "}
                            <span className="ml-2">🎉</span>
                        </h2>
                        <div className="text-sm md:text-base mt-1 opacity-90">
                            Lokasi kamu saat ini:{" "}
                            <span className="font-semibold">
                                {locationText}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-4 text-gray-800">
                <h3 className="text-xl font-semibold">
                    Modul yang bisa kamu akses:
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/dashboard/stocks" className="block">
                    <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="text-lg font-bold">Stok Gudang</div>
                        <div className="text-sm text-gray-500 mt-2">
                            Klik untuk masuk
                        </div>
                    </div>
                </a>

                <a href="/dashboard/products" className="block">
                    <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition-shadow duration-200">
                        <div className="text-lg font-bold">Produk</div>
                        <div className="text-sm text-gray-500 mt-2">
                            Klik untuk masuk
                        </div>
                    </div>
                </a>
            </div>
        </>
    );
}

Dashboard.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
