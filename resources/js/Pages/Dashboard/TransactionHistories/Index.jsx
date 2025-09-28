import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { ScrollArea } from '@/Components/ui/scroll-area';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

// Column helper for type safety
const columnHelper = createColumnHelper();

// Clean, minimal Transaction Histories index page.
export default function Index({ transactions = { data: [], links: [], current_page: 1, per_page: 15 }, filters = {}, sidebarOpen }) {
  const [start, setStart] = useState(filters.from || '');
  const [end, setEnd] = useState(filters.to || '');
  const [transactionsState, setTransactionsState] = useState(transactions || { data: [], links: [], current_page: 1, per_page: 15 });
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');

  useEffect(() => {
    setTransactionsState(transactions || { data: [], links: [], current_page: 1, per_page: 15 });
  }, [transactions]);

  const fmtDate = (iso) => {
    if (!iso) return '-';
    try {
      return format(new Date(iso), 'dd MMM yyyy HH:mm');
    } catch (e) {
      return iso;
    }
  };

  // Column definitions
  const columns = useMemo(() => [
    columnHelper.accessor('id', {
      header: '#',
      cell: (info) => {
        const pager = transactionsState;
        return info.row.index + 1 + ((pager.current_page - 1) * pager.per_page || 0);
      },
      size: 60,
    }),
    columnHelper.accessor('transaction_number', {
      header: 'Nomor',
      cell: (info) => info.getValue(),
      size: 120,
    }),
    columnHelper.accessor('transaction_type', {
      header: 'Tipe',
      cell: (info) => info.getValue(),
      size: 80,
    }),
    columnHelper.accessor((row) => row.product?.name || row.product_name, {
      id: 'product_name',
      header: 'Produk',
      cell: (info) => info.getValue() || '-',
      size: 150,
    }),
    columnHelper.accessor((row) => row.product?.category?.name || row.product?.category_name, {
      id: 'category_name',
      header: 'Kategori',
      cell: (info) => info.getValue() || '-',
      size: 120,
    }),
    columnHelper.accessor((row) => row.product?.subcategory?.name || row.product?.subcategory_name, {
      id: 'subcategory_name',
      header: 'Subkategori',
      cell: (info) => info.getValue() || '-',
      size: 120,
    }),
    columnHelper.accessor('total_quantity', {
      header: 'Qty',
      cell: (info) => info.getValue() || info.row.original.quantity || '-',
      size: 80,
    }),
    columnHelper.accessor('remaining_stock', {
      header: 'Sisa Stok',
      cell: (info) => info.getValue() ?? '-',
      size: 100,
    }),
    columnHelper.accessor('harga_beli', {
      header: 'Harga Beli',
      cell: (info) => info.getValue() ?? info.row.original.product?.purchase_price ?? '-',
      size: 120,
    }),
    columnHelper.accessor('transaction_datetime_iso', {
      header: 'Tanggal',
      cell: (info) => fmtDate(info.getValue() || info.row.original.transaction_datetime_local || info.row.original.transaction_date),
      size: 150,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Aksi',
      cell: (info) => (
        <Link href={route('transaction-histories.show', info.row.original.id)} className="text-blue-600 hover:text-blue-800">
          Lihat
        </Link>
      ),
      size: 80,
    }),
  ], [transactionsState]);

  const tableData = useMemo(() => transactionsState.data || [], [transactionsState.data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'includesString',
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  const fetchTransactions = async (params = {}) => {
    setLoading(true);
    try {
      const queryParams = {
        from: (params.from ?? start) || '',
        to: (params.to ?? end) || '',
        page: (params.page || 1).toString(),
        per_page: (params.per_page || transactionsState.per_page || 15).toString(),
      };

      // Use Inertia router instead of fetch for proper Inertia navigation
      router.get(route('transaction-histories.index'), queryParams, {
        preserveState: true,
        preserveScroll: true,
        onSuccess: (page) => {
          setTransactionsState(page.props.transactions || { data: [], links: [], current_page: 1, per_page: 15 });
        },
        onError: (errors) => {
          console.error('fetchTransactions error', errors);
          toast.error('Gagal memuat data transaksi');
        },
        onFinish: () => {
          setLoading(false);
        }
      });
    } catch (err) {
      console.error('fetchTransactions error', err);
      toast.error('Gagal memuat data transaksi');
      setLoading(false);
    }
  };

  const handleFilter = async (e) => {
    e?.preventDefault();
    await fetchTransactions({ from: start, to: end, page: 1 });
  };

  const resetFilter = async () => {
    setStart('');
    setEnd('');
    await fetchTransactions({ from: '', to: '', page: 1 });
  };

  const handleExportCsv = () => {
    let csv = 'Tanggal,No Transaksi,Tipe,Pihak,Toko,Gudang,Produk,Kategori,Subkategori,Qty,Sisa Stok,Unit,Harga Beli,Subtotal,Status,Catatan\n';
    table.getFilteredRowModel().rows.forEach((row) => {
      const t = row.original;
      const prodNames = (t.details && t.details.length) ? t.details.map(d => d.product?.name || d.product_name || '-').join('|') : (t.product?.name || '-');
      const prodCats = (t.details && t.details.length) ? t.details.map(d => d.product?.category?.name || d.product?.category_name || '-').join('|') : (t.product?.category?.name || t.product?.category_name || '-');
      const prodSubs = (t.details && t.details.length) ? t.details.map(d => d.product?.subcategory?.name || d.product?.subcategory_name || '-').join('|') : (t.product?.subcategory?.name || t.product?.subcategory_name || '-');
      const tanggal = t.transaction_datetime_iso || t.transaction_date_local || t.transaction_date || '';
      const hargaBeli = (t.harga_beli ?? t.product?.purchase_price) || '';
      csv += `"${tanggal}","${t.transaction_number || ''}","${t.transaction_type || ''}","${t.related_party || ''}","${t.toko?.name || ''}","${t.warehouse?.name || ''}","${prodNames}","${prodCats}","${prodSubs}","${t.total_quantity || t.quantity || ''}","${t.remaining_stock || ''}","${t.unit?.name || t.unit?.symbol || ''}","${hargaBeli}","${t.subtotal || ''}","${t.payment_status || ''}","${(t.notes || '').replace(/\n/g, ' ')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-histories-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Data berhasil diekspor');
  };

  return (
    <DashboardLayout sidebarOpen={sidebarOpen}>
      <Head title="Histori Transaksi" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Histori Transaksi</h1>
            <p className="text-sm text-gray-500">Daftar histori transaksi</p>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded p-4">
          <form onSubmit={handleFilter} className="flex gap-2 items-end">
            <div>
              <label className="block text-sm text-gray-700">Dari</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">Sampai</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="border rounded px-2 py-1" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded" disabled={loading}>{loading ? 'Memuat...' : 'Filter'}</button>
              <button type="button" onClick={resetFilter} className="border px-3 py-1 rounded">Reset</button>
              <button type="button" onClick={handleExportCsv} className="border px-3 py-1 rounded">Export CSV</button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-sm rounded p-4">
          {/* Global Filter */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm"
            />
          </div>

          <ScrollArea className="w-full">
            <table className="w-full text-sm border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 py-3 text-left font-medium text-gray-900 cursor-pointer select-none"
                        style={{ width: header.getSize() }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={`w-3 h-3 ${header.column.getIsSorted() === 'asc'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                  }`}
                              />
                              <ChevronDown
                                className={`w-3 h-3 -mt-1 ${header.column.getIsSorted() === 'desc'
                                    ? 'text-blue-600'
                                    : 'text-gray-400'
                                  }`}
                              />
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-2 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>

          {/* TanStack Table Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Menampilkan {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} sampai{' '}
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getFilteredRowModel().rows.length
                )}{' '}
                dari {table.getFilteredRowModel().rows.length} hasil
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Sebelumnya
              </button>
              <span className="text-sm text-gray-600">
                Halaman {table.getState().pagination.pageIndex + 1} dari {table.getPageCount()}
              </span>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

