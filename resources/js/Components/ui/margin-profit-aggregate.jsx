import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Label } from "@/Components/ui/label";

function formatRp(num) {
    const number = Number(num) || 0;
    if (isNaN(number)) return "Rp 0";
    const fraction = Math.abs(number - Math.trunc(number));
    const showDecimals = fraction > 0;
    return (
        "Rp " +
        number.toLocaleString("id-ID", {
            minimumFractionDigits: showDecimals ? 2 : 0,
            maximumFractionDigits: showDecimals ? 2 : 0,
        })
    );
}

export default function MarginProfitAggregate({ transactions = [] } = {}) {
    // Ensure transactions is an array
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    // Hitung total dari semua transaksi
    const totals = safeTransactions.reduce(
        (acc, trx) => {
            const details = trx.details || [];
            details.forEach((d) => {
                const purchase = parseFloat(d.purchase_price || d.cost || 0) || 0;
                const sell = parseFloat(d.price || d.selling_price || d.subtotal || 0) || 0;
                const qty = parseFloat(d.qty || d.quantity || 0) || 0;
                if (!isNaN(purchase) && !isNaN(sell) && !isNaN(qty)) {
                    acc.totalPurchase += purchase * qty;
                    acc.totalSell += sell * qty;
                }
            });
            return acc;
        },
        { totalPurchase: 0, totalSell: 0 }
    );

    const totalPurchase = isNaN(totals.totalPurchase) ? 0 : totals.totalPurchase;
    const totalSell = isNaN(totals.totalSell) ? 0 : totals.totalSell;
    const totalProfit = totalSell - totalPurchase;
    const marginPercent = totalSell > 0 ? (totalProfit / totalSell) * 100 : 0;

    return (
        <Card className="w-full md:w-96">
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Margin & Profit (Semua Transaksi)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Total Harga Beli</Label>
                            <div className="text-lg font-semibold">{formatRp(totalPurchase)}</div>
                        </div>
                        <div>
                            <Label>Total Harga Jual</Label>
                            <div className="text-lg font-semibold">{formatRp(totalSell)}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Total Profit</Label>
                            <div className="text-lg font-semibold text-green-600">{formatRp(totalProfit)}</div>
                        </div>
                        <div>
                            <Label>Margin (%)</Label>
                            <div className="text-lg font-semibold">{isNaN(marginPercent) ? "0.00" : marginPercent.toFixed(2)}%</div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <Badge variant={!isNaN(totalProfit) && totalProfit >= 0 ? "default" : "destructive"}>
                            {!isNaN(totalProfit) && totalProfit >= 0 ? "Profit" : "Loss"}
                        </Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}