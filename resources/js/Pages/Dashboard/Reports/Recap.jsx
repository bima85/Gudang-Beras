import React, { useState, useMemo } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage } from "@inertiajs/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    CalendarIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    DollarSignIcon,
    CreditCardIcon,
    ClockIcon,
    PiggyBankIcon,
    ShoppingCartIcon,
    ShoppingBagIcon,
    BarChart3Icon,
    FileDownIcon,
    FilterIcon,
    CheckCircleIcon,
    AlertCircleIcon,
} from "lucide-react";

export default function Recap({
    transactions,
    purchases = [],
    totalCash = 0,
    totalTempo = 0,
    totalDeposit = 0,
    totalPenjualan = 0,
    totalPembelian = 0,
    labaKotor = 0,
    persentaseLaba = 0,
    balancing = false,
    start_date = "",
    end_date = "",
    kategoriProduk = {},
    categories = [],
    subcategories = [],
    products = [],
}) {
    const { errors } = usePage().props;
    // debug logs removed
    const [start, setStart] = useState(start_date || "");
    const [end, setEnd] = useState(end_date || "");
    const [showAll, setShowAll] = useState(false);
    const [hppMode, setHppMode] = useState('history'); // 'history' | 'assume' | 'hide'
    const [assumedMargin, setAssumedMargin] = useState(20);

    const formatPrice = (num) => {
        const number = Number(num) || 0;
        const fraction = Math.abs(number - Math.trunc(number));
        const showDecimals = fraction > 0;
        return (
            "Rp " +
            number.toLocaleString("id-ID", {
                minimumFractionDigits: showDecimals ? 2 : 0,
                maximumFractionDigits: showDecimals ? 2 : 0,
            })
        );
    };
    const formatDate = (value) => {
        if (!value) return "-";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "-";
        return (
            d.toLocaleDateString("id-ID") +
            " " +
            d.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            })
        );
    };
    const formatRelative = (value) => {
        if (!value) return "-";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "-";
        const diff = Date.now() - d.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days} hari lalu`;
        if (hours > 0) return `${hours} jam lalu`;
        if (minutes > 0) return `${minutes} menit lalu`;
        return `${seconds} detik lalu`;
    };
    const formatPercent = (num) => (num || 0).toFixed(2) + "%";

    const getFirstNumeric = (obj, keys) => {
        if (!obj) return null;
        // first try to find a non-zero numeric value
        for (const k of keys) {
            const v = obj[k];
            if (v !== undefined && v !== null && !Number.isNaN(Number(v)) && Number(v) !== 0) {
                return Number(v);
            }
        }
        // fallback to any numeric (including zero)
        for (const k of keys) {
            const v = obj[k];
            if (v !== undefined && v !== null && !Number.isNaN(Number(v))) {
                return Number(v);
            }
        }
        return null;
    };

    const purchasePriceMap = useMemo(() => {
        const map = {};
        (purchases || []).forEach((p) => {
            (p.items || []).forEach((item) => {
                const pid = item.product_id || item.product?.id;
                if (!pid) return;
                const price = getFirstNumeric(item, ['harga_pembelian', 'purchase_price', 'price', 'cost', 'unit_price']);
                const qty = Number(item.qty || 0);
                if (!map[pid]) map[pid] = { qty: 0, total: 0 };
                map[pid].qty += qty;
                map[pid].total += price * qty;
            });
        });
        // also gather purchase-like prices from transaction details as fallback
        (transactions?.data || []).forEach((t) => {
            (t.details || []).forEach((d) => {
                const pid = d.product_id || d.product?.id;
                if (!pid) return;
                // treat transaction detail price as potential seller price; but also it's useful as fallback if no purchase data
                const price = getFirstNumeric(d, ['purchase_price', 'harga_pembelian', 'unit_cost', 'cost', 'price']);
                const qty = Number(d.qty || d.quantity || 0);
                if (!map[pid]) map[pid] = { qty: 0, total: 0 };
                map[pid].qty += qty;
                map[pid].total += price * qty;
            });
        });
        const out = {};
        Object.keys(map).forEach((k) => {
            const entry = map[k];
            out[k] = entry.qty > 0 ? entry.total / entry.qty : entry.total || 0;
        });
        return out;
    }, [purchases]);

    const findSalePriceFromTransactions = (productId) => {
        if (!transactions || !transactions.data) return 0;
        for (const t of transactions.data) {
            if (!t.details) continue;
            for (const d of t.details) {
                if ((d.product_id || d.product?.id) === productId) {
                    const p = getFirstNumeric(d, ['price', 'sell_price', 'harga_jual']);
                    if (p) return p;
                }
            }
        }
        return 0;
    };

    const resolveProductPrices = (product) => {
        const purchaseKeys = ['purchase_price', 'harga_beli', 'buy_price', 'purchasePrice', 'harga_pokok', 'cost'];
        const sellKeys = ['sell_price', 'harga_jual', 'sellPrice', 'selling_price', 'price'];
        let purchase = getFirstNumeric(product, purchaseKeys);
        let sell = getFirstNumeric(product, sellKeys);
        // treat null or zero as missing and try to find a better value
        if (sell === null || sell === 0) {
            const txPrice = findSalePriceFromTransactions(product.id);
            if (txPrice) sell = txPrice;
        }
        // if purchase missing or zero, try purchasePriceMap
        if (purchase === null || purchase === 0) {
            const mapped = purchasePriceMap[product.id];
            if (mapped !== undefined && mapped > 0) purchase = mapped;
            else purchase = null;
        }
        // if still not found and mode is 'assume', estimate from sell
        if ((purchase === null || purchase === 0) && hppMode === 'assume' && sell) {
            purchase = sell * (1 - (assumedMargin || 0) / 100);
        }
        // normalize nulls to 0 for display
        return { purchase: purchase || 0, sell: sell || 0 };
    };

    const resolveDetailPurchasePrice = (detail) => {
        const detailKeys = ['purchase_price', 'harga_beli', 'unit_cost', 'cost', 'harga_pokok'];
        const fromDetail = getFirstNumeric(detail, detailKeys);
        if (fromDetail !== null && fromDetail > 0) return fromDetail;
        const pid = detail.product_id || detail.product?.id;
        if (pid && purchasePriceMap[pid] && purchasePriceMap[pid] > 0) return purchasePriceMap[pid];
        const fromProduct = getFirstNumeric(detail.product || {}, ['purchase_price', 'harga_beli', 'buy_price', 'purchasePrice', 'harga_pokok', 'cost']);
        if (fromProduct !== null && fromProduct > 0) return fromProduct;
        return 0;
    };

    const handleFilter = (e) => {
        e.preventDefault();
        const params = { start_date: start, end_date: end };
        if (showAll) params.all = 1;
        router.get(route("dashboard.recap"), params);
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (start) params.append('start_date', start);
        if (end) params.append('end_date', end);
        if (showAll) params.append('all', '1');
        let csv = "Tanggal,Invoice,Kasir,Pelanggan,Total,Metode,Deposit\n";
        transactions.data.forEach((t) => {
            csv += `${formatDate(t.created_at)},${t.invoice},${t.cashier?.name || ""},${t.customer?.name || ""},${t.grand_total},${t.payment_method},${t.deposit_amount || 0}\n`;
        });
        const blob = new Blob([csv], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `rekap-transaksi.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <>
            <Head title="Laporan Laba Rugi & Rekapitulasi" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Laporan Laba Rugi & Rekapitulasi
                    </h1>
                    <p className="text-gray-600">
                        Analisis performa keuangan dan transaksi bisnis
                    </p>
                </div>

                {/* Filter Form */}
                <Card className="lg:w-auto w-full">
                    <CardContent className="p-4">
                        <form
                            onSubmit={handleFilter}
                            className="flex flex-col sm:flex-row gap-3 items-end"
                        >
                            <div className="space-y-2">
                                <Label htmlFor="start-date">
                                    Tanggal Mulai
                                </Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="start-date"
                                        type="date"
                                        value={start}
                                        onChange={(e) =>
                                            setStart(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="end-date">Tanggal Akhir</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="end-date"
                                        type="date"
                                        value={end}
                                        onChange={(e) => setEnd(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Button type="submit" className="w-full sm:w-auto">
                                <FilterIcon className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>

            {/* Laba Rugi Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Pendapatan */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Total Penjualan
                        </CardTitle>
                        <TrendingUpIcon className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {formatPrice(totalPenjualan)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Pendapatan kotor dari penjualan
                        </p>
                    </CardContent>
                </Card>

                {/* Pengeluaran */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Total Pembelian
                        </CardTitle>
                        <TrendingDownIcon className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {formatPrice(totalPembelian)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Harga pokok penjualan (HPP)
                        </p>
                    </CardContent>
                </Card>

                {/* Laba Rugi */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Laba Kotor
                        </CardTitle>
                        <BarChart3Icon
                            className={`h-4 w-4 ${labaKotor >= 0
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        />
                    </CardHeader>
                    <CardContent>
                        <div
                            className={`text-2xl font-bold ${labaKotor >= 0
                                ? "text-green-600"
                                : "text-red-600"
                                }`}
                        >
                            {formatPrice(labaKotor)}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Margin: {formatPercent(persentaseLaba)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Breakdown Penjualan */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Penjualan Cash
                        </CardTitle>
                        <DollarSignIcon className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatPrice(totalCash)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {totalPenjualan > 0
                                ? ((totalCash / totalPenjualan) * 100).toFixed(
                                    1
                                )
                                : 0}
                            %
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Penjualan Tempo
                        </CardTitle>
                        <ClockIcon className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatPrice(totalTempo)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {totalPenjualan > 0
                                ? ((totalTempo / totalPenjualan) * 100).toFixed(
                                    1
                                )
                                : 0}
                            %
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Total Deposit
                        </CardTitle>
                        <PiggyBankIcon className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {formatPrice(totalDeposit)}
                        </div>
                        <Badge variant="secondary" className="mt-2">
                            {totalPenjualan > 0
                                ? (
                                    (totalDeposit / totalPenjualan) *
                                    100
                                ).toFixed(1)
                                : 0}
                            %
                        </Badge>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base font-semibold">
                            Total Transaksi
                        </CardTitle>
                        <ShoppingCartIcon className="h-4 w-4 text-purple-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold">
                            {transactions.total}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                            Jumlah transaksi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Neraca Balancing Alert */}
            <Alert
                className={`mb-8 ${balancing
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                    }`}
            >
                <div className="flex items-center">
                    {balancing ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2" />
                    ) : (
                        <AlertCircleIcon className="h-4 w-4 text-red-600 mr-2" />
                    )}
                    <AlertDescription
                        className={
                            balancing ? "text-green-800" : "text-red-800"
                        }
                    >
                        <div className="font-semibold mb-2">
                            {balancing
                                ? "NERACA SEIMBANG ✓"
                                : "NERACA TIDAK SEIMBANG ⚠️"}
                        </div>
                        <div className="text-sm font-mono">
                            Cash + Deposit + Tempo = Total Penjualan
                        </div>
                        <div className="text-sm font-mono mt-1">
                            {formatPrice(totalCash)} +{" "}
                            {formatPrice(totalDeposit)} +{" "}
                            {formatPrice(totalTempo)} ={" "}
                            {formatPrice(totalPenjualan)}
                        </div>
                    </AlertDescription>
                </div>
            </Alert>

            {/* Export Button */}
            <div className="flex justify-end mb-6">
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 mr-2">
                        <label className="text-sm text-gray-600">HPP Mode:</label>
                        <select
                            value={hppMode}
                            onChange={(e) => setHppMode(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="history">History</option>
                            <option value="assume">Assume</option>
                            <option value="hide">Hide</option>
                        </select>
                        {hppMode === 'assume' && (
                            <input
                                type="number"
                                value={assumedMargin}
                                onChange={(e) => setAssumedMargin(Number(e.target.value))}
                                className="w-20 border rounded px-2 py-1 text-sm ml-2"
                                aria-label="Assumed margin %"
                            />
                        )}
                    </div>
                    <Button
                        onClick={() => {
                            setShowAll((s) => !s);
                            const params = new URLSearchParams();
                            if (start) params.append('start_date', start);
                            if (end) params.append('end_date', end);
                            if (!showAll) params.append('all', '1');
                            router.get(route('dashboard.recap'), Object.fromEntries(params.entries()));
                        }}
                        variant={showAll ? 'default' : 'outline'}
                    >
                        {showAll ? 'Tampilkan Terbatas' : 'Tampilkan Semua'}
                    </Button>
                    <Button
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (start) params.append('start_date', start);
                            if (end) params.append('end_date', end);
                            window.location = route('dashboard.recap.export-excel') + '?' + params.toString();
                        }}
                        variant="outline"
                    >
                        <FileDownIcon className="w-4 h-4 mr-2" />
                        Export Excel
                    </Button>
                    <Button
                        onClick={() => {
                            const params = new URLSearchParams();
                            if (start) params.append('start_date', start);
                            if (end) params.append('end_date', end);
                            window.open(route('dashboard.recap.export-pdf') + '?' + params.toString(), '_blank');
                        }}
                        variant="outline"
                    >
                        <FileDownIcon className="w-4 h-4 mr-2" />
                        Export PDF
                    </Button>
                    <Button onClick={handleExport} variant="outline">
                        <FileDownIcon className="w-4 h-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </div>
            {/* Tabel Transaksi */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ShoppingCartIcon className="h-5 w-5" />
                        Detail Transaksi Penjualan
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        No
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Tanggal
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Invoice
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Kasir
                                    </th>
                                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Pelanggan
                                    </th>
                                    <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                        Total
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        HPP
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Profit
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Metode
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deposit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {transactions.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-4 py-8 text-center text-gray-500"
                                        >
                                            Tidak ada transaksi ditemukan untuk
                                            periode ini
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.data.map((t, i) => (
                                        <tr
                                            key={t.id}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                {(transactions.current_page -
                                                    1) *
                                                    transactions.per_page +
                                                    i +
                                                    1}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                <div>{formatDate(t.created_at)}</div>
                                                <div className="text-xs text-muted-foreground">{formatRelative(t.created_at)}</div>
                                            </td>
                                            <td className="px-3 py-2">
                                                <Badge
                                                    variant="outline"
                                                    className="font-mono text-xs"
                                                >
                                                    {t.invoice}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                {t.cashier?.name || "-"}
                                            </td>
                                            <td className="px-3 py-2 text-sm text-gray-900">
                                                {t.customer?.name ||
                                                    "Walk-in Customer"}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                                                {formatPrice(t.grand_total)}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                                                {hppMode === 'hide' ? (
                                                    "-"
                                                ) : (
                                                    formatPrice(
                                                        (t.details || []).reduce((acc, d) => {
                                                            const purchasePrice = resolveDetailPurchasePrice(d) || 0;
                                                            return acc + purchasePrice * (d.qty || 0);
                                                        }, 0)
                                                    )
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                                                {(() => {
                                                    if (hppMode === 'hide') return "-";
                                                    const hpp = (t.details || []).reduce((acc, d) => {
                                                        const purchasePrice = resolveDetailPurchasePrice(d) || 0;
                                                        return acc + purchasePrice * (d.qty || 0);
                                                    }, 0);
                                                    const profit = t.grand_total - hpp;
                                                    if (hppMode === 'assume' && hpp === 0) {
                                                        // estimate hpp from assumed margin
                                                        const estimatedHpp = t.grand_total * (1 - (assumedMargin || 0) / 100);
                                                        return formatPrice(t.grand_total - estimatedHpp);
                                                    }
                                                    return formatPrice(profit);
                                                })()}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge
                                                    variant={
                                                        t.payment_method ===
                                                            "cash"
                                                            ? "default"
                                                            : t.payment_method ===
                                                                "tempo"
                                                                ? "secondary"
                                                                : t.payment_method ===
                                                                    "deposit"
                                                                    ? "outline"
                                                                    : "secondary"
                                                    }
                                                    className="text-xs"
                                                >
                                                    {t.payment_method === "cash"
                                                        ? "Cash"
                                                        : t.payment_method ===
                                                            "tempo"
                                                            ? "Tempo"
                                                            : t.payment_method ===
                                                                "deposit"
                                                                ? "Deposit"
                                                                : "-"}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                {t.is_deposit
                                                    ? formatPrice(
                                                        t.deposit_amount ?? 0
                                                    )
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {transactions.links && !showAll && (
                        <div className="px-4 py-3 border-t bg-gray-50">
                            <div className="flex justify-center gap-1">
                                {transactions.links.map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={
                                            link.active ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            link.url && router.get(link.url)
                                        }
                                        disabled={!link.url}
                                        className="min-w-[40px]"
                                    >
                                        {link.label.replace(
                                            /&laquo;|&raquo;|&lsaquo;|&rsaquo;/g,
                                            ""
                                        )}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabel Pembelian */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBagIcon className="h-5 w-5" />
                        Detail Transaksi Pembelian
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-[50px]">No</TableHead>
                                    <TableHead className="min-w-[100px]">Tanggal</TableHead>
                                    <TableHead className="min-w-[120px]">Invoice</TableHead>
                                    <TableHead className="min-w-[120px]">Supplier</TableHead>
                                    <TableHead className="min-w-[100px]">Gudang</TableHead>
                                    <TableHead className="min-w-[100px]">Toko</TableHead>
                                    <TableHead className="min-w-[150px]">Produk</TableHead>
                                    <TableHead className="min-w-[100px]">Kategori</TableHead>
                                    <TableHead className="min-w-[120px]">Subkategori</TableHead>
                                    <TableHead className="text-right min-w-[80px]">Qty</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Harga</TableHead>
                                    <TableHead className="text-right min-w-[120px]">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {purchases.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={12}
                                            className="h-24 text-center text-muted-foreground"
                                        >
                                            Tidak ada transaksi pembelian ditemukan untuk periode ini
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    purchases.map((p, purchaseIndex) => {
                                        const itemCount = p.items?.length || 0;
                                        return (
                                            <React.Fragment key={p.id}>
                                                {/* Purchase Header Row */}
                                                <TableRow className="bg-muted/30 border-b-2">
                                                    <TableCell className="font-semibold">
                                                        {purchaseIndex + 1}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {new Date(
                                                            p.purchase_date
                                                        ).toLocaleDateString("id-ID")}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant="outline"
                                                            className="font-mono text-xs font-semibold"
                                                        >
                                                            {p.invoice_number}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {p.supplier?.name || "-"}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {p.warehouse?.name || "-"}
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {p.toko?.name || "-"}
                                                    </TableCell>
                                                    <TableCell colSpan={6} className="bg-primary/5">
                                                        <div className="text-sm font-medium text-primary">
                                                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                                {/* Item Detail Rows */}
                                                {p.items && p.items.length > 0 ? (
                                                    p.items.map((item, itemIndex) => (
                                                        <TableRow
                                                            key={`${p.id}-${item.id}`}
                                                            className="hover:bg-muted/50 transition-colors"
                                                        >
                                                            <TableCell colSpan={6} className="pl-12 text-muted-foreground bg-muted/20">

                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {item.product?.name || "-"}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {item.product?.category_relation?.name || "-"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.product?.subcategory?.name || "-"}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono">
                                                                {item.qty || 0}
                                                            </TableCell>
                                                            <TableCell className="text-right font-mono">
                                                                {formatPrice(item.harga_pembelian)}
                                                            </TableCell>
                                                            <TableCell className="text-right font-semibold font-mono">
                                                                {formatPrice((item.qty || 0) * (item.harga_pembelian || 0))}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow className="hover:bg-muted/50 transition-colors">
                                                        <TableCell colSpan={6} className="pl-12 text-muted-foreground bg-muted/20">
                                                            <span className="text-sm">No items</span>
                                                        </TableCell>
                                                        <TableCell colSpan={6} className="text-muted-foreground italic">
                                                            Tidak ada item dalam pembelian ini
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                                {/* Summary row placed after item rows aligned with Subtotal column */}
                                                <TableRow className="bg-primary/5">
                                                    <TableCell colSpan={11} className="text-right pr-4 font-medium text-primary">
                                                        Total:
                                                    </TableCell>
                                                    <TableCell className="text-right font-semibold font-mono text-primary">
                                                        {formatPrice(p.total)}
                                                    </TableCell>
                                                </TableRow>
                                            </React.Fragment>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                        {purchases.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Tidak ada transaksi pembelian ditemukan untuk periode ini
                            </div>
                        ) : (
                            purchases.map((p, purchaseIndex) => (
                                <Card key={p.id} className="border-l-4 border-l-primary">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="font-mono">
                                                    {p.invoice_number}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">
                                                    #{purchaseIndex + 1}
                                                </span>
                                            </div>
                                            <Badge variant="secondary">
                                                {formatPrice(p.total)}
                                            </Badge>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Tanggal:</span>
                                                <div className="font-medium">
                                                    {new Date(p.purchase_date).toLocaleDateString("id-ID")}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Supplier:</span>
                                                <div className="font-medium">
                                                    {p.supplier?.name || "-"}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Gudang:</span>
                                                <div className="font-medium">
                                                    {p.warehouse?.name || "-"}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Toko:</span>
                                                <div className="font-medium">
                                                    {p.toko?.name || "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-0">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between border-t pt-3">
                                                <span className="text-sm font-medium">
                                                    {p.items?.length || 0} Item{p.items?.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                            {p.items && p.items.length > 0 ? (
                                                <div className="space-y-2">
                                                    {p.items.map((item, itemIndex) => (
                                                        <div
                                                            key={`${p.id}-${item.id}`}
                                                            className="bg-muted/30 rounded-lg p-3 space-y-2"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium">
                                                                    Item {itemIndex + 1}
                                                                </span>
                                                                <Badge variant="secondary" className="text-xs">
                                                                    {formatPrice((item.qty || 0) * (item.harga_pembelian || 0))}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-1 text-sm">
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Produk:</span>
                                                                    <span className="font-medium">{item.product?.name || "-"}</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Kategori:</span>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        {item.product?.category_relation?.name || "-"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Subkategori:</span>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {item.product?.subcategory?.name || "-"}
                                                                    </Badge>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-muted-foreground">Qty × Harga:</span>
                                                                    <span className="font-mono">
                                                                        {item.qty || 0} × {formatPrice(item.harga_pembelian)}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-4 text-muted-foreground italic">
                                                    Tidak ada item dalam pembelian ini
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Rekap Kategori Produk */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3Icon className="h-5 w-5" />
                        Rekap Kategori Produk Terjual
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori Produk
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Quantity Terjual
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Persentase
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(kategoriProduk).length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="px-4 py-8 text-center text-gray-500"
                                        >
                                            Tidak ada data kategori produk
                                        </td>
                                    </tr>
                                ) : (
                                    (() => {
                                        const totalQty = Object.values(
                                            kategoriProduk
                                        ).reduce((a, b) => a + b, 0);
                                        return Object.entries(kategoriProduk)
                                            .sort(([, a], [, b]) => b - a) // Sort by quantity descending
                                            .map(([cat, qty], i) => (
                                                <tr
                                                    key={i}
                                                    className="hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                        {cat}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-right text-gray-900">
                                                        {qty.toLocaleString(
                                                            "id-ID"
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <Badge variant="secondary">
                                                            {totalQty > 0
                                                                ? (
                                                                    (qty /
                                                                        totalQty) *
                                                                    100
                                                                ).toFixed(1)
                                                                : 0}
                                                            %
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ));
                                    })()
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Daftar Produk */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3Icon className="h-5 w-5" />
                        Daftar Produk ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                    <div className="overflow-x-auto -mx-2 px-2">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Produk</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subkategori</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Beli</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Jual</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-4 py-8 text-center text-gray-500">Tidak ada produk ditemukan</td>
                                    </tr>
                                ) : (
                                    products.map((product, i) => {
                                        const qty = product.stock ?? product.qty ?? product.quantity ?? 0;
                                        const prices = resolveProductPrices(product);
                                        const profitPerUnit = (prices.sell || 0) - (prices.purchase || 0);
                                        const totalProfit = profitPerUnit * qty;
                                        return (
                                            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-3 py-2 text-sm text-gray-800">
                                                    <div className="text-sm">{formatDate(product.created_at)}</div>
                                                    <div className="text-xs text-muted-foreground">{formatRelative(product.created_at)}</div>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-gray-800">{product.barcode || "-"}</td>
                                                <td className="px-3 py-2 text-sm font-medium text-gray-900">{product.name}</td>
                                                <td className="px-3 py-2 text-sm text-gray-800">{product.category_relation?.name || "-"}</td>
                                                <td className="px-3 py-2 text-sm text-gray-800">{product.subcategory?.name || "-"}</td>
                                                <td className="px-3 py-2 text-sm text-right font-mono text-sm text-gray-800">{formatPrice(prices.purchase)}</td>
                                                <td className="px-3 py-2 text-sm text-right font-mono text-sm text-gray-800">{formatPrice(prices.sell)}</td>
                                                <td className="px-3 py-2 text-sm text-right font-mono text-sm text-gray-800">{qty.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-sm text-right font-mono text-sm text-gray-800">{formatPrice(profitPerUnit)}</td>
                                                <td className="px-3 py-2 text-sm text-right font-mono text-sm text-gray-800">{formatPrice(totalProfit)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    );
}

Recap.layout = (page) => <DashboardLayout children={page} />;
