import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
// import { usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { IconRefresh, IconClock } from "@tabler/icons-react";

export default function Gudang({
    barangMasukHariIni = [],
    stokBerasGudang = 0,
    stokBerasToko = 0,
    salesTransactions = [],
    warehouses = [],
    pageTitle = "Dashboard",
}) {
    const { auth, location } = usePage().props;
    const roles = auth?.user?.roles || [];

    // State for realtime data
    const [realtimeBarangMasuk, setRealtimeBarangMasuk] =
        useState(barangMasukHariIni);
    const [realtimeStokBerasGudang, setRealtimeStokBerasGudang] =
        useState(stokBerasGudang);
    const [realtimeStokBerasToko, setRealtimeStokBerasToko] =
        useState(stokBerasToko);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Prioritize the explicit location prop (set in AppServiceProvider/Inertia)
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

    const preferredWarehouse =
        (warehouses || []).find((w) =>
            location
                ? w.name &&
                  w.name.toLowerCase().includes(location.toLowerCase())
                : false
        ) ||
        (warehouses && warehouses[0]);

    const preferredWarehouseId = preferredWarehouse
        ? preferredWarehouse.id
        : null;
    const transactionsHref = preferredWarehouseId
        ? (route ? route("transactions.index") : "/dashboard/transactions") +
          "?warehouse_id=" +
          preferredWarehouseId
        : route
        ? route("transactions.index")
        : "/dashboard/transactions";

    const isTokoRoleOrLocation =
        (locationText && locationText.toLowerCase().includes("toko")) ||
        roles.some((r) => r.name === "toko");

    // Resolution order:
    // 1) If user's role is gudang => show gudang UI
    // 2) Else if selected location/role is toko => show toko-only UI
    // 3) Else default to gudang UI
    let showGudangUI;
    if (isGudang) showGudangUI = true;
    else if (isTokoRoleOrLocation) showGudangUI = false;
    else showGudangUI = true;

    // Function to fetch realtime data
    const fetchRealtimeData = async () => {
        if (isRefreshing) return;

        setIsRefreshing(true);
        try {
            // Use the comprehensive stats endpoint
            const url = preferredWarehouseId
                ? `/api/dashboard/stats?warehouse_id=${preferredWarehouseId}`
                : "/api/dashboard/stats";

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setRealtimeBarangMasuk(data.barangMasukHariIni || []);
                    setRealtimeStokBerasGudang(data.stokBerasGudang || 0);
                    setRealtimeStokBerasToko(data.stokBerasToko || 0);
                    setLastUpdate(new Date());
                }
            } else {
                console.error("API response not ok:", response.status);
            }
        } catch (error) {
            console.error("Error fetching realtime data:", error);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Manual refresh function
    const handleManualRefresh = () => {
        fetchRealtimeData();
    };

    // Auto refresh with polling
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchRealtimeData();
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(interval);
    }, [autoRefresh]);

    // Initial data sync
    useEffect(() => {
        setRealtimeBarangMasuk(barangMasukHariIni);
        setRealtimeStokBerasGudang(stokBerasGudang);
        setRealtimeStokBerasToko(stokBerasToko);
    }, [barangMasukHariIni, stokBerasGudang, stokBerasToko]);

    return (
        <>
            <Head title={pageTitle ?? "Dashboard"} />
            <div className="container p-4 mx-auto">
                {/* <div className="mb-4">
                    <Link
                        href={route ? route("logout") : "/logout"}
                        method="post"
                        as="button"
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Logout
                    </Link>
                </div> */}

                <h1 className="mb-4 text-2xl font-bold">
                    {pageTitle ?? "Dashboard"}
                </h1>

                <div className="mb-6">
                    <div className="overflow-hidden rounded-lg shadow-md">
                        <div className="p-6 text-white md:p-8 bg-gradient-to-r from-green-600 to-emerald-500">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
                                        Selamat datang,{" "}
                                        {auth?.user?.name ?? "-"}{" "}
                                        <span
                                            className="ml-2"
                                            role="img"
                                            aria-label="box"
                                        >
                                            📦
                                        </span>
                                    </h1>
                                    <p className="mt-2 text-sm md:text-base opacity-95">
                                        Lokasi kamu saat ini:{" "}
                                        <span className="font-semibold">
                                            {locationText}
                                        </span>
                                    </p>
                                </div>
                                <div className="items-center hidden gap-2 md:flex">
                                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-white/20">
                                        {locationText}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module cards */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {showGudangUI ? (
                            <>
                                <Link
                                    href={transactionsHref}
                                    className="block p-6 transition bg-white rounded-lg shadow hover:shadow-md"
                                >
                                    <div className="text-lg font-semibold">
                                        Transaksi Penjualan
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        Buat transaksi penjualan dari gudang ini
                                    </div>
                                </Link>

                                <Link
                                    href={
                                        route
                                            ? route("delivery-notes.index")
                                            : "/dashboard/deliveries"
                                    }
                                    className="block p-6 transition bg-white rounded-lg shadow hover:shadow-md"
                                >
                                    <div className="text-lg font-semibold">
                                        Surat Jalan
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        Buat / lihat surat jalan untuk
                                        pengiriman
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={transactionsHref}
                                    className="block p-6 transition bg-white rounded-lg shadow hover:shadow-md"
                                >
                                    <div className="text-lg font-semibold">
                                        Transaksi Penjualan
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        Buat transaksi penjualan dari toko ini
                                    </div>
                                </Link>

                                <Link
                                    href={
                                        route
                                            ? route("purchases.create")
                                            : "/dashboard/purchases/create"
                                    }
                                    className="block p-6 transition bg-white rounded-lg shadow hover:shadow-md"
                                >
                                    <div className="text-lg font-semibold">
                                        Pembelian
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        Buat pembelian baru
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Quick action removed */}
                </section>

                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <span>📦</span>
                            Barang Masuk Hari Ini
                            <span className="text-sm font-normal text-green-600">
                                (Realtime)
                            </span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <IconClock className="w-4 h-4" />
                                <span>
                                    Update:{" "}
                                    {lastUpdate.toLocaleTimeString("id-ID")}
                                </span>
                            </div>
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                                    isRefreshing
                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                            >
                                <IconRefresh
                                    className={`w-4 h-4 ${
                                        isRefreshing ? "animate-spin" : ""
                                    }`}
                                />
                                {isRefreshing ? "Memperbarui..." : "Refresh"}
                            </button>
                            <label className="flex items-center gap-2 text-sm">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) =>
                                        setAutoRefresh(e.target.checked)
                                    }
                                    className="rounded"
                                />
                                Auto Refresh
                            </label>
                        </div>
                    </div>

                    <div className="p-4 bg-white border rounded-lg shadow-sm">
                        {realtimeBarangMasuk &&
                        realtimeBarangMasuk.length > 0 ? (
                            <div className="space-y-3">
                                {realtimeBarangMasuk.map((barang, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 border-l-4 border-green-500 rounded-lg bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                                                <span className="font-semibold text-green-600">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {barang?.product?.name ??
                                                        "(nama barang tidak tersedia)"}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Kategori:{" "}
                                                    {barang?.product?.category
                                                        ?.name ?? "-"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold text-green-600">
                                                {barang?.quantity ?? "-"}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {barang?.product?.unit?.name ??
                                                    "unit"}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                                    <span className="text-2xl">📦</span>
                                </div>
                                <h3 className="mb-2 text-lg font-medium text-gray-900">
                                    Belum Ada Barang Masuk
                                </h3>
                                <p className="text-gray-500">
                                    Belum ada barang yang masuk hari ini
                                </p>
                            </div>
                        )}
                    </div>

                    {autoRefresh && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            Data diperbarui otomatis setiap 30 detik
                        </div>
                    )}
                </section>

                <section className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="flex items-center gap-2 text-xl font-semibold">
                            <span>🌾</span>
                            Stok Beras
                            <span className="text-sm font-normal text-green-600">
                                (Realtime)
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Gudang Stock */}
                        <div className="p-4 bg-white border rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                                        <span className="text-2xl">🏭</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Gudang
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Stok di gudang utama
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {Math.floor(realtimeStokBerasGudang)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        kg
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-2 mt-3 bg-gray-200 rounded-full">
                                <div
                                    className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (realtimeStokBerasGudang /
                                                (realtimeStokBerasGudang +
                                                    realtimeStokBerasToko)) *
                                                100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>

                        {/* Toko Stock */}
                        <div className="p-4 bg-white border rounded-lg shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full">
                                        <span className="text-2xl">🏪</span>
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            Toko
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Stok di toko
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                        {Math.floor(realtimeStokBerasToko)}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        kg
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-2 mt-3 bg-gray-200 rounded-full">
                                <div
                                    className="h-2 transition-all duration-300 bg-green-600 rounded-full"
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            (realtimeStokBerasToko /
                                                (realtimeStokBerasGudang +
                                                    realtimeStokBerasToko)) *
                                                100
                                        )}%`,
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    {/* Total Stock Summary */}
                    <div className="p-4 mt-4 border rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                                    <span className="font-bold text-amber-600">
                                        Σ
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">
                                        Total Stok Beras
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Gabungan semua lokasi
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-amber-600">
                                    {Math.floor(realtimeStokBerasGudang) +
                                        Math.floor(realtimeStokBerasToko)}
                                </div>
                                <div className="text-sm text-gray-600">kg</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-6">
                    <h2 className="text-xl font-semibold">
                        Transaksi Penjualan
                    </h2>
                    <ul className="pl-5 list-disc">
                        {(salesTransactions || []).map((transaction, index) => (
                            <li key={index}>
                                {transaction?.date ??
                                    "(tanggal tidak tersedia)"}{" "}
                                - {transaction?.total ?? "-"}
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}

// Attach the standard dashboard layout so Sidebar/Navbar are rendered
Gudang.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
