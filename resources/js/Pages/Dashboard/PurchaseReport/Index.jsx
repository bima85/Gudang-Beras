import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Inertia } from "@inertiajs/inertia";
import { router } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import InputSelect from "@/Components/Dashboard/InputSelect";
import { ExcelIcon, PdfIcon } from "@/Components/Dashboard/ExportIcons";
import {
    Table,
    Card,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Empty,
} from "@/Components/Dashboard/Table";
import {
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Download,
    FileText,
    Filter,
    RefreshCw,
    ShoppingCart,
    Calendar,
    Package,
    Building,
    Loader2,
    Eye,
    Edit,
    Trash2,
    Plus,
    User,
    Hash,
    TrendingUp,
    ArrowUpDown,
} from "lucide-react";

export default function PurchaseReport() {
    const { purchases, suppliers, products, filters } = usePage().props;

    // Debug: Check what data we're getting
    React.useEffect(() => {
        console.log("=== PURCHASE REPORT DEBUG ===");
        console.log("Full purchases object:", purchases);
        if (purchases?.data?.length > 0) {
            console.log("First purchase full data:", purchases.data[0]);
            console.log("First purchase toko field:", purchases.data[0].toko);
            console.log("First purchase toko_id:", purchases.data[0].toko_id);
            console.log(
                "All fields in first purchase:",
                Object.keys(purchases.data[0])
            );
        }
    }, [purchases]);

    // Initialize filter state
    const [filter, setFilter] = useState(filters || {});
    const [expanded, setExpanded] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterChange = (e) => {
        setFilter({ ...filter, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFilter({});
        Inertia.get(
            route("purchase-report.index"),
            {},
            {
                onStart: () => setIsLoading(true),
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        Inertia.get(route("purchase-report.index"), filter, {
            onStart: () => setIsLoading(true),
            onFinish: () => setIsLoading(false),
        });
    };

    const toggleExpand = (purchaseId) => {
        setExpanded((prev) => ({
            ...prev,
            [purchaseId]: !prev[purchaseId],
        }));
    };

    const handleExport = (type) => {
        const base =
            type === "excel"
                ? route("purchase-report.export.excel")
                : route("purchase-report.export.pdf");

        const params = new URLSearchParams(filter);
        window.open(`${base}?${params.toString()}`, "_blank");
    };

    const handleDelete = (purchaseId) => {
        if (confirm("Apakah Anda yakin ingin menghapus pembelian ini?")) {
            router.delete(route("purchases.destroy", purchaseId), {
                preserveScroll: true,
                onSuccess: () => {
                    // Refresh data
                },
                onError: () => {
                    alert("Gagal menghapus pembelian");
                },
            });
        }
    };

    // Format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price || 0);
    };

    // Format quantity
    const formatQuantity = (qty) => {
        return Number(qty || 0).toLocaleString("id-ID");
    };

    // Calculate totals
    const totals = purchases?.data?.reduce(
        (acc, purchase) => {
            const purchaseTotal =
                purchase.items?.reduce(
                    (sum, item) => sum + (item.subtotal || 0),
                    0
                ) || 0;
            const kuliFeeTotal =
                purchase.items?.reduce(
                    (sum, item) => sum + (item.kuli_fee || 0),
                    0
                ) || 0;
            const timbanganTotal =
                purchase.items?.reduce(
                    (sum, item) => sum + (item.timbangan || 0),
                    0
                ) || 0;

            return {
                total: acc.total + purchaseTotal,
                kuliFee: acc.kuliFee + kuliFeeTotal,
                timbangan: acc.timbangan + timbanganTotal,
                count: acc.count + 1,
            };
        },
        { total: 0, kuliFee: 0, timbangan: 0, count: 0 }
    ) || { total: 0, kuliFee: 0, timbangan: 0, count: 0 };

    return (
        <DashboardLayout>
            <div className="min-h-screen p-2 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
                <div className="mx-auto space-y-3 max-w-7xl">
                    {/* Header */}
                    <div className="p-3 transition-all duration-300 border rounded-lg shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:shadow-lg">
                        <div className="flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="p-2 rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-purple-600">
                                        <ShoppingCart className="w-4 h-4 text-white" />
                                    </div>
                                    <h1 className="text-xl font-bold text-transparent lg:text-2xl bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text">
                                        Laporan Pembelian
                                    </h1>
                                </div>
                                <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                                    Kelola dan pantau semua data pembelian
                                    dengan sistem filter yang canggih dan ekspor
                                    data yang mudah
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handleExport("pdf")}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <PdfIcon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                        Export PDF
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleExport("excel")}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-md hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <ExcelIcon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                        Export Excel
                                    </span>
                                </button>
                                <button
                                    onClick={() =>
                                        router.get(route("purchases.create"))
                                    }
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-lg transform hover:scale-105"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                        Tambah Pembelian
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="p-3 transition-all duration-300 border rounded-lg shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:shadow-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="p-1.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-md shadow-md">
                                <Filter className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h2 className="text-lg font-semibold text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text">
                                Filter Laporan Pembelian
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Supplier Filter */}
                                <div className="group">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <Building className="w-3 h-3 text-blue-500" />
                                        Supplier
                                    </label>
                                    <InputSelect
                                        label="Supplier"
                                        data={suppliers || []}
                                        selected={
                                            suppliers?.find(
                                                (s) =>
                                                    s.id == filter.supplier_id
                                            ) || null
                                        }
                                        setSelected={(s) =>
                                            setFilter({
                                                ...filter,
                                                supplier_id: s ? s.id : "",
                                            })
                                        }
                                        displayKey="name"
                                        placeholder="Semua Supplier"
                                        className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                {/* Product Filter */}
                                <div className="group">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <Package className="w-3 h-3 text-green-500" />
                                        Produk
                                    </label>
                                    <InputSelect
                                        label="Produk"
                                        data={products || []}
                                        selected={
                                            products?.find(
                                                (p) => p.id == filter.product_id
                                            ) || null
                                        }
                                        setSelected={(p) =>
                                            setFilter({
                                                ...filter,
                                                product_id: p ? p.id : "",
                                            })
                                        }
                                        displayKey="name"
                                        placeholder="Semua Produk"
                                        className="w-full transition-all duration-200 focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                    />
                                </div>

                                {/* Date From */}
                                <div className="group">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <Calendar className="w-3 h-3 text-purple-500" />
                                        Dari Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        name="date_from"
                                        value={filter.date_from || ""}
                                        onChange={handleFilterChange}
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md bg-white/70 backdrop-blur-sm text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 hover:border-purple-300 dark:bg-gray-700/70 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-purple-600/20 dark:focus:border-purple-600"
                                    />
                                </div>

                                {/* Date To */}
                                <div className="group">
                                    <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        <Calendar className="w-3 h-3 text-orange-500" />
                                        Sampai Tanggal
                                    </label>
                                    <input
                                        type="date"
                                        name="date_to"
                                        value={filter.date_to || ""}
                                        onChange={handleFilterChange}
                                        className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-md bg-white/70 backdrop-blur-sm text-gray-700 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 hover:border-orange-300 dark:bg-gray-700/70 dark:text-gray-300 dark:border-gray-600 dark:focus:ring-orange-600/20 dark:focus:border-orange-600"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col justify-end gap-2 pt-3 border-t sm:flex-row border-gray-200/50 dark:border-gray-700/50">
                                <Button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-md transition-all duration-200 hover:shadow-md dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300 dark:border-gray-600"
                                >
                                    <RefreshCw
                                        className={`w-3.5 h-3.5 ${
                                            isLoading ? "animate-spin" : ""
                                        }`}
                                    />
                                    Reset Filter
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md transition-all duration-200 hover:shadow-md transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Filter className="w-3.5 h-3.5" />
                                    )}
                                    {isLoading
                                        ? "Memfilter..."
                                        : "Terapkan Filter"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Summary Cards */}
                    {purchases?.data?.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="relative p-3 overflow-hidden transition-all duration-300 border rounded-lg group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200/50 dark:border-blue-700/50 hover:shadow-lg hover:scale-105">
                                <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 rounded-full bg-blue-500/10"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-blue-500/20">
                                            <ShoppingCart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <TrendingUp className="w-3.5 h-3.5 text-blue-500/50" />
                                    </div>
                                    <h3 className="mb-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                                        Total Pembelian
                                    </h3>
                                    <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                        {formatPrice(totals.total)}
                                    </p>
                                </div>
                            </div>

                            <div className="relative p-3 overflow-hidden transition-all duration-300 border rounded-lg group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200/50 dark:border-green-700/50 hover:shadow-lg hover:scale-105">
                                <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 rounded-full bg-green-500/10"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-green-500/20">
                                            <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <TrendingUp className="w-3.5 h-3.5 text-green-500/50" />
                                    </div>
                                    <h3 className="mb-1 text-xs font-medium text-green-700 dark:text-green-300">
                                        Total Fee Kuli
                                    </h3>
                                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                                        {formatPrice(totals.kuliFee)}
                                    </p>
                                </div>
                            </div>

                            <div className="relative p-3 overflow-hidden transition-all duration-300 border rounded-lg group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200/50 dark:border-orange-700/50 hover:shadow-lg hover:scale-105">
                                <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 rounded-full bg-orange-500/10"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-orange-500/20">
                                            <ArrowUpDown className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <TrendingUp className="w-3.5 h-3.5 text-orange-500/50" />
                                    </div>
                                    <h3 className="mb-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                                        Total Timbangan
                                    </h3>
                                    <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                                        {formatPrice(totals.timbangan)}
                                    </p>
                                </div>
                            </div>

                            <div className="relative p-3 overflow-hidden transition-all duration-300 border rounded-lg group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200/50 dark:border-purple-700/50 hover:shadow-lg hover:scale-105">
                                <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 rounded-full bg-purple-500/10"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="p-2 rounded-lg bg-purple-500/20">
                                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <Hash className="w-3.5 h-3.5 text-purple-500/50" />
                                    </div>
                                    <h3 className="mb-1 text-xs font-medium text-purple-700 dark:text-purple-300">
                                        Jumlah Transaksi
                                    </h3>
                                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                                        {totals.count} transaksi
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Data Table */}
                    <div className="overflow-hidden transition-all duration-300 border rounded-lg shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20 hover:shadow-lg">
                        <div className="p-3 border-b border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-md shadow-md">
                                    <Package className="w-3.5 h-3.5 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 bg-clip-text">
                                    Data Pembelian
                                </h3>
                            </div>
                        </div>

                        {!purchases?.data || purchases.data.length === 0 ? (
                            <div className="flex flex-col items-center justify-center px-6 py-12">
                                <div className="flex items-center justify-center w-16 h-16 mb-3 bg-gray-100 rounded-full dark:bg-gray-700">
                                    <Package className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="mb-2 text-base font-medium text-gray-900 dark:text-gray-100">
                                    Tidak ada data pembelian
                                </h3>
                                <p className="max-w-md text-center text-gray-500 dark:text-gray-400">
                                    Belum ada data pembelian yang sesuai dengan
                                    filter yang dipilih. Coba ubah filter atau
                                    tambah data pembelian baru.
                                </p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b border-gray-200 bg-gray-50/50 dark:bg-gray-700/50 dark:border-gray-700">
                                        <tr>
                                            <th className="w-8 px-3 py-2 text-xs font-medium tracking-wider text-center text-gray-500 uppercase dark:text-gray-400">
                                                <ArrowUpDown className="w-3 h-3 mx-auto" />
                                            </th>
                                            <th className="min-w-[120px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-1">
                                                    <Hash className="w-3 h-3" />
                                                    Invoice
                                                </div>
                                            </th>
                                            <th className="min-w-[100px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Tanggal
                                                </div>
                                            </th>
                                            <th className="min-w-[120px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-1">
                                                    <Building className="w-3 h-3" />
                                                    Supplier
                                                </div>
                                            </th>
                                            <th className="hidden lg:table-cell min-w-[100px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-1">
                                                    <Package className="w-3 h-3" />
                                                    Gudang
                                                </div>
                                            </th>
                                            <th className="min-w-[80px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center gap-1">
                                                    <Building className="w-3 h-3" />
                                                    Toko
                                                </div>
                                            </th>
                                            <th className="text-right min-w-[100px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                <div className="flex items-center justify-end gap-1">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Total
                                                </div>
                                            </th>
                                            <th className="text-center min-w-[80px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                        {purchases.data.map(
                                            (purchase, index) => (
                                                <React.Fragment
                                                    key={purchase.id}
                                                >
                                                    <tr className="transition-all duration-200 group hover:bg-blue-50/30 dark:hover:bg-blue-900/10">
                                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                                            <button
                                                                onClick={() =>
                                                                    toggleExpand(
                                                                        purchase.id
                                                                    )
                                                                }
                                                                className="p-1.5 text-gray-400 transition-all duration-200 hover:text-blue-600 hover:bg-blue-100 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 rounded-md group-hover:scale-110"
                                                                title={
                                                                    expanded[
                                                                        purchase
                                                                            .id
                                                                    ]
                                                                        ? "Tutup detail"
                                                                        : "Lihat detail items"
                                                                }
                                                            >
                                                                <div
                                                                    className={`transition-transform duration-300 ${
                                                                        expanded[
                                                                            purchase
                                                                                .id
                                                                        ]
                                                                            ? "rotate-90"
                                                                            : ""
                                                                    }`}
                                                                >
                                                                    <ChevronRight className="w-3 h-3" />
                                                                </div>
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                {purchase.invoice_number ||
                                                                    "-"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                #{purchase.id}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                {new Date(
                                                                    purchase.created_at
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {new Date(
                                                                    purchase.created_at
                                                                ).toLocaleTimeString(
                                                                    "id-ID",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                {purchase
                                                                    .supplier
                                                                    ?.name ||
                                                                    "-"}
                                                            </div>
                                                        </td>
                                                        <td className="hidden px-3 py-3 lg:table-cell whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                                                                {purchase
                                                                    .warehouse
                                                                    ?.name ||
                                                                    "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 whitespace-nowrap">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-700">
                                                                {purchase.toko
                                                                    ?.name ||
                                                                    "-"}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-right whitespace-nowrap">
                                                            <div className="text-base font-bold text-gray-900 dark:text-white">
                                                                {formatPrice(
                                                                    purchase.total_pembelian ||
                                                                        purchase.total
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                                            <div className="flex items-center justify-center gap-0.5">
                                                                <button
                                                                    onClick={() =>
                                                                        router.get(
                                                                            route(
                                                                                "purchases.show",
                                                                                purchase.id
                                                                            )
                                                                        )
                                                                    }
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md transition-all duration-200 hover:scale-110 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                                                    title="Lihat Detail"
                                                                >
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        router.get(
                                                                            route(
                                                                                "purchases.edit",
                                                                                purchase.id
                                                                            )
                                                                        )
                                                                    }
                                                                    className="p-1.5 text-yellow-600 hover:bg-yellow-100 rounded-md transition-all duration-200 hover:scale-110 dark:text-yellow-400 dark:hover:bg-yellow-900/20"
                                                                    title="Edit"
                                                                >
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            purchase.id
                                                                        )
                                                                    }
                                                                    className="p-1.5 text-red-600 hover:bg-red-100 rounded-md transition-all duration-200 hover:scale-110 dark:text-red-400 dark:hover:bg-red-900/20"
                                                                    title="Hapus"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>

                                                    {/* Expanded row showing items */}
                                                    {expanded[purchase.id] &&
                                                        purchase.items &&
                                                        purchase.items.length >
                                                            0 && (
                                                            <tr>
                                                                <td
                                                                    colSpan={8}
                                                                    className="p-0 bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-900/80"
                                                                >
                                                                    <div className="p-3 border-l-4 border-blue-500">
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            <div className="p-1.5 bg-blue-500/20 rounded-md">
                                                                                <Package className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                                                            </div>
                                                                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                                                                Detail
                                                                                Items
                                                                                Pembelian
                                                                                -{" "}
                                                                                {
                                                                                    purchase.invoice_number
                                                                                }
                                                                            </h4>
                                                                        </div>

                                                                        <div className="overflow-x-auto border rounded-md border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                                                                            <table className="w-full">
                                                                                <thead className="bg-gray-100/80 dark:bg-gray-700/80">
                                                                                    <tr>
                                                                                        <th className="min-w-[120px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            <div className="flex items-center gap-1">
                                                                                                <Package className="w-3 h-3" />
                                                                                                Produk
                                                                                            </div>
                                                                                        </th>
                                                                                        <th className="min-w-[100px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Kategori
                                                                                        </th>
                                                                                        <th className="min-w-[100px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Subkategori
                                                                                        </th>
                                                                                        <th className="hidden md:table-cell min-w-[60px] px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Satuan
                                                                                        </th>
                                                                                        <th className="text-right min-w-[60px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Qty
                                                                                        </th>
                                                                                        <th className="hidden lg:table-cell text-right min-w-[80px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Qty
                                                                                            Gudang
                                                                                        </th>
                                                                                        <th className="hidden lg:table-cell text-right min-w-[80px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Qty
                                                                                            Toko
                                                                                        </th>
                                                                                        <th className="text-right min-w-[90px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Harga
                                                                                        </th>
                                                                                        <th className="hidden lg:table-cell text-right min-w-[80px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Kuli
                                                                                            Fee
                                                                                        </th>
                                                                                        <th className="hidden lg:table-cell text-right min-w-[80px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Timbangan
                                                                                        </th>
                                                                                        <th className="text-right min-w-[90px] px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                                                                            Subtotal
                                                                                        </th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                                                                                    {purchase.items.map(
                                                                                        (
                                                                                            item,
                                                                                            idx
                                                                                        ) => (
                                                                                            <tr
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                className="transition-all duration-200 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
                                                                                            >
                                                                                                <td className="px-3 py-2">
                                                                                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                                                                        {item
                                                                                                            .product
                                                                                                            ?.name ||
                                                                                                            "-"}
                                                                                                    </div>
                                                                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                                                        ID:{" "}
                                                                                                        {item
                                                                                                            .product
                                                                                                            ?.id ||
                                                                                                            "-"}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-3 py-2">
                                                                                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-purple-800 bg-purple-100 rounded-full dark:bg-purple-900/30 dark:text-purple-300">
                                                                                                        {item
                                                                                                            .category
                                                                                                            ?.name ||
                                                                                                            "-"}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="px-3 py-2">
                                                                                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
                                                                                                        {item
                                                                                                            .subcategory
                                                                                                            ?.name ||
                                                                                                            "-"}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="hidden px-3 py-2 md:table-cell">
                                                                                                    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-gray-800 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-200">
                                                                                                        {item
                                                                                                            .unit
                                                                                                            ?.name ||
                                                                                                            "-"}
                                                                                                    </span>
                                                                                                </td>
                                                                                                <td className="px-4 py-3 text-right">
                                                                                                    <div className="font-bold text-gray-900 dark:text-white">
                                                                                                        {formatQuantity(
                                                                                                            item.qty
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="hidden px-4 py-3 text-right lg:table-cell">
                                                                                                    <div className="font-medium text-blue-600 dark:text-blue-400">
                                                                                                        {formatQuantity(
                                                                                                            item.qty_gudang
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="hidden px-4 py-3 text-right lg:table-cell">
                                                                                                    <div className="font-medium text-green-600 dark:text-green-400">
                                                                                                        {formatQuantity(
                                                                                                            item.qty_toko
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-4 py-3 text-right">
                                                                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                                                                        {formatPrice(
                                                                                                            item.harga_pembelian
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="hidden px-4 py-3 text-right lg:table-cell">
                                                                                                    <div className="font-medium text-orange-600 dark:text-orange-400">
                                                                                                        {formatPrice(
                                                                                                            item.kuli_fee
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="hidden px-4 py-3 text-right lg:table-cell">
                                                                                                    <div className="font-medium text-purple-600 dark:text-purple-400">
                                                                                                        {formatPrice(
                                                                                                            item.timbangan
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                                <td className="px-4 py-3 text-right">
                                                                                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                                                                                        {formatPrice(
                                                                                                            item.subtotal
                                                                                                        )}
                                                                                                    </div>
                                                                                                </td>
                                                                                            </tr>
                                                                                        )
                                                                                    )}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                </React.Fragment>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {purchases && purchases.last_page > 1 && (
                        <div className="p-3 transition-all duration-300 border rounded-lg shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-white/20">
                            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-blue-500/20 rounded-md">
                                        <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Menampilkan{" "}
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {purchases.from || 1}
                                        </span>{" "}
                                        hingga{" "}
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {purchases.to || 0}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-bold text-blue-600 dark:text-blue-400">
                                            {purchases.total || 0}
                                        </span>{" "}
                                        hasil
                                    </p>
                                </div>

                                <div className="flex items-center space-x-1">
                                    {purchases.current_page > 1 && (
                                        <button
                                            onClick={() => {
                                                const page =
                                                    purchases.current_page - 1;
                                                Inertia.get(
                                                    route(
                                                        "purchase-report.index"
                                                    ),
                                                    { ...filter, page }
                                                );
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-md transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            <ChevronLeft className="w-3 h-3" />
                                            <span className="hidden sm:inline">
                                                Previous
                                            </span>
                                        </button>
                                    )}

                                    {/* Page Numbers */}
                                    <div className="flex items-center space-x-1">
                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    5,
                                                    purchases.last_page
                                                ),
                                            },
                                            (_, i) => {
                                                let pageNum;
                                                if (purchases.last_page <= 5) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    purchases.current_page <= 3
                                                ) {
                                                    pageNum = i + 1;
                                                } else if (
                                                    purchases.current_page >=
                                                    purchases.last_page - 2
                                                ) {
                                                    pageNum =
                                                        purchases.last_page -
                                                        4 +
                                                        i;
                                                } else {
                                                    pageNum =
                                                        purchases.current_page -
                                                        2 +
                                                        i;
                                                }

                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => {
                                                            if (
                                                                pageNum !==
                                                                purchases.current_page
                                                            ) {
                                                                Inertia.get(
                                                                    route(
                                                                        "purchase-report.index"
                                                                    ),
                                                                    {
                                                                        ...filter,
                                                                        page: pageNum,
                                                                    }
                                                                );
                                                            }
                                                        }}
                                                        className={`w-8 h-8 text-xs font-medium rounded-md transition-all duration-200 ${
                                                            pageNum ===
                                                            purchases.current_page
                                                                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md transform scale-105"
                                                                : "text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                                                        }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>

                                    {purchases.current_page <
                                        purchases.last_page && (
                                        <button
                                            onClick={() => {
                                                const page =
                                                    purchases.current_page + 1;
                                                Inertia.get(
                                                    route(
                                                        "purchase-report.index"
                                                    ),
                                                    { ...filter, page }
                                                );
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-md transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                                        >
                                            <span className="hidden sm:inline">
                                                Next
                                            </span>
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
