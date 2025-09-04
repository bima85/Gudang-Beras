import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
// import { usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";

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

    // Special roles / email overrides
    const isAdminUserEmail = auth?.user?.email === "admin_user@example.test";
    const isSuperAdminEmail = auth?.user?.email === "admin@example.test";

    const isTokoRoleOrLocation =
        (locationText && locationText.toLowerCase().includes("toko")) ||
        roles.some((r) => r.name === "toko");

    // Force gudang view for specific admin emails when they have selected toko
    const forceGudangView =
        (isSuperAdminEmail || isAdminUserEmail) && isTokoRoleOrLocation;

    // Resolution order:
    // 1) If forceGudangView => show gudang UI
    // 2) Else if user's role is gudang => show gudang UI
    // 3) Else if selected location/role is toko => show toko-only UI
    // 4) Else default to gudang UI
    let showGudangUI;
    if (forceGudangView) showGudangUI = true;
    else if (isGudang) showGudangUI = true;
    else if (isTokoRoleOrLocation) showGudangUI = false;
    else showGudangUI = true;

    return (
        <>
            <Head title={pageTitle ?? "Dashboard"} />
            <div className="container mx-auto p-4">
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

                <h1 className="text-2xl font-bold mb-4">
                    {pageTitle ?? "Dashboard"}
                </h1>

                <div className="mb-6">
                    <div className="rounded-lg overflow-hidden shadow-md">
                        <div className="p-6 md:p-8 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
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
                                    <p className="text-sm md:text-base mt-2 opacity-95">
                                        Lokasi kamu saat ini:{" "}
                                        <span className="font-semibold">
                                            {locationText}
                                        </span>
                                    </p>
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium">
                                        {locationText}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Module cards */}
                <section className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {showGudangUI ? (
                            <>
                                <Link
                                    href={
                                        route
                                            ? route("purchases.create")
                                            : "/dashboard/purchases/create"
                                    }
                                    className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
                                >
                                    <div className="text-lg font-semibold">
                                        Transaksi Pembelian
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Buat transaksi pembelian baru
                                    </div>
                                </Link>

                                <Link
                                    href={transactionsHref}
                                    className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
                                >
                                    <div className="text-lg font-semibold">
                                        Transaksi Penjualan
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Buat transaksi penjualan dari gudang ini
                                    </div>
                                </Link>

                                <Link
                                    href={
                                        route
                                            ? route("deliveries.index")
                                            : "/dashboard/deliveries"
                                    }
                                    className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
                                >
                                    <div className="text-lg font-semibold">
                                        Surat Jalan
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Buat / lihat surat jalan untuk
                                        pengiriman
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={transactionsHref}
                                    className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
                                >
                                    <div className="text-lg font-semibold">
                                        Transaksi Penjualan
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Buat transaksi penjualan dari toko ini
                                    </div>
                                </Link>

                                <Link
                                    href={
                                        route
                                            ? route("purchases.create")
                                            : "/dashboard/purchases/create"
                                    }
                                    className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition"
                                >
                                    <div className="text-lg font-semibold">
                                        Pembelian
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        Buat pembelian baru
                                    </div>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Quick action removed */}
                </section>

                <section className="mb-6">
                    <h2 className="text-xl font-semibold">
                        Barang Masuk Hari Ini
                    </h2>
                    <ul className="list-disc pl-5">
                        {(barangMasukHariIni || []).map((barang, index) => (
                            <li key={index}>
                                {barang?.product?.name ??
                                    "(nama barang tidak tersedia)"}{" "}
                                - {barang?.quantity ?? "-"}
                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold">Stok Beras</h2>
                    <p>Gudang: {stokBerasGudang}</p>
                    <p>Toko: {stokBerasToko}</p>
                </section>

                <section className="mt-6">
                    <h2 className="text-xl font-semibold">
                        Transaksi Penjualan
                    </h2>
                    <ul className="list-disc pl-5">
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
