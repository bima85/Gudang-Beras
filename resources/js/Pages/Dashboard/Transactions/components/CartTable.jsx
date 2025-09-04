import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Components/ui/table";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";
import { ShoppingCart, Minus, Plus, Trash2, Package } from "lucide-react";

export default function CartTable({
    carts = [],
    carts_total = 0,
    removeFromCart,
    updateCartQuantity,
    className,
}) {
    // Ensure carts is always an array and carts_total is always a number
    const safeCarts = Array.isArray(carts) ? carts : [];
    const safeCartsTotal = parseFloat(carts_total) || 0;

    if (!safeCarts || safeCarts.length === 0) {
        return (
            <Card className={cn("h-fit", className)}>
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Keranjang Belanja
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Package className="w-16 h-16 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground mb-2">
                            Keranjang Kosong
                        </h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Mulai dengan mencari dan menambahkan produk ke
                            keranjang belanja Anda.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("h-fit", className)}>
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                        Keranjang Belanja
                    </div>
                    <Badge variant="secondary" className="ml-2">
                        {`${safeCarts.length || 0} item${
                            (safeCarts.length || 0) > 1 ? "s" : ""
                        }`}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-semibold">
                                    Produk
                                </TableHead>
                                <TableHead className="text-center font-semibold w-32">
                                    Qty
                                </TableHead>
                                <TableHead className="text-right font-semibold w-32">
                                    Harga
                                </TableHead>
                                <TableHead className="text-right font-semibold w-32">
                                    Subtotal
                                </TableHead>
                                <TableHead className="text-center font-semibold w-20">
                                    Aksi
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {safeCarts.map((cart, index) => {
                                // Safe number parsing with comprehensive fallbacks
                                const quantity =
                                    cart && cart.qty ? parseInt(cart.qty) : 1;
                                const price =
                                    cart && cart.price
                                        ? parseFloat(cart.price)
                                        : 0;
                                const subtotal = quantity * price;

                                // Validate numbers before rendering
                                const safeQuantity = isNaN(quantity)
                                    ? 1
                                    : quantity;
                                const safePrice = isNaN(price) ? 0 : price;
                                const safeSubtotal = isNaN(subtotal)
                                    ? 0
                                    : subtotal;

                                return (
                                    <TableRow
                                        key={index}
                                        className="hover:bg-muted/20"
                                    >
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">
                                                    {cart.product?.name ||
                                                        "Produk tidak ditemukan"}
                                                </p>
                                                <div className="flex gap-1">
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {cart.product
                                                            ?.barcode ||
                                                            "No barcode"}
                                                    </Badge>
                                                    {cart.unit?.name && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {cart.unit.name}
                                                        </Badge>
                                                    )}
                                                    {cart.category?.name && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {cart.category.name}
                                                        </Badge>
                                                    )}
                                                    {cart.subcategory?.name && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {
                                                                cart.subcategory
                                                                    .name
                                                            }
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center gap-1">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        updateCartQuantity(
                                                            index,
                                                            safeQuantity - 1
                                                        )
                                                    }
                                                    disabled={safeQuantity <= 1}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <Input
                                                    type="number"
                                                    value={safeQuantity.toString()}
                                                    onChange={(e) => {
                                                        const newQty =
                                                            parseInt(
                                                                e.target.value
                                                            ) || 1;
                                                        if (newQty > 0) {
                                                            updateCartQuantity(
                                                                index,
                                                                newQty
                                                            );
                                                        }
                                                    }}
                                                    className="h-8 w-16 text-center text-sm"
                                                    min="1"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        updateCartQuantity(
                                                            index,
                                                            safeQuantity + 1
                                                        )
                                                    }
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium text-sm">
                                            {`Rp ${
                                                safePrice > 0
                                                    ? Math.round(
                                                          safePrice
                                                      ).toLocaleString("id-ID")
                                                    : "0"
                                            }`}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            {`Rp ${
                                                safeSubtotal > 0
                                                    ? Math.round(
                                                          safeSubtotal
                                                      ).toLocaleString("id-ID")
                                                    : "0"
                                            }`}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    removeFromCart(index)
                                                }
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                {/* Cart Summary */}
                <div className="p-4 border-t bg-muted/20">
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground">
                            {`Total ${safeCarts.length || 0} item${
                                (safeCarts.length || 0) > 1 ? "s" : ""
                            }`}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                                Total Belanja
                            </p>
                            <p className="text-xl font-bold text-primary">
                                {`Rp ${Math.round(
                                    safeCartsTotal
                                ).toLocaleString("id-ID")}`}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
