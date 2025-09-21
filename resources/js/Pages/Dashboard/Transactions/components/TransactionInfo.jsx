import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { cn } from "@/lib/utils";
import {
    Info,
    MapPin,
    User,
    Calendar,
    Clock,
    Receipt,
    Hash,
} from "lucide-react";

export default function TransactionInfo({
    location,
    auth,
    className,
    selectedDate,
    transactionNumber,
    isLoadingSequence,
    onDateChange,
}) {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const currentDate = selectedDate || new Date();
    const formattedDate = currentDate.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = currentTime.toLocaleTimeString("id-ID", {
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
            <CardContent>
                <div className="mb-4">
                    <Card className="bg-blue-500 dark:bg-gray-900 w-fit ml-auto">
                        <div className="space-y-2 text-center py-3 px-4">
                            <div className="flex items-center gap-2 text-sm font-medium text-white">
                                <Clock className="w-4 h-4" />
                                Waktu Real-time
                            </div>
                            <p className="font-sans text-white text-sm font-semibold text-primary text-center">
                                {formattedTime}
                            </p>
                        </div>
                    </Card>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-5">
                    <Card className="bg-sky-400 dark:bg-gray-900">
                        <div className="space-y-2 text-center py-3">
                            <Label
                                htmlFor="transaction-location"
                                className="text-lg font-medium text-white flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-5 h-5" />
                                Lokasi
                            </Label>
                            <Input
                                id="transaction-location"
                                value={location}
                                className=" uppercase w-fit mx-auto p-2 border border-black-400 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800 text-center"
                                readOnly
                            />
                        </div>
                    </Card>
                    <Card className="bg-green-500 dark:bg-gray-900">
                        <div className="space-y-2 text-center py-3">
                            <Label
                                htmlFor="transaction-user"
                                className="text-lg font-medium text-white flex items-center justify-center gap-2"
                            >
                                <User className="w-5 h-5 " />
                                Kasir
                            </Label>
                            <Input
                                id="transaction-user"
                                value={auth?.user?.name}
                                className=" uppercase text-center w-fit mx-auto p-2 border border-black-400 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                                readOnly
                            />
                        </div>
                    </Card>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Card className="bg-yellow-400 dark:bg-gray-900 ">
                        <div className="space-y-2 text-center py-3">
                            <Label
                                htmlFor="transaction-date"
                                className="text-lg font-medium text-white flex items-center justify-center gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                Tanggal Transaksi
                            </Label>
                            <Input
                                id="transaction-date"
                                type="date"
                                value={
                                    selectedDate
                                        ? selectedDate
                                            .toISOString()
                                            .split("T")[0]
                                        : ""
                                }
                                onChange={(e) => {
                                    const newDate = new Date(e.target.value);
                                    if (onDateChange) {
                                        onDateChange(newDate);
                                    }
                                }}
                                className="w-fit mx-auto p-2 border border-red-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800"
                            />
                        </div>
                    </Card>
                    <Card className="bg-purple-500 dark:bg-gray-900">
                        <div className="space-y-2 text-center py-3">
                            <div className="flex items-center justify-center gap-2 text-lg font-medium text-white">
                                <Hash className="w-5 h-5 " />
                                No. Transaksi (Otomatis)
                            </div>
                            <div className="w-fit mx-auto p-2 border border-red-200 rounded-lg bg-green-50 dark:bg-green-950/20 dark:border-green-800">
                                <p className="font-mono text-lg font-semibold text-primary text-center">
                                    {isLoadingSequence
                                        ? "Memuat..."
                                        : transactionNumber ||
                                        "TRX-DD/MM/YYYY-001"}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
                {/* Real-time Clock */}

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
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
