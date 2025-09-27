import React from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { format } from 'date-fns';

export default function Show({ transaction, sidebarOpen }) {
    const fmtDate = (iso) => {
        if (!iso) return '-';
        try {
            return format(new Date(iso), 'dd MMM yyyy HH:mm');
        } catch (e) {
            return iso;
        }
    };

    const fmtCurrency = (n) => {
        if (n === null || n === undefined) return '-';
        return `Rp ${Number(n).toLocaleString('id-ID')}`;
    };

    const fmtQuantity = (q) => {
        if (q === null || q === undefined) return '-';
        const num = Number(q);
        if (isNaN(num)) return q;
        return Number.isInteger(num) ? num.toString() : num.toFixed(2);
    };

    return (
        <DashboardLayout sidebarOpen={sidebarOpen}>
            <Head title={`Detail Transaksi - ${transaction.transaction_number}`} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Detail Transaksi</h1>
                        <p className="text-sm text-gray-500">{transaction.transaction_number}</p>
                    </div>
                    <div>
                        <Link href={route('transaction-histories.index')}>
                            <Button variant="outline">Kembali</Button>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Informasi Transaksi</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-600">Tanggal</div>
                                        <div>{fmtDate(transaction.transaction_datetime_iso || transaction.transaction_date_local || transaction.transaction_date)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Tipe</div>
                                        <div>{transaction.transaction_type}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Creator</div>
                                        <div>{transaction.creator?.name || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Lokasi</div>
                                        <div>{transaction.toko?.name || transaction.warehouse?.name || '-'}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Rincian</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-60">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Produk</TableHead>
                                                <TableHead>Qty</TableHead>
                                                <TableHead>Harga Jual</TableHead>
                                                <TableHead>Harga Beli</TableHead>
                                                <TableHead>Profit</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transaction.transaction?.details?.map((d, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>
                                                        <div className="font-medium">{d.product?.name || d.product_name || '-'}</div>
                                                        <div className="text-xs text-gray-500">{d.product?.category?.name || d.product?.category_name || '-'} / {d.product?.subcategory?.name || d.product?.subcategory_name || '-'}</div>
                                                    </TableCell>
                                                    <TableCell>{fmtQuantity(d.quantity)} {d.unit || ''}</TableCell>
                                                    <TableCell>{fmtCurrency(d.price || d.unit_price || d.sale_price)}</TableCell>
                                                    <TableCell>{fmtCurrency(d.harga_beli ?? d.purchase_price ?? d.product?.purchase_price)}</TableCell>
                                                    <TableCell>{fmtCurrency(d.profit ?? ((d.price || d.unit_price || d.sale_price) - (d.harga_beli ?? d.purchase_price ?? d.product?.purchase_price)))}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                    </div>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ringkasan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-600">Subtotal</div>
                                    <div className="font-bold">{fmtCurrency(transaction.subtotal)}</div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-sm text-gray-600">Payment Status</div>
                                    <div>{transaction.payment_status}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

