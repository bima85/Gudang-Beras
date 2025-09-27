import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";

function formatRp(num) {
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
}

export default function MarginProfit({ purchase = 0, sell = 0, qty = 1, onChange } = {}) {
    const purchaseVal = Number(purchase) || 0;
    const sellVal = Number(sell) || 0;
    const qtyVal = Number(qty) || 1;

    const profitPerUnit = sellVal - purchaseVal;
    const totalProfit = profitPerUnit * qtyVal;
    const marginPercent = sellVal ? ((profitPerUnit / sellVal) * 100) : 0;

    useEffect(() => {
        if (typeof onChange === 'function') {
            onChange({ purchase: purchaseVal, sell: sellVal, qty: qtyVal, profitPerUnit, totalProfit, marginPercent });
        }
    }, [purchaseVal, sellVal, qtyVal]);

    return (
        <Card className="w-full md:w-96">
            <CardHeader>
                <CardTitle className="text-sm font-semibold">Margin & Profit</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <Label>Harga Beli</Label>
                            <div className="text-sm">{formatRp(purchaseVal)}</div>
                        </div>
                        <div>
                            <Label>Harga Jual</Label>
                            <div className="text-sm">{formatRp(sellVal)}</div>
                        </div>
                        <div>
                            <Label>Qty</Label>
                            <div className="text-sm">{qtyVal}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label>Profit / Unit</Label>
                            <div className="text-lg font-semibold">{formatRp(profitPerUnit)}</div>
                        </div>
                        <div>
                            <Label>Total Profit</Label>
                            <div className="text-lg font-semibold">{formatRp(totalProfit)}</div>
                        </div>
                    </div>

                    <div>
                        <Label>Margin (%)</Label>
                        <div className="text-sm font-medium">{Number.isFinite(marginPercent) ? marginPercent.toFixed(2) : '0.00'}%</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
