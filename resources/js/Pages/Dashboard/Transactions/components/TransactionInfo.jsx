import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { Info, MapPin, User, Calendar, Clock, Receipt } from "lucide-react";

export default function TransactionInfo({ location, auth, className }) {
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = currentDate.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <Card className={cn("h-fit", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="w-5 h-5 text-primary" />
                    Informasi Transaksi
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Date and Time */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span className="font-medium">Tanggal</span>
                        </div>
                        <p className="text-sm font-semibold">{formattedDate}</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">Waktu</span>
                        </div>
                        <p className="text-sm font-semibold">{formattedTime}</p>
                    </div>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Kasir</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                            {auth?.user?.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                            {auth?.user?.email}
                        </Badge>
                    </div>
                </div>

                {/* Location Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Lokasi</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                            {location || "Tidak diketahui"}
                        </p>
                        {location && (
                            <Badge variant="secondary" className="text-xs">
                                {location.toLowerCase().includes("toko")
                                    ? "Toko"
                                    : "Gudang"}
                            </Badge>
                        )}
                    </div>
                </div>

                {/* System Status Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Receipt className="w-4 h-4" />
                        <span className="font-medium">Status Sistem</span>
                    </div>
                    <div className="p-3 border border-green-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                Sistem Siap
                            </p>
                        </div>
                        <p className="mt-1 text-xs text-green-600 dark:text-green-500">
                            Transaksi dapat diproses dengan normal
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="pt-4 border-t">
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                            Aksi Cepat
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <a href={route("reports.transactions")}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs"
                                >
                                    <Receipt className="w-3 h-3 mr-1" />
                                    Riwayat
                                </Button>
                            </a>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                <Info className="w-3 h-3 mr-1" />
                                Bantuan
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
