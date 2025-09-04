import { useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
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
    Truck,
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    MapPin,
    User,
    FileText,
} from "lucide-react";

const statusConfig = {
    pending: {
        label: "Menunggu",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: Clock,
    },
    in_transit: {
        label: "Dalam Perjalanan",
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: Truck,
    },
    delivered: {
        label: "Sudah Dikirim",
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircle,
    },
    cancelled: {
        label: "Dibatalkan",
        color: "bg-red-100 text-red-800 border-red-200",
        icon: XCircle,
    },
};

export default function Index({ deliveryNotes, filters }) {
    const [search, setSearch] = useState(filters?.search || "");
    const [statusFilter, setStatusFilter] = useState(filters?.status || "");
    const [dateFrom, setDateFrom] = useState(filters?.date_from || "");
    const [dateTo, setDateTo] = useState(filters?.date_to || "");

    const handleSearch = () => {
        router.get(
            route("delivery-notes.index"),
            {
                search,
                status: statusFilter,
                date_from: dateFrom,
                date_to: dateTo,
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch("");
        setStatusFilter("");
        setDateFrom("");
        setDateTo("");
        router.get(route("delivery-notes.index"));
    };

    const handleStatusUpdate = (deliveryNoteId, newStatus) => {
        router.patch(
            route("delivery-notes.updateStatus", deliveryNoteId),
            {
                status: newStatus,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const handleMarkAsDelivered = (deliveryNoteId) => {
        if (confirm("Apakah Anda yakin barang sudah sampai di toko?")) {
            router.patch(
                route("delivery-notes.markAsDelivered", deliveryNoteId),
                {},
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.color} font-medium`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    return (
        <DashboardLayout>
            <Head title="Surat Jalan Otomatis" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Surat Jalan Otomatis
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola surat jalan transfer stok gudang ke toko
                        </p>
                    </div>
                </div>

                {/* Filter Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="w-5 h-5" />
                            Filter & Pencarian
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Cari</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="search"
                                        placeholder="No surat jalan, produk..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        className="pl-9"
                                        onKeyDown={(e) =>
                                            e.key === "Enter" && handleSearch()
                                        }
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={statusFilter}
                                    onValueChange={setStatusFilter}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">
                                            Semua Status
                                        </SelectItem>
                                        {Object.entries(statusConfig).map(
                                            ([key, config]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {config.label}
                                                </SelectItem>
                                            )
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_from">Dari Tanggal</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) =>
                                        setDateFrom(e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date_to">Sampai Tanggal</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={handleSearch}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Cari
                            </Button>
                            <Button variant="outline" onClick={handleReset}>
                                Reset
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Object.entries(statusConfig).map(([status, config]) => {
                        const count =
                            deliveryNotes.data?.filter(
                                (dn) => dn.status === status
                            ).length || 0;
                        const Icon = config.icon;

                        return (
                            <Card key={status}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">
                                                {config.label}
                                            </p>
                                            <p className="text-2xl font-bold">
                                                {count}
                                            </p>
                                        </div>
                                        <div
                                            className={`p-2 rounded-full ${config.color}`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Data Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Daftar Surat Jalan (
                            {deliveryNotes.data?.length || 0})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deliveryNotes.data?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                No Surat Jalan
                                            </TableHead>
                                            <TableHead>Transaksi</TableHead>
                                            <TableHead>Produk</TableHead>
                                            <TableHead>Gudang → Toko</TableHead>
                                            <TableHead>Qty Transfer</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {deliveryNotes.data.map(
                                            (deliveryNote) => (
                                                <TableRow key={deliveryNote.id}>
                                                    <TableCell className="font-medium">
                                                        {
                                                            deliveryNote.delivery_number
                                                        }
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {deliveryNote
                                                                    .transaction
                                                                    ?.invoice ||
                                                                    "N/A"}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                <User className="w-3 h-3" />
                                                                {deliveryNote
                                                                    .transaction
                                                                    ?.customer
                                                                    ?.name ||
                                                                    "Umum"}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">
                                                                {
                                                                    deliveryNote
                                                                        .product
                                                                        ?.name
                                                                }
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {
                                                                    deliveryNote
                                                                        .product
                                                                        ?.category
                                                                        ?.name
                                                                }
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <MapPin className="w-3 h-3 text-blue-500" />
                                                                {deliveryNote
                                                                    .warehouse
                                                                    ?.name ||
                                                                    "Gudang"}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-sm">
                                                                <Package className="w-3 h-3 text-green-500" />
                                                                {deliveryNote
                                                                    .toko
                                                                    ?.name ||
                                                                    "Toko"}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium">
                                                            {parseFloat(
                                                                deliveryNote.qty_transferred
                                                            ).toLocaleString(
                                                                "id-ID"
                                                            )}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {deliveryNote.unit}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={
                                                                deliveryNote.status
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="text-sm">
                                                                {new Date(
                                                                    deliveryNote.created_at
                                                                ).toLocaleDateString(
                                                                    "id-ID"
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {new Date(
                                                                    deliveryNote.created_at
                                                                ).toLocaleTimeString(
                                                                    "id-ID",
                                                                    {
                                                                        hour: "2-digit",
                                                                        minute: "2-digit",
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-2">
                                                            {deliveryNote.status ===
                                                                "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        handleStatusUpdate(
                                                                            deliveryNote.id,
                                                                            "in_transit"
                                                                        )
                                                                    }
                                                                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                                                >
                                                                    <Truck className="w-3 h-3 mr-1" />
                                                                    Kirim
                                                                </Button>
                                                            )}

                                                            {deliveryNote.status ===
                                                                "in_transit" && (
                                                                <Button
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() =>
                                                                        handleMarkAsDelivered(
                                                                            deliveryNote.id
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Sampai
                                                                </Button>
                                                            )}

                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={route(
                                                                        "delivery-notes.show",
                                                                        deliveryNote.id
                                                                    )}
                                                                    className="text-gray-600 hover:text-gray-900"
                                                                >
                                                                    <FileText className="w-3 h-3 mr-1" />
                                                                    Detail
                                                                </a>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Belum Ada Surat Jalan
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Surat jalan akan otomatis dibuat ketika
                                    terjadi transfer stok dari gudang ke toko.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination if needed */}
                {deliveryNotes.links && (
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {deliveryNotes.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? "default" : "outline"
                                    }
                                    size="sm"
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    disabled={!link.url}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
