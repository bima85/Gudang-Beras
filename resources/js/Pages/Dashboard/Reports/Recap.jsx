import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { toast } from "react-toastify";
import { Download, Filter, BarChart3, DollarSign, ChevronDown, ChevronRight } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";

export default function Recap({
  transactions,
  dailySummary = [],
  totalPenjualan = 0,
  totalPembelian = 0,
  labaKotor = 0,
  persentaseLaba = 0,
  start_date = "",
  end_date = "",
  period_limited = false,
  max_days = 90,
  effective_start = null,
  effective_end = null,
}) {
  const [start, setStart] = useState(start_date || "");
  const [end, setEnd] = useState(end_date || "");
  const [perPage, setPerPage] = useState(transactions?.per_page || 20);
  const [sorting, setSorting] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [transactionsState, setTransactionsState] = useState(transactions || { data: [], links: [], current_page: 1, per_page: perPage });
  const [isLive, setIsLive] = useState(false);
  const intervalMs = 5000;

  const expandAll = () => {
    const ids = new Set((transactions?.data || []).map((t) => t.id).filter(Boolean));
    setExpandedIds(ids);
  };

  const collapseAll = () => setExpandedIds(new Set());

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(
      route("dashboard.recap"),
      { start_date: start, end_date: end, per_page: perPage },
      { preserveState: true, replace: true }
    );
  };

  const resetFilter = () => {
    setStart("");
    setEnd("");
    router.get(route("dashboard.recap"), { per_page: perPage }, { preserveState: true, replace: true });
  };

  const handleExportCsv = () => {
    let csv = "Tanggal,Invoice,Kasir,Pelanggan,Total,HPP,Profit,Margin (%),Metode\n";
    (transactionsState.data || []).forEach((t) => {
      const invoiceNo = t.invoice_number || t.invoice || t.invoice_no || t.id;
      csv += `${t.created_at || ''},${invoiceNo},${t.cashier?.name || '-'},${t.customer?.name || '-'},${t.grand_total || 0},${t.hpp_cost || 0},${t.profit || 0},${Number(t.margin || 0).toFixed(2)},${t.payment_method || '-'}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rekap-transaksi-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Data berhasil diekspor");
  };

  // Columns for TanStack Table (client-side on current page)
  const data = transactionsState?.data || transactions?.data || [];
  const pager = transactionsState && Object.keys(transactionsState).length ? transactionsState : transactions;

  const columns = [
    {
      accessorKey: "__index",
      header: "No",
      cell: (info) => {
        const id = info.row.original?.id;
        const currentPage = pager?.current_page || 1;
        const pageSize = pager?.per_page || perPage || 20;
        const idx = info.row.index + 1 + ((currentPage - 1) * pageSize);
        const isOpen = id ? expandedIds.has(id) : false;
        return (
          <div className="flex items-center gap-2">
            {id && (
              <button
                type="button"
                onClick={() => {
                  const next = new Set(expandedIds);
                  if (next.has(id)) next.delete(id);
                  else next.add(id);
                  setExpandedIds(next);
                }}
                className="p-1 rounded hover:bg-muted/50"
                aria-label={isOpen ? 'Collapse' : 'Expand'}
              >
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            )}
            <span className="font-medium">{idx}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: (info) => {
        const v = info.getValue();
        return v ? new Date(v).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : "-";
      },
    },
    {
      accessorKey: "invoice_number", header: "Invoice", cell: (info) => {
        const row = info.row.original || {};
        const v = row.invoice_number || row.invoice || row.invoice_no || row.id;
        const profit = row?.profit ?? 0;
        const margin = row?.margin ?? 0;
        return (
          <div>
            <div className="font-mono">{v}</div>
            <div className="text-xs text-muted-foreground">Profit: {Number(profit).toLocaleString()} • {Number(margin).toFixed(2)}%</div>
          </div>
        );
      }
    },
    { accessorKey: "cashier.name", header: "Kasir", cell: (info) => info.row.original.cashier?.name || "-" },
    { accessorKey: "grand_total", header: "Total", cell: (info) => Number(info.getValue() || 0).toLocaleString() },
    { accessorKey: "hpp_cost", header: "HPP", cell: (info) => Number(info.getValue() || 0).toLocaleString() },
    { accessorKey: "profit", header: "Profit", cell: (info) => Number(info.getValue() || 0).toLocaleString() },
    { accessorKey: "margin", header: "Margin (%)", cell: (info) => `${Number(info.getValue() || 0).toFixed(2)}%` },
    { accessorKey: "payment_method", header: "Metode", cell: (info) => info.getValue() || "-" },
  ];

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: false,
  });

  const colCount = table.getAllLeafColumns().length;

  // fetch transactions via AJAX for per-page / live updates
  const fetchTransactions = async (page = 1, per_page = perPage) => {
    try {
      const params = new URLSearchParams({ start_date: start || '', end_date: end || '', page, per_page });
      const url = route('dashboard.recap.data-json') + '?' + params.toString();
      const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!res.ok) return;
      const json = await res.json();
      // json is paginated object
      setTransactionsState(json);
    } catch (e) {
      // ignore
    }
  };

  // When perPage changes in UI, fetch without full reload
  useEffect(() => {
    // update transactionsState.per_page to reflect change immediately
    setTransactionsState((prev) => ({ ...(prev || {}), per_page: perPage }));
    fetchTransactions(1, perPage);
  }, [perPage]);

  // optional live polling
  useEffect(() => {
    if (!isLive) return;
    let mounted = true;
    fetchTransactions(transactionsState.current_page || 1, perPage);
    const id = setInterval(() => {
      if (!mounted) return;
      fetchTransactions(transactionsState.current_page || 1, perPage);
    }, intervalMs);
    return () => { mounted = false; clearInterval(id); };
  }, [isLive, start, end, perPage]);

  return (
    <DashboardLayout>
      <Head title="Rekap Transaksi" />

      <div className="space-y-6">
        {period_limited && (
          <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
            Periode yang diminta melebihi {max_days} hari. Menampilkan data dari {effective_start} sampai {effective_end}.
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Rekap Transaksi</h1>
            <p className="text-muted-foreground">Laporan penjualan, HPP, profit, dan margin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Penjualan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{Number(totalPenjualan).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total penjualan pada periode</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Pembelian (HPP)</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Number(totalPembelian).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total pembelian / HPP pada periode</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Laba Kotor</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{Number(labaKotor).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Persentase: {Number(persentaseLaba).toFixed(2)}%</p>
            </CardContent>
          </Card>
        </div>



        <Card>
          <CardHeader>
            <CardTitle>Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Daily summary */}
            {dailySummary && dailySummary.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Margin / Profit Per Hari</h3>
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-2 text-left">Tanggal</th>
                        <th className="p-2 text-right">Total Penjualan</th>
                        <th className="p-2 text-right">Total HPP</th>
                        <th className="p-2 text-right">Profit</th>
                        <th className="p-2 text-right">Margin (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailySummary.map((d) => (
                        <tr key={d.date} className="odd:bg-white even:bg-slate-50">
                          <td className="p-2">{new Date(d.date).toLocaleDateString('id-ID')}</td>
                          <td className="p-2 text-right">{Number(d.total_sales).toLocaleString()}</td>
                          <td className="p-2 text-right">{Number(d.total_hpp).toLocaleString()}</td>
                          <td className="p-2 text-right">{Number(d.profit).toLocaleString()}</td>
                          <td className="p-2 text-right">{Number(d.margin).toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
            {transactions?.data?.length > 0 ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> Filter Data</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFilter} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="start_date">Tanggal Mulai</Label>
                          <Input id="start_date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_date">Tanggal Akhir</Label>
                          <Input id="end_date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <Button type="submit" className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filter</Button>
                        <Button type="button" variant="outline" onClick={resetFilter} className="flex items-center gap-2">Reset</Button>
                        <Button type="button" variant="secondary" onClick={handleExportCsv} className="flex items-center gap-2"><Download className="h-4 w-4" /> Export CSV</Button>
                        <Button type="button" variant="ghost" onClick={() => window.open(route('dashboard.recap.export-excel', { start_date: start, end_date: end }))} className="flex items-center gap-2">Excel</Button>
                        <Button type="button" variant="ghost" onClick={() => window.open(route('dashboard.recap.export-pdf', { start_date: start, end_date: end }))} className="flex items-center gap-2">PDF</Button>
                        <div className="ml-auto flex items-center gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={expandAll}>Expand All</Button>
                          <Button type="button" size="sm" variant="outline" onClick={collapseAll}>Collapse All</Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Label htmlFor="per_page">Baris / halaman</Label>
                        <select id="per_page" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); }} className="ml-0 rounded-sm border-sky-600 px-4 py-2 text-sm w-20">
                          <option value="5">5</option>
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                <div className="max-h-[60vh] overflow-auto overflow-x-auto rounded-md border">
                  <Table className="min-w-max">
                    <TableHeader sticky>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead key={header.id} onClick={header.column.getToggleSortingHandler()} className="cursor-pointer">
                              {header.isPlaceholder ? null : (
                                <div className="flex items-center gap-2">
                                  {flexRender(header.column.columnDef.header, header.getContext())}
                                  <span className="text-xs text-muted-foreground">{header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : ''}</span>
                                </div>
                              )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>

                      {table.getRowModel().rows.map((row) => {
                        const id = row.original?.id;
                        return (
                          <React.Fragment key={row.id}>
                            <TableRow>
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                              ))}
                            </TableRow>

                            {id && expandedIds.has(id) && (
                              <TableRow>
                                <TableCell colSpan={colCount} className="bg-gray-50">
                                  <div className="p-3">
                                    <div className="text-sm font-medium mb-2">Rincian Transaksi</div>
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-sm">
                                        <thead>
                                          <tr className="text-left text-xs text-muted-foreground">

                                            <th className="p-2">Produk</th>
                                            <th className="p-2">Kategori</th>
                                            <th className="p-2">Subkategori</th>
                                            <th className="p-2 text-right">Qty</th>
                                            <th className="p-2 text-right">Unit</th>
                                            <th className="p-2 text-right">Harga Jual</th>
                                            <th className="p-2 text-right">HPP</th>
                                            <th className="p-2 text-right">Harga Beli</th>
                                            <th className="p-2 text-right">Profit</th>
                                            <th className="p-2 text-right">Subtotal</th>
                                            <th className="p-2 text-right">Margin (%)</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {(row.original.details || []).map((d, idx) => {
                                            const qty = d.qty || 0;
                                            const sell = d.price || 0;
                                            // Prefer server-provided canonical field `harga_beli` (attached by backend) then product purchase price.
                                            // Use nullish coalescing (??) so a valid 0 is preserved.
                                            const hpp = d.harga_beli ?? d.product?.purchase_price ?? 0;
                                            const hargaBeli = d.harga_beli ?? d.product?.purchase_price ?? d.product?.harga_pembelian ?? d.harga_pembelian ?? d.purchase_price ?? d.product?.purchasePrice ?? 0;
                                            const unit = d.unit_name || d.unit?.name || d.satuan || d.product?.unit?.name || d.product?.unit_name || "-";
                                            const subtotal = (d.subtotal !== undefined && d.subtotal !== null) ? d.subtotal : sell * qty;
                                            const lineCost = hpp * qty;
                                            // profit should be calculated per unit: (harga_jual - harga_beli) * qty
                                            const lineProfit = (sell - hargaBeli) * qty;
                                            const lineMargin = (sell * qty) > 0 ? (lineProfit / (sell * qty)) * 100 : 0;
                                            return (
                                              <tr key={idx} className="odd:bg-white even:bg-slate-50">

                                                <td className="p-2">{d.product?.name || d.product_name || '-'}</td>
                                                <td className="p-2">{
                                                  d.product?.categoryRelation?.name
                                                  || d.product?.category?.name
                                                  || d.product?.category_relation?.name
                                                  || d.product?.category_name
                                                  || '-'
                                                }</td>
                                                <td className="p-2">{
                                                  d.product?.subcategory?.name
                                                  || d.product?.subcategory_name
                                                  || d.product?.sub_category_name
                                                  || '-'
                                                }</td>
                                                <td className="p-2 text-right">{qty}</td>
                                                <td className="p-2 text-right">{unit}</td>
                                                <td className="p-2 text-right">{Number(sell).toLocaleString()}</td>
                                                <td className="p-2 text-right">{Number(hpp).toLocaleString()}</td>
                                                <td className="p-2 text-right">{hargaBeli ? Number(hargaBeli).toLocaleString() : '-'}</td>
                                                <td className="p-2 text-right">{Number(lineProfit).toLocaleString()}</td>
                                                <td className="p-2 text-right">{Number(subtotal).toLocaleString()}</td>
                                                <td className="p-2 text-right">{Number(lineMargin).toFixed(2)}%</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {transactions.links && transactions.links.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Menampilkan {pager.from}-{pager.to} dari {pager.total} data</div>
                    <div className="flex gap-2 items-center">
                      {pager.links?.map((link, index) => {
                        // render disabled look for null url (Laravel uses null for separators)
                        if (link.url === null) {
                          return (
                            <Button key={index} variant="ghost" size="sm" disabled dangerouslySetInnerHTML={{ __html: link.label }} />
                          );
                        }
                        // extract page number from link.url
                        try {
                          const parsed = new URL(link.url, window.location.origin);
                          const pageParam = parsed.searchParams.get('page') || 1;
                          return (
                            <Button
                              key={index}
                              variant={link.active ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => fetchTransactions(pageParam, perPage)}
                              dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                          );
                        } catch (e) {
                          return (
                            <Button key={index} variant={link.active ? 'default' : 'outline'} size="sm" onClick={() => fetchTransactions(1, perPage)} dangerouslySetInnerHTML={{ __html: link.label }} />
                          );
                        }
                      })}
                      <div className="ml-3 text-xs text-muted-foreground">Per halaman: <strong>{perPage}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">Tidak ada transaksi yang ditemukan</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
