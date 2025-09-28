import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/Components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { History, Filter, Calendar, DollarSign, Clock, Eye } from "lucide-react";
import axios from "axios";
import { format } from "date-fns";

export default function CustomerTransactionHistory({ selectedCustomer, customers }) {
   const [transactions, setTransactions] = useState([]);
   const [summary, setSummary] = useState(null);
   const [loading, setLoading] = useState(false);
   const [filters, setFilters] = useState({
      limit: 10,
      date_from: '',
      date_to: '',
   });
   const [selectedTransaction, setSelectedTransaction] = useState(null);
   const [transactionDetails, setTransactionDetails] = useState(null);
   const [detailsLoading, setDetailsLoading] = useState(false);
   const [showDetailsModal, setShowDetailsModal] = useState(false);

   const selectedCustomerData = selectedCustomer
      ? customers.find((c) => c.id === selectedCustomer)
      : null;

   useEffect(() => {
      if (selectedCustomer) {
         fetchTransactionHistory();
      } else {
         setTransactions([]);
         setSummary(null);
      }
   }, [selectedCustomer, filters]);

   const fetchTransactionHistory = async () => {
      if (!selectedCustomer) return;

      setLoading(true);
      try {
         const params = new URLSearchParams({
            customer_id: selectedCustomer,
            ...filters,
         });

         const response = await axios.get(`/dashboard/transactions/customer-history?${params}`);
         setTransactions(response.data.transactions);
         setSummary(response.data.summary);
      } catch (error) {
         console.error('Error fetching transaction history:', error);
         setTransactions([]);
         setSummary(null);
      } finally {
         setLoading(false);
      }
   };

   const fetchTransactionDetails = async (transactionId) => {
      setDetailsLoading(true);
      try {
         const response = await axios.get(`/dashboard/transactions/${transactionId}/details`);
         setTransactionDetails(response.data);
         setShowDetailsModal(true);
      } catch (error) {
         console.error('Error fetching transaction details:', error);
      } finally {
         setDetailsLoading(false);
      }
   };

   const formatRupiah = (number) => {
      if (isNaN(number) || number === null || number === undefined) return "Rp 0";
      return `Rp ${Math.round(Number(number)).toLocaleString("id-ID")}`;
   };

   const handleFilterChange = (key, value) => {
      setFilters(prev => ({
         ...prev,
         [key]: value,
      }));
   };

   if (!selectedCustomer || !selectedCustomerData) {
      return null;
   }

   return (
      <Card className="mt-4">
         <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
               <History className="w-5 h-5 text-primary" />
               Riwayat Transaksi - {selectedCustomerData.name}
            </CardTitle>
            {summary && (
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                     <div className="text-sm font-medium text-blue-800">Total Transaksi</div>
                     <div className="text-xl font-bold text-blue-900">{summary.total_transactions}</div>
                  </div>
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                     <div className="text-sm font-medium text-green-800">Total Pembelian</div>
                     <div className="text-xl font-bold text-green-900">{formatRupiah(summary.total_amount)}</div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                     <div className="text-sm font-medium text-purple-800">Total Dibayar</div>
                     <div className="text-xl font-bold text-purple-900">{formatRupiah(summary.total_paid)}</div>
                  </div>
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                     <div className="text-sm font-medium text-orange-800">Saldo Outstanding</div>
                     <div className="text-xl font-bold text-orange-900">{formatRupiah(summary.outstanding_balance)}</div>
                  </div>
               </div>
            )}
         </CardHeader>
         <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg">
               <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="limit" className="text-sm font-medium">Jumlah Data</Label>
                  <Select value={filters.limit.toString()} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="5">5 transaksi</SelectItem>
                        <SelectItem value="10">10 transaksi</SelectItem>
                        <SelectItem value="20">20 transaksi</SelectItem>
                        <SelectItem value="50">50 transaksi</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="date_from" className="text-sm font-medium">Dari Tanggal</Label>
                  <Input
                     id="date_from"
                     type="date"
                     value={filters.date_from}
                     onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  />
               </div>
               <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="date_to" className="text-sm font-medium">Sampai Tanggal</Label>
                  <Input
                     id="date_to"
                     type="date"
                     value={filters.date_to}
                     onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  />
               </div>
               <div className="flex items-end">
                  <Button
                     variant="outline"
                     size="sm"
                     onClick={() => setFilters({ limit: 10, date_from: '', date_to: '' })}
                     className="px-3"
                  >
                     <Filter className="w-4 h-4 mr-2" />
                     Reset
                  </Button>
               </div>
            </div>

            {/* Transaction Table */}
            <div className="border rounded-lg">
               {loading ? (
                  <div className="p-8 text-center">
                     <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                     <p className="mt-2 text-sm text-muted-foreground">Memuat riwayat transaksi...</p>
                  </div>
               ) : transactions.length === 0 ? (
                  <div className="p-8 text-center">
                     <History className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                     <p className="text-muted-foreground">Belum ada transaksi untuk pelanggan ini</p>
                  </div>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Invoice</TableHead>
                           <TableHead>Tanggal</TableHead>
                           <TableHead>Waktu</TableHead>
                           <TableHead>Total</TableHead>
                           <TableHead>Dibayar</TableHead>
                           <TableHead>Deposit</TableHead>
                           <TableHead>Outstanding</TableHead>
                           <TableHead>Status</TableHead>
                           <TableHead>Aksi</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {transactions.map((transaction) => {
                           const paidAmount = (transaction.cash || 0) + (transaction.deposit_amount || 0);
                           const outstanding = transaction.is_tempo && paidAmount < transaction.grand_total
                              ? transaction.grand_total - paidAmount
                              : 0;

                           return (
                              <TableRow key={transaction.id}>
                                 <TableCell className="font-medium">
                                    {transaction.invoice || transaction.transaction_number}
                                 </TableCell>
                                 <TableCell>
                                    <div className="flex items-center gap-2">
                                       <Calendar className="w-4 h-4 text-muted-foreground" />
                                       {transaction.date}
                                    </div>
                                 </TableCell>
                                 <TableCell>
                                    <div className="flex items-center gap-2">
                                       <Clock className="w-4 h-4 text-muted-foreground" />
                                       {transaction.time}
                                    </div>
                                 </TableCell>
                                 <TableCell className="font-semibold text-green-600">
                                    {formatRupiah(transaction.grand_total)}
                                 </TableCell>
                                 <TableCell>
                                    {formatRupiah(paidAmount)}
                                 </TableCell>
                                 <TableCell>
                                    {transaction.deposit_amount > 0 ? (
                                       <Badge variant="outline" className="text-purple-600">
                                          {formatRupiah(transaction.deposit_amount)}
                                       </Badge>
                                    ) : (
                                       <span className="text-muted-foreground">-</span>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    {outstanding > 0 ? (
                                       <Badge variant="destructive">
                                          {formatRupiah(outstanding)}
                                       </Badge>
                                    ) : (
                                       <span className="text-muted-foreground">-</span>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    {transaction.is_tempo ? (
                                       <Badge variant="destructive">Tempo</Badge>
                                    ) : (
                                       <Badge variant="default">Lunas</Badge>
                                    )}
                                 </TableCell>
                                 <TableCell>
                                    <Button
                                       variant="outline"
                                       size="sm"
                                       onClick={() => fetchTransactionDetails(transaction.id)}
                                       disabled={detailsLoading}
                                       className="px-3"
                                    >
                                       <Eye className="w-4 h-4 mr-2" />
                                       Lihat
                                    </Button>
                                 </TableCell>
                              </TableRow>
                           );
                        })}
                     </TableBody>
                  </Table>
               )}
            </div>

            {transactions.length > 0 && (
               <div className="text-xs text-muted-foreground text-center">
                  Menampilkan {transactions.length} transaksi terakhir
               </div>
            )}
         </CardContent>

         {/* Transaction Details Modal */}
         <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
               <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                     <History className="w-5 h-5" />
                     Detail Transaksi - {transactionDetails?.transaction?.invoice || transactionDetails?.transaction?.transaction_number}
                  </DialogTitle>
               </DialogHeader>

               {detailsLoading ? (
                  <div className="p-8 text-center">
                     <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                     <p className="mt-2 text-sm text-muted-foreground">Memuat detail transaksi...</p>
                  </div>
               ) : transactionDetails ? (
                  <div className="space-y-6">
                     {/* Transaction Summary */}
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                           <div className="text-sm font-medium text-blue-800">Total Transaksi</div>
                           <div className="text-lg font-bold text-blue-900">{formatRupiah(transactionDetails.transaction.grand_total)}</div>
                        </div>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                           <div className="text-sm font-medium text-green-800">Dibayar</div>
                           <div className="text-lg font-bold text-green-900">
                              {formatRupiah((transactionDetails.transaction.cash || 0) + (transactionDetails.transaction.deposit_amount || 0))}
                           </div>
                        </div>
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                           <div className="text-sm font-medium text-orange-800">Outstanding</div>
                           <div className="text-lg font-bold text-orange-900">
                              {formatRupiah(transactionDetails.outstanding_balance)}
                           </div>
                        </div>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                           <div className="text-sm font-medium text-purple-800">Status</div>
                           <div className="text-lg font-bold text-purple-900">
                              {transactionDetails.transaction.is_tempo ? 'Tempo' : 'Lunas'}
                           </div>
                        </div>
                     </div>

                     {/* Transaction Info */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                        <div>
                           <Label className="text-sm font-medium">Tanggal</Label>
                           <p className="text-sm">{transactionDetails.transaction.created_at}</p>
                        </div>
                        <div>
                           <Label className="text-sm font-medium">Customer</Label>
                           <p className="text-sm">{transactionDetails.transaction.customer?.name || 'N/A'}</p>
                        </div>
                        <div>
                           <Label className="text-sm font-medium">Cashier</Label>
                           <p className="text-sm">{transactionDetails.transaction.cashier?.name || 'N/A'}</p>
                        </div>
                        <div>
                           <Label className="text-sm font-medium">Warehouse</Label>
                           <p className="text-sm">{transactionDetails.transaction.warehouse?.name || 'N/A'}</p>
                        </div>
                     </div>

                     {/* Product Details */}
                     <div>
                        <h3 className="text-lg font-semibold mb-4">Detail Produk</h3>
                        <div className="border rounded-lg">
                           <Table>
                              <TableHeader>
                                 <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Subkategori</TableHead>
                                    <TableHead>Harga Beli</TableHead>
                                    <TableHead>Harga Jual</TableHead>
                                    <TableHead>Qty</TableHead>
                                    <TableHead>Subtotal</TableHead>
                                 </TableRow>
                              </TableHeader>
                              <TableBody>
                                 {transactionDetails.details.map((detail, index) => (
                                    <TableRow key={index}>
                                       <TableCell className="font-medium">
                                          {detail.product?.name || 'N/A'}
                                       </TableCell>
                                       <TableCell>
                                          {detail.product?.category?.name || 'N/A'}
                                       </TableCell>
                                       <TableCell>
                                          {detail.product?.subcategory?.name || 'N/A'}
                                       </TableCell>
                                       <TableCell className="text-green-600">
                                          {formatRupiah(detail.purchase_price || 0)}
                                       </TableCell>
                                       <TableCell className="text-blue-600">
                                          {formatRupiah(detail.price || 0)}
                                       </TableCell>
                                       <TableCell>
                                          {detail.quantity}
                                       </TableCell>
                                       <TableCell className="font-semibold">
                                          {formatRupiah(detail.subtotal || 0)}
                                       </TableCell>
                                    </TableRow>
                                 ))}
                              </TableBody>
                           </Table>
                        </div>
                     </div>
                  </div>
               ) : null}
            </DialogContent>
         </Dialog>
      </Card>
   );
}