import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, router, usePage, Link } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import BackToDashboard from "@/Components/Dashboard/BackToDashboard";
import { toast } from "sonner";
import Swal from "sweetalert2";
import axios from "axios";
import { cn } from "@/lib/utils";
import {
    FileText,
    Download,
    Search,
    Filter,
    MoreHorizontal,
    Edit,
    Trash2,
    Eye,
    Calendar,
    User,
    DollarSign,
    Receipt,
    RefreshCw,
    ChevronDown,
    ChevronRight,
    AlertTriangle,
    CheckCircle,
    Clock,
    Printer,
} from "lucide-react";

export default function TransactionsShadcn({
    transactions = { data: [] },
    cashiers = [],
    customers = [],
    filters = {},
    warehouses = [],
}) {
    const page = usePage();
    const { flash } = page.props;

    // Flash message handling
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    // State management
    const [dateFrom, setDateFrom] = useState(filters.date_from || "");
    const [dateTo, setDateTo] = useState(filters.date_to || "");
    const [cashierId, setCashierId] = useState(filters.cashier_id || "all");
    const [customerId, setCustomerId] = useState(filters.customer_id || "all");
    const [warehouseId, setWarehouseId] = useState(
        filters.warehouse_id || "all"
    );
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [isLoading, setIsLoading] = useState(false);
    const [expandedGroups, setExpandedGroups] = useState({});
    const [expandedTransactions, setExpandedTransactions] = useState({});
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Helper functions
    const formatPrice = (value) => {
        const cleanedValue = parseFloat(value) || 0;
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
        }).format(cleanedValue);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: {
                variant: "default",
                label: "Selesai",
                icon: CheckCircle,
            },
            pending: { variant: "secondary", label: "Pending", icon: Clock },
            cancelled: {
                variant: "destructive",
                label: "Dibatalkan",
                icon: AlertTriangle,
            },
        };

        const config = statusConfig[status] || statusConfig.completed;
        const Icon = config.icon;

        return (
            <Badge variant={config.variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    // Filter and search functions
    const applyFilters = () => {
        setIsLoading(true);

        const params = {
            date_from: dateFrom,
            date_to: dateTo,
            cashier_id: cashierId === "all" ? "" : cashierId,
            customer_id: customerId === "all" ? "" : customerId,
            warehouse_id: warehouseId === "all" ? "" : warehouseId,
            search: searchTerm,
        };

        // Remove empty params
        Object.keys(params).forEach((key) => {
            if (!params[key]) delete params[key];
        });

        router.get(route("reports.transactions"), params, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const resetFilters = () => {
        setDateFrom("");
        setDateTo("");
        setCashierId("all");
        setCustomerId("all");
        setWarehouseId("all");
        setSearchTerm("");

        router.get(
            route("reports.transactions"),
            {},
            {
                preserveState: true,
            }
        );
    };

    // CRUD operations
    const handleEdit = (transaction) => {
        // For now, navigate to main transaction page
        // TODO: Add proper edit route when available
        router.visit(`/dashboard/transactions`);
    };

    const handleDelete = async (transaction) => {
        setSelectedTransaction(transaction);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedTransaction) return;

        setIsDeleting(true);
        try {
            await axios.delete(
                `/dashboard/transactions/${selectedTransaction.id}`
            );
            toast.success("Transaksi berhasil dihapus");
            setShowDeleteDialog(false);
            setSelectedTransaction(null);

            // Refresh data
            router.reload({ only: ["transactions"] });
        } catch (error) {
            console.error("Delete error:", error);
            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors) {
                    const errorMessages = Object.values(errors)
                        .flat()
                        .join(", ");
                    toast.error(`Validasi gagal: ${errorMessages}`);
                } else {
                    toast.error("Data tidak valid untuk dihapus");
                }
            } else {
                toast.error("Gagal menghapus transaksi");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleView = (transaction) => {
        setSelectedTransaction(transaction);
        setShowViewDialog(true);
    };

    const handlePrint = (transaction) => {
        // Open print page in new window/tab using transaction ID to avoid URL encoding issues
        window.open(
            route("transactions.print.id", { id: transaction.id }),
            "_blank"
        );
    };

    // Export functions
    const exportToExcel = () => {
        window.open(
            `/dashboard/reports/transactions/export/excel?${new URLSearchParams(
                filters
            ).toString()}`
        );
    };

    const exportToPdf = () => {
        window.open(
            `/dashboard/reports/transactions/export/pdf?${new URLSearchParams(
                filters
            ).toString()}`
        );
    };

    // Group transactions by customer
    const groupTransactionsByCustomer = () => {
        const grouped = {};
        transactions.data.forEach((transaction) => {
            const customerName = transaction.customer?.name || "Pelanggan Umum";
            if (!grouped[customerName]) {
                grouped[customerName] = [];
            }
            grouped[customerName].push(transaction);
        });
        return grouped;
    };

    const toggleGroup = (customerName) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [customerName]: !prev[customerName],
        }));
    };

    const toggleTransaction = (transactionId) => {
        setExpandedTransactions((prev) => ({
            ...prev,
            [transactionId]: !prev[transactionId],
        }));
    };

    // Calculate totals
    const calculateTotals = () => {
        return transactions.data.reduce(
            (acc, transaction) => {
                acc.totalTransactions += 1;
                acc.totalAmount += parseFloat(transaction.grand_total) || 0;
                return acc;
            },
            { totalTransactions: 0, totalAmount: 0 }
        );
    };

    const totals = calculateTotals();
    const groupedTransactions = groupTransactionsByCustomer();

    return (
        <DashboardLayout>
            <Head title="Laporan Transaksi" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Laporan Transaksi
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola dan pantau semua transaksi penjualan
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={exportToExcel}>
                            <Download className="w-4 h-4 mr-2" />
                            Excel
                        </Button>
                        <Button variant="outline" onClick={exportToPdf}>
                            <Download className="w-4 h-4 mr-2" />
                            PDF
                        </Button>
                        <BackToDashboard />
                    </div>
                </div>

                {/* Filter Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {/* Date From */}
                            <div className="space-y-2">
                                <Label htmlFor="dateFrom">Tanggal Mulai</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                />
                            </div>

                            {/* Date To */}
                            <div className="space-y-2">
                                <Label htmlFor="dateTo">Tanggal Selesai</Label>
                                <Input
                                    id="dateTo"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            {/* Cashier Filter */}
                            <div className="space-y-2">
                                <Label>Kasir</Label>
                                <Select
                                    value={cashierId}
                                    onValueChange={setCashierId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kasir" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Kasir
                                        </SelectItem>
                                        {cashiers.map((cashier) => (
                                            <SelectItem
                                                key={cashier.id}
                                                value={cashier.id.toString()}
                                            >
                                                {cashier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Customer Filter */}
                            <div className="space-y-2">
                                <Label>Pelanggan</Label>
                                <Select
                                    value={customerId}
                                    onValueChange={setCustomerId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih pelanggan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Semua Pelanggan
                                        </SelectItem>
                                        {customers.map((customer) => (
                                            <SelectItem
                                                key={customer.id}
                                                value={customer.id.toString()}
                                            >
                                                {customer.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Warehouse Filter */}
                            {warehouses && warehouses.length > 0 && (
                                <div className="space-y-2">
                                    <Label>Gudang</Label>
                                    <Select
                                        value={warehouseId}
                                        onValueChange={setWarehouseId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih gudang" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">
                                                Semua Gudang
                                            </SelectItem>
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
                            )}

                            {/* Search */}
                            <div className="space-y-2">
                                <Label htmlFor="search">Pencarian</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Cari nomor transaksi..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button onClick={applyFilters} disabled={isLoading}>
                                {isLoading ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4 mr-2" />
                                )}
                                {isLoading ? "Memuat..." : "Terapkan Filter"}
                            </Button>
                            <Button variant="outline" onClick={resetFilters}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Total Transaksi
                            </CardTitle>
                            <Receipt className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {totals.totalTransactions}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                transaksi ditemukan
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Total Penjualan
                            </CardTitle>
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatPrice(totals.totalAmount)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                dari semua transaksi
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">
                                Rata-rata Transaksi
                            </CardTitle>
                            <User className="w-4 h-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {formatPrice(
                                    totals.totalTransactions > 0
                                        ? totals.totalAmount /
                                              totals.totalTransactions
                                        : 0
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                per transaksi
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Data Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <Alert>
                                <AlertTriangle className="w-4 h-4" />
                                <AlertDescription>
                                    Tidak ada data transaksi ditemukan. Silakan
                                    ubah filter atau tambah transaksi baru.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedTransactions).map(
                                    ([customerName, customerTransactions]) => (
                                        <div
                                            key={customerName}
                                            className="border rounded-lg"
                                        >
                                            {/* Customer Group Header */}
                                            <div
                                                className="flex items-center justify-between p-4 transition-colors cursor-pointer bg-muted/50 hover:bg-muted/70"
                                                onClick={() =>
                                                    toggleGroup(customerName)
                                                }
                                            >
                                                <div className="flex items-center gap-3">
                                                    {expandedGroups[
                                                        customerName
                                                    ] ? (
                                                        <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                    <User className="w-4 h-4" />
                                                    <span className="font-semibold">
                                                        {customerName}
                                                    </span>
                                                    <Badge variant="secondary">
                                                        {
                                                            customerTransactions.length
                                                        }{" "}
                                                        transaksi
                                                    </Badge>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {formatPrice(
                                                        customerTransactions.reduce(
                                                            (sum, t) =>
                                                                sum +
                                                                (parseFloat(
                                                                    t.grand_total
                                                                ) || 0),
                                                            0
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Customer Transactions */}
                                            {expandedGroups[customerName] && (
                                                <div className="border-t">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead className="w-[50px]">
                                                                    Detail
                                                                </TableHead>
                                                                <TableHead>
                                                                    Tanggal
                                                                </TableHead>
                                                                <TableHead>
                                                                    No.
                                                                    Transaksi
                                                                </TableHead>
                                                                <TableHead>
                                                                    Kasir
                                                                </TableHead>
                                                                <TableHead>
                                                                    Total
                                                                </TableHead>
                                                                <TableHead>
                                                                    Kembalian
                                                                </TableHead>
                                                                <TableHead>
                                                                    Status
                                                                </TableHead>
                                                                <TableHead className="w-[100px]">
                                                                    Aksi
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {customerTransactions.map(
                                                                (
                                                                    transaction
                                                                ) => (
                                                                    <React.Fragment
                                                                        key={
                                                                            transaction.id
                                                                        }
                                                                    >
                                                                        <TableRow>
                                                                            <TableCell>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    onClick={() =>
                                                                                        toggleTransaction(
                                                                                            transaction.id
                                                                                        )
                                                                                    }
                                                                                >
                                                                                    {expandedTransactions[
                                                                                        transaction
                                                                                            .id
                                                                                    ] ? (
                                                                                        <ChevronDown className="w-4 h-4" />
                                                                                    ) : (
                                                                                        <ChevronRight className="w-4 h-4" />
                                                                                    )}
                                                                                </Button>
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatDate(
                                                                                    transaction.created_at
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell className="font-medium">
                                                                                {transaction.transaction_number ||
                                                                                    `TRX-${transaction.id}`}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {transaction
                                                                                    .cashier
                                                                                    ?.name ||
                                                                                    "-"}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatPrice(
                                                                                    transaction.grand_total
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {formatPrice(
                                                                                    transaction.change ||
                                                                                        0
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                {getStatusBadge(
                                                                                    transaction.status ||
                                                                                        "completed"
                                                                                )}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <DropdownMenu>
                                                                                    <DropdownMenuTrigger
                                                                                        asChild
                                                                                    >
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            className="w-8 h-8 p-0"
                                                                                        >
                                                                                            <span className="sr-only">
                                                                                                Open
                                                                                                menu
                                                                                            </span>
                                                                                            <MoreHorizontal className="w-4 h-4" />
                                                                                        </Button>
                                                                                    </DropdownMenuTrigger>
                                                                                    <DropdownMenuContent align="end">
                                                                                        <DropdownMenuLabel>
                                                                                            Aksi
                                                                                        </DropdownMenuLabel>
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                handleView(
                                                                                                    transaction
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Eye className="w-4 h-4 mr-2" />
                                                                                            Lihat
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                handleEdit(
                                                                                                    transaction
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Edit className="w-4 h-4 mr-2" />
                                                                                            Edit
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                handlePrint(
                                                                                                    transaction
                                                                                                )
                                                                                            }
                                                                                        >
                                                                                            <Printer className="w-4 h-4 mr-2" />
                                                                                            Cetak
                                                                                            Nota
                                                                                        </DropdownMenuItem>
                                                                                        <DropdownMenuSeparator />
                                                                                        <DropdownMenuItem
                                                                                            onClick={() =>
                                                                                                handleDelete(
                                                                                                    transaction
                                                                                                )
                                                                                            }
                                                                                            className="text-destructive"
                                                                                        >
                                                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                                                            Hapus
                                                                                        </DropdownMenuItem>
                                                                                    </DropdownMenuContent>
                                                                                </DropdownMenu>
                                                                            </TableCell>
                                                                        </TableRow>

                                                                        {/* Detail Transaction Row */}
                                                                        {expandedTransactions[
                                                                            transaction
                                                                                .id
                                                                        ] && (
                                                                            <TableRow>
                                                                                <TableCell
                                                                                    colSpan={
                                                                                        8
                                                                                    }
                                                                                    className="p-0 bg-muted/20"
                                                                                >
                                                                                    <div className="p-4 space-y-4">
                                                                                        {/* Transaction Info */}
                                                                                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                                                            <div>
                                                                                                <Label className="text-xs font-medium text-muted-foreground">
                                                                                                    Cash
                                                                                                </Label>
                                                                                                <p className="text-sm font-medium">
                                                                                                    {formatPrice(
                                                                                                        transaction.cash ||
                                                                                                            0
                                                                                                    )}
                                                                                                </p>
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label className="text-xs font-medium text-muted-foreground">
                                                                                                    Diskon
                                                                                                </Label>
                                                                                                <p className="text-sm font-medium">
                                                                                                    {formatPrice(
                                                                                                        transaction.discount ||
                                                                                                            0
                                                                                                    )}
                                                                                                </p>
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label className="text-xs font-medium text-muted-foreground">
                                                                                                    Total
                                                                                                    Bayar
                                                                                                </Label>
                                                                                                <p className="text-sm font-medium">
                                                                                                    {formatPrice(
                                                                                                        transaction.grand_total
                                                                                                    )}
                                                                                                </p>
                                                                                            </div>
                                                                                            <div>
                                                                                                <Label className="text-xs font-medium text-muted-foreground">
                                                                                                    Kembalian
                                                                                                </Label>
                                                                                                <p className="text-sm font-medium text-green-600">
                                                                                                    {formatPrice(
                                                                                                        transaction.change ||
                                                                                                            0
                                                                                                    )}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Products Detail */}
                                                                                        {transaction.details &&
                                                                                            transaction
                                                                                                .details
                                                                                                .length >
                                                                                                0 && (
                                                                                                <div>
                                                                                                    <Label className="block mb-2 text-sm font-medium">
                                                                                                        Detail
                                                                                                        Produk
                                                                                                        (
                                                                                                        {
                                                                                                            transaction
                                                                                                                .details
                                                                                                                .length
                                                                                                        }{" "}
                                                                                                        item)
                                                                                                    </Label>
                                                                                                    <div className="border rounded-md bg-background">
                                                                                                        <Table>
                                                                                                            <TableHeader>
                                                                                                                <TableRow>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Kategori
                                                                                                                    </TableHead>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Sub
                                                                                                                        Kategori
                                                                                                                    </TableHead>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Nama
                                                                                                                        Produk
                                                                                                                    </TableHead>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Unit
                                                                                                                    </TableHead>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Qty
                                                                                                                    </TableHead>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Harga
                                                                                                                    </TableHead>
                                                                                                                    <TableHead className="text-xs">
                                                                                                                        Subtotal
                                                                                                                    </TableHead>
                                                                                                                </TableRow>
                                                                                                            </TableHeader>
                                                                                                            <TableBody>
                                                                                                                {transaction.details.map(
                                                                                                                    (
                                                                                                                        detail,
                                                                                                                        index
                                                                                                                    ) => (
                                                                                                                        <TableRow
                                                                                                                            key={
                                                                                                                                index
                                                                                                                            }
                                                                                                                        >
                                                                                                                            <TableCell className="text-xs">
                                                                                                                                <Badge
                                                                                                                                    variant="outline"
                                                                                                                                    className="text-xs"
                                                                                                                                >
                                                                                                                                    {detail
                                                                                                                                        .product
                                                                                                                                        ?.category
                                                                                                                                        ?.name ||
                                                                                                                                        "-"}
                                                                                                                                </Badge>
                                                                                                                            </TableCell>
                                                                                                                            <TableCell className="text-xs">
                                                                                                                                <Badge
                                                                                                                                    variant="secondary"
                                                                                                                                    className="text-xs"
                                                                                                                                >
                                                                                                                                    {detail
                                                                                                                                        .product
                                                                                                                                        ?.subcategory
                                                                                                                                        ?.name ||
                                                                                                                                        "-"}
                                                                                                                                </Badge>
                                                                                                                            </TableCell>
                                                                                                                            <TableCell className="text-xs font-medium">
                                                                                                                                {detail
                                                                                                                                    .product
                                                                                                                                    ?.name ||
                                                                                                                                    "-"}
                                                                                                                            </TableCell>
                                                                                                                            <TableCell className="text-xs">
                                                                                                                                <Badge
                                                                                                                                    variant="outline"
                                                                                                                                    className="text-xs"
                                                                                                                                >
                                                                                                                                    {detail
                                                                                                                                        .unit
                                                                                                                                        ?.name ||
                                                                                                                                        "-"}
                                                                                                                                </Badge>
                                                                                                                            </TableCell>
                                                                                                                            <TableCell className="text-xs font-medium">
                                                                                                                                {
                                                                                                                                    detail.qty
                                                                                                                                }
                                                                                                                            </TableCell>
                                                                                                                            <TableCell className="text-xs">
                                                                                                                                {formatPrice(
                                                                                                                                    detail.price
                                                                                                                                )}
                                                                                                                            </TableCell>
                                                                                                                            <TableCell className="text-xs font-semibold">
                                                                                                                                {formatPrice(
                                                                                                                                    detail.qty *
                                                                                                                                        detail.price
                                                                                                                                )}
                                                                                                                            </TableCell>
                                                                                                                        </TableRow>
                                                                                                                    )
                                                                                                                )}
                                                                                                            </TableBody>
                                                                                                        </Table>
                                                                                                    </div>
                                                                                                </div>
                                                                                            )}
                                                                                    </div>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        )}
                                                                    </React.Fragment>
                                                                )
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.links && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Menampilkan {transactions.from || 0} sampai{" "}
                                    {transactions.to || 0} dari{" "}
                                    {transactions.total || 0} transaksi
                                </div>
                                <div className="flex items-center space-x-2">
                                    {transactions.links.map((link, index) => (
                                        <Button
                                            key={index}
                                            variant={
                                                link.active
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url)
                                            }
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Transaksi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus transaksi{" "}
                            <strong>
                                {selectedTransaction?.transaction_number ||
                                    `TRX-${selectedTransaction?.id}`}
                            </strong>
                            ?
                            <br />
                            Tindakan ini tidak dapat dibatalkan dan akan
                            menghapus semua data terkait.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Menghapus...
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Hapus
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Transaction Dialog */}
            <AlertDialog open={showViewDialog} onOpenChange={setShowViewDialog}>
                <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Detail Transaksi</AlertDialogTitle>
                        <AlertDialogDescription>
                            Informasi lengkap transaksi{" "}
                            <strong>
                                {selectedTransaction?.transaction_number ||
                                    `TRX-${selectedTransaction?.id}`}
                            </strong>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    {selectedTransaction && (
                        <div className="space-y-6">
                            {/* Transaction Summary */}
                            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg md:grid-cols-4 bg-muted/20">
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Tanggal
                                    </Label>
                                    <p className="text-sm font-medium">
                                        {formatDate(
                                            selectedTransaction.created_at
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Kasir
                                    </Label>
                                    <p className="text-sm font-medium">
                                        {selectedTransaction.cashier?.name ||
                                            "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Pelanggan
                                    </Label>
                                    <p className="text-sm font-medium">
                                        {selectedTransaction.customer?.name ||
                                            "-"}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Status
                                    </Label>
                                    <div>
                                        {getStatusBadge(
                                            selectedTransaction.status ||
                                                "completed"
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg md:grid-cols-4">
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Cash
                                    </Label>
                                    <p className="text-sm font-medium">
                                        {formatPrice(
                                            selectedTransaction.cash || 0
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Diskon
                                    </Label>
                                    <p className="text-sm font-medium">
                                        {formatPrice(
                                            selectedTransaction.discount || 0
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Total Bayar
                                    </Label>
                                    <p className="text-lg font-medium">
                                        {formatPrice(
                                            selectedTransaction.grand_total
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-xs font-medium text-muted-foreground">
                                        Kembalian
                                    </Label>
                                    <p className="text-sm font-medium text-green-600">
                                        {formatPrice(
                                            selectedTransaction.change || 0
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Products Detail */}
                            {selectedTransaction.details &&
                                selectedTransaction.details.length > 0 && (
                                    <div>
                                        <Label className="block mb-3 text-sm font-medium">
                                            Detail Produk (
                                            {selectedTransaction.details.length}{" "}
                                            item)
                                        </Label>
                                        <div className="border rounded-lg bg-background">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Kategori
                                                        </TableHead>
                                                        <TableHead>
                                                            Sub Kategori
                                                        </TableHead>
                                                        <TableHead>
                                                            Nama Produk
                                                        </TableHead>
                                                        <TableHead>
                                                            Unit
                                                        </TableHead>
                                                        <TableHead>
                                                            Qty
                                                        </TableHead>
                                                        <TableHead>
                                                            Harga
                                                        </TableHead>
                                                        <TableHead>
                                                            Subtotal
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {selectedTransaction.details.map(
                                                        (detail, index) => (
                                                            <TableRow
                                                                key={index}
                                                            >
                                                                <TableCell>
                                                                    <Badge variant="outline">
                                                                        {detail
                                                                            .product
                                                                            ?.category
                                                                            ?.name ||
                                                                            "-"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="secondary">
                                                                        {detail
                                                                            .product
                                                                            ?.subcategory
                                                                            ?.name ||
                                                                            "-"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {detail
                                                                        .product
                                                                        ?.name ||
                                                                        "-"}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">
                                                                        {detail
                                                                            .unit
                                                                            ?.name ||
                                                                            "-"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="font-medium">
                                                                    {detail.qty}
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatPrice(
                                                                        detail.price
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="font-semibold">
                                                                    {formatPrice(
                                                                        detail.qty *
                                                                            detail.price
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel>Tutup</AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DashboardLayout>
    );
}
