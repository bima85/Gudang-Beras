import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Checkbox } from "@/Components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/Components/ui/select";
import { Textarea } from "@/Components/ui/textarea";
import { cn } from "@/lib/utils";
import { CreditCard, DollarSign, Receipt, User, PiggyBank } from "lucide-react";

export default function PaymentSection({
    carts_total,
    cash,
    setCash,
    discount,
    setDiscount,
    selectedCustomer,
    setSelectedCustomer,
    customers,
    notes,
    setNotes,
    useChangeAsDeposit,
    setUseChangeAsDeposit,
    depositAmount,
    setDepositAmount,
    processTransaction,
    isProcessingTransaction,
    openCustomerModal,
    className,
}) {
    // Enhanced safe number processing
    const rawTotal = parseFloat(carts_total);
    const rawDiscount = parseFloat(discount);
    const rawCash = parseFloat(cash);

    const total = isNaN(rawTotal) ? 0 : rawTotal;
    const discountAmount = isNaN(rawDiscount) ? 0 : rawDiscount;
    const finalTotal = total - discountAmount;
    const cashAmount = isNaN(rawCash) ? 0 : rawCash;
    const change = cashAmount - finalTotal;

    // Calculate deposit handling
    const rawDepositAmount = parseFloat(depositAmount);
    const depositAmountValue = isNaN(rawDepositAmount) ? 0 : rawDepositAmount;

    let finalDepositAmount = 0;
    let finalChange = change;

    if (useChangeAsDeposit && change > 0) {
        finalDepositAmount =
            depositAmountValue > 0
                ? Math.min(depositAmountValue, change)
                : change;
        finalChange = change - finalDepositAmount;
    }

    // Ensure all numbers are safe for rendering
    const safeTotal = isNaN(total) ? 0 : Math.round(total);
    const safeDiscountAmount = isNaN(discountAmount)
        ? 0
        : Math.round(discountAmount);
    const safeFinalTotal = isNaN(finalTotal) ? 0 : Math.round(finalTotal);
    const safeCashAmount = isNaN(cashAmount) ? 0 : Math.round(cashAmount);
    const safeChange = isNaN(finalChange) ? 0 : Math.round(finalChange);
    const safeDepositAmount = isNaN(finalDepositAmount)
        ? 0
        : Math.round(finalDepositAmount);

    // --- Render-Safe String Formatting ---
    const formatRupiah = (number) => {
        if (isNaN(number) || number === null || number === undefined)
            return "Rp 0";
        return `Rp ${Math.round(Number(number)).toLocaleString("id-ID")}`;
    };

    // Pre-formatted display strings (100% safe for rendering)
    const displayTotal = formatRupiah(safeTotal);
    const displayDiscount = formatRupiah(safeDiscountAmount);
    const displayFinalTotal = formatRupiah(safeFinalTotal);
    const displayChange =
        safeChange >= 0
            ? formatRupiah(Math.abs(safeChange))
            : formatRupiah(Math.abs(safeChange));
    const displayChangeShortfall = `Uang tunai kurang ${formatRupiah(
        Math.abs(safeChange)
    )}`;
    const displayDepositAmount = formatRupiah(safeDepositAmount);

    // Optional discount flag
    const hasDiscount = safeDiscountAmount > 0;

    const handleCashChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setCash(value);
    };

    const handleDiscountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setDiscount(value);
    };

    const handleDepositAmountChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setDepositAmount(value);
    };

    const canProcessTransaction =
        safeFinalTotal > 0 && safeCashAmount >= safeFinalTotal;

    return (
        <Card className={cn("h-fit", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Pembayaran
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Customer Selection */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Pelanggan
                    </Label>
                    <div className="flex gap-2">
                        <Select
                            value={selectedCustomer?.toString() || "general"}
                            onValueChange={(value) =>
                                setSelectedCustomer(
                                    value && value !== "general"
                                        ? parseInt(value)
                                        : null
                                )
                            }
                        >
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Pilih pelanggan (opsional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">
                                    Pelanggan Umum
                                </SelectItem>
                                {customers.map((customer) => (
                                    <SelectItem
                                        key={customer.id}
                                        value={customer.id.toString()}
                                    >
                                        {`${customer.name || "Unknown"} - ${
                                            customer.phone || "Tanpa telepon"
                                        }`}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={openCustomerModal}
                            className="px-3"
                        >
                            <User className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">{displayTotal}</span>
                    </div>

                    {/* Discount Input - Optional */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="discount"
                            className="text-sm font-medium flex items-center gap-2"
                        >
                            Diskon (Opsional)
                        </Label>
                        <Input
                            id="discount"
                            type="text"
                            value={discount || ""}
                            onChange={handleDiscountChange}
                            placeholder="Masukkan diskon dalam rupiah (opsional)"
                            className="text-right"
                        />
                    </div>

                    {hasDiscount && (
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                                Diskon:
                            </span>
                            <span className="font-medium text-green-600">
                                -{displayDiscount}
                            </span>
                        </div>
                    )}

                    <div className="border-t pt-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold">Total Bayar:</span>
                            <span className="text-xl font-bold text-primary">
                                {displayFinalTotal}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Cash Input */}
                <div className="space-y-2">
                    <Label
                        htmlFor="cash"
                        className="text-sm font-medium flex items-center gap-2"
                    >
                        <DollarSign className="w-4 h-4" />
                        Uang Tunai
                    </Label>
                    <Input
                        id="cash"
                        type="text"
                        value={cash || ""}
                        onChange={handleCashChange}
                        placeholder="Masukkan jumlah uang tunai"
                        className="text-right text-lg font-semibold"
                    />
                    {safeFinalTotal > 0 && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCash(safeFinalTotal.toString())
                                }
                                className="text-xs"
                            >
                                Pas
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCash((safeFinalTotal + 5000).toString())
                                }
                                className="text-xs"
                            >
                                +5K
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                    setCash((safeFinalTotal + 10000).toString())
                                }
                                className="text-xs"
                            >
                                +10K
                            </Button>
                        </div>
                    )}
                </div>

                {/* Change Display */}
                {safeCashAmount > 0 && safeFinalTotal > 0 && (
                    <div className="space-y-3">
                        <div className="p-3 bg-background/50 rounded border">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">
                                    Kembalian:
                                </span>
                                <span
                                    className={cn(
                                        "text-lg font-bold",
                                        change >= 0
                                            ? "text-green-600"
                                            : "text-red-600"
                                    )}
                                >
                                    {change >= 0
                                        ? formatRupiah(Math.abs(change))
                                        : `-${formatRupiah(Math.abs(change))}`}
                                </span>
                            </div>
                            {change < 0 && (
                                <p className="text-xs text-red-600 mt-1">
                                    {displayChangeShortfall}
                                </p>
                            )}
                        </div>

                        {/* Deposit Option - Only show if there's positive change */}
                        {change > 0 && (
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="useChangeAsDeposit"
                                        checked={useChangeAsDeposit}
                                        onCheckedChange={setUseChangeAsDeposit}
                                    />
                                    <Label
                                        htmlFor="useChangeAsDeposit"
                                        className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                                    >
                                        <PiggyBank className="w-4 h-4 text-blue-600" />
                                        Masukkan kembalian ke deposit
                                    </Label>
                                </div>

                                {useChangeAsDeposit && (
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="depositAmount"
                                            className="text-sm font-medium"
                                        >
                                            Jumlah yang akan masuk deposit
                                        </Label>
                                        <Input
                                            id="depositAmount"
                                            type="text"
                                            value={depositAmount || ""}
                                            onChange={handleDepositAmountChange}
                                            placeholder="Masukkan jumlah atau kosongkan untuk seluruh kembalian"
                                            className="text-right"
                                        />
                                        <p className="text-xs text-blue-600">
                                            Maksimal yang bisa disimpan:{" "}
                                            {formatRupiah(change)}
                                        </p>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>
                                                    Deposit yang akan disimpan:
                                                </span>
                                                <span className="font-medium text-blue-600">
                                                    {formatRupiah(
                                                        finalDepositAmount
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>
                                                    Kembalian yang diterima:
                                                </span>
                                                <span className="font-medium text-green-600">
                                                    {formatRupiah(finalChange)}
                                                </span>
                                            </div>
                                            <div className="pt-1 border-t border-gray-200">
                                                <div className="flex justify-between font-medium">
                                                    <span>
                                                        Total kembalian asli:
                                                    </span>
                                                    <span className="text-gray-700">
                                                        {formatRupiah(change)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                    <Label htmlFor="notes" className="text-sm font-medium">
                        Catatan (Opsional)
                    </Label>
                    <Textarea
                        id="notes"
                        value={notes || ""}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tambahkan catatan transaksi..."
                        rows={3}
                        className="resize-none"
                    />
                </div>

                {/* Process Transaction Button */}
                <Button
                    onClick={processTransaction}
                    disabled={!canProcessTransaction || isProcessingTransaction}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                >
                    {isProcessingTransaction ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Memproses...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Receipt className="w-5 h-5" />
                            Proses Transaksi
                        </div>
                    )}
                </Button>

                {!canProcessTransaction && finalTotal > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                        {cashAmount < finalTotal
                            ? "Uang tunai belum mencukupi"
                            : "Lengkapi informasi pembayaran"}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
