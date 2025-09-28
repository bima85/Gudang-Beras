import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import PrintableDeliveryNote from "@/Components/PrintableDeliveryNote";
import usePrint from "@/Hooks/usePrint";
import { createRoot } from "react-dom/client";
import {
    ArrowLeft,
    Package,
    Truck,
    Clock,
    CheckCircle,
    XCircle,
    MapPin,
    User,
    FileText,
    Weight,
    Hash,
    Building,
    Store,
    Printer,
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

export default function Show({ deliveryNote }) {
    const { isPrinting, printElement } = usePrint();

    const handleStatusUpdate = (newStatus) => {
        router.patch(
            route("delivery-notes.updateStatus", deliveryNote.id),
            {
                status: newStatus,
            },
            {
                preserveScroll: true,
            }
        );
    };

    const handleMarkAsDelivered = () => {
        if (confirm("Apakah Anda yakin barang sudah sampai di toko?")) {
            router.patch(
                route("delivery-notes.markAsDelivered", deliveryNote.id),
                {},
                {
                    preserveScroll: true,
                }
            );
        }
    };

    const handleBack = () => {
        router.get(route("delivery-notes.index"));
    };

    const handlePrint = () => {
        // Create a temporary container for the printable component
        const printContainer = document.createElement("div");
        printContainer.id = "print-delivery-note";
        printContainer.style.position = "absolute";
        printContainer.style.left = "-9999px";
        document.body.appendChild(printContainer);

        // Render the printable component
        const root = createRoot(printContainer);
        root.render(<PrintableDeliveryNote deliveryNote={deliveryNote} />);

        // Wait a bit for rendering then print
        setTimeout(() => {
            printElement(
                "print-delivery-note",
                `Surat Jalan - ${deliveryNote.delivery_number}`
            );

            // Cleanup
            setTimeout(() => {
                document.body.removeChild(printContainer);
            }, 1000);
        }, 100);
    };

    const StatusBadge = ({ status }) => {
        const config = statusConfig[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
            <Badge
                variant="outline"
                className={`${config.color} font-medium text-base px-3 py-1`}
            >
                <Icon className="w-4 h-4 mr-2" />
                {config.label}
            </Badge>
        );
    };

    const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">{children}</CardContent>
        </Card>
    );

    return (
        <DashboardLayout>
            <Head
                title={`Detail Surat Jalan - ${deliveryNote.delivery_number}`}
            />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={handleBack} size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Kembali
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Detail Surat Jalan
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {deliveryNote.delivery_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <StatusBadge status={deliveryNote.status} />

                        {/* Print Button */}
                        <Button
                            onClick={handlePrint}
                            disabled={isPrinting}
                            variant="outline"
                            className="bg-white hover:bg-gray-50"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            {isPrinting ? "Mencetak..." : "Cetak Surat Jalan"}
                        </Button>

                        {/* Alternative: Print in new window */}
                        <Button
                            asChild
                            variant="outline"
                            className="bg-white hover:bg-gray-50"
                        >
                            <a
                                href={route(
                                    "delivery-notes.print",
                                    deliveryNote.id
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Printer className="w-4 h-4 mr-2" />
                                Print (New Window)
                            </a>
                        </Button>

                        {/* Action Buttons */}
                        {deliveryNote.status === "pending" && (
                            <Button
                                onClick={() => handleStatusUpdate("in_transit")}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Truck className="w-4 h-4 mr-2" />
                                Mulai Kirim
                            </Button>
                        )}

                        {deliveryNote.status === "in_transit" && (
                            <Button
                                onClick={handleMarkAsDelivered}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Sudah Sampai
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Delivery Info */}
                    <InfoCard icon={FileText} title="Informasi Surat Jalan">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Nomor Surat Jalan
                                </div>
                                <div className="font-semibold">
                                    {deliveryNote.delivery_number}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Tanggal Dibuat
                                </div>
                                <div className="font-semibold">
                                    {new Date(
                                        deliveryNote.created_at
                                    ).toLocaleDateString("id-ID")}
                                </div>
                            </div>
                            {deliveryNote.delivered_at && (
                                <div>
                                    <div className="text-sm text-gray-500 mb-1">
                                        Tanggal Dikirim
                                    </div>
                                    <div className="font-semibold">
                                        {new Date(
                                            deliveryNote.delivered_at
                                        ).toLocaleDateString("id-ID")}
                                    </div>
                                </div>
                            )}
                        </div>
                    </InfoCard>

                    {/* Product Info */}
                    <InfoCard icon={Package} title="Informasi Produk">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Nama Produk
                                </div>
                                <div className="font-semibold text-lg">
                                    {deliveryNote.product?.name}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Quantity Transfer
                                </div>
                                <div className="font-semibold text-xl text-blue-600 flex items-center gap-2">
                                    <Weight className="w-5 h-5" />
                                    {parseFloat(
                                        deliveryNote.qty_transferred
                                    ).toLocaleString("id-ID")}{" "}
                                    {deliveryNote.unit?.name || deliveryNote.unit?.symbol || ''}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Dalam Kilogram
                                </div>
                                <div className="font-semibold">
                                    {parseFloat(
                                        deliveryNote.qty_kg
                                    ).toLocaleString("id-ID")}{" "}
                                    kg
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Location Info */}
                    <InfoCard
                        icon={MapPin}
                        title="Transfer Route"
                        className="lg:col-span-2"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            {/* From Warehouse */}
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Building className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-blue-600 font-medium">
                                            Dari Gudang
                                        </div>
                                        <div className="font-semibold">
                                            {deliveryNote.warehouse?.name ||
                                                "Gudang"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Arrow */}
                            <div className="text-center">
                                <ArrowLeft className="w-8 h-8 text-gray-400 mx-auto rotate-180" />
                            </div>

                            {/* To Toko */}
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Store className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-green-600 font-medium">
                                            Ke Toko
                                        </div>
                                        <div className="font-semibold">
                                            {deliveryNote.toko?.name || "Toko"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Transaction Info */}
                    <InfoCard icon={Hash} title="Informasi Transaksi">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Invoice
                                </div>
                                <div className="font-semibold">
                                    {deliveryNote.transaction?.invoice || "N/A"}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500 mb-1">
                                    Pelanggan
                                </div>
                                <div className="font-semibold flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    {deliveryNote.transaction?.customer?.name ||
                                        "Umum"}
                                </div>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Status Timeline */}
                    <InfoCard icon={Clock} title="Timeline Status">
                        <div className="space-y-4">
                            {/* Created */}
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <div className="font-medium">
                                        Surat Jalan Dibuat
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(
                                            deliveryNote.created_at
                                        ).toLocaleDateString("id-ID")}
                                    </div>
                                </div>
                            </div>

                            {/* In Transit */}
                            {["in_transit", "delivered"].includes(
                                deliveryNote.status
                            ) && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-yellow-100 rounded-full">
                                            <Truck className="w-4 h-4 text-yellow-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                Dalam Perjalanan
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Barang sedang dikirim
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Delivered */}
                            {deliveryNote.status === "delivered" &&
                                deliveryNote.delivered_at && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-medium">
                                                Sudah Sampai
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(
                                                    deliveryNote.delivered_at
                                                ).toLocaleDateString("id-ID")}
                                            </div>
                                        </div>
                                    </div>
                                )}
                        </div>
                    </InfoCard>
                </div>

                {/* Notes */}
                {deliveryNote.notes && (
                    <InfoCard icon={FileText} title="Catatan">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700">
                                {deliveryNote.notes}
                            </p>
                        </div>
                    </InfoCard>
                )}
            </div>
        </DashboardLayout>
    );
}
