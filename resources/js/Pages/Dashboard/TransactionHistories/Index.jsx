import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, Link } from '@inertiajs/react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Clean, minimal Transaction Histories index page.
export default function Index({ transactions = { data: [], links: [], current_page: 1, per_page: 15 }, filters = {}, sidebarOpen }) {
  const [start, setStart] = useState(filters.from || '');
  const [end, setEnd] = useState(filters.to || '');
  const [transactionsState, setTransactionsState] = useState(transactions || { data: [], links: [], current_page: 1, per_page: 15 });
  const [loading, setLoading] = useState(false);

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

  const fetchTransactions = async (params = {}) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        from: params.from ?? start || '',
        to: params.to ?? end || '',
        page: (params.page || 1).toString(),
        per_page: (params.per_page || transactionsState.per_page || 15).toString(),
      });

      const res = await fetch(`${route('transaction-histories.index')}?${qs.toString()}`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTransactionsState(data);
    } catch (err) {
      console.error('fetchTransactions error', err);
      toast.error('Gagal memuat data transaksi');
    } finally {
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
    let csv = 'Tanggal,No Transaksi,Tipe,Pihak,Toko,Gudang,Produk,Kategori,Subkategori,Qty,Unit,Harga Beli,Subtotal,Status,Catatan\n';
    (transactionsState.data || []).forEach((t) => {
      const prodNames = (t.details && t.details.length) ? t.details.map(d => d.product?.name || d.product_name || '-').join('|') : (t.product?.name || '-');
      const prodCats = (t.details && t.details.length) ? t.details.map(d => d.product?.category?.name || d.product?.category_name || '-').join('|') : (t.product?.category?.name || t.product?.category_name || '-');
      const prodSubs = (t.details && t.details.length) ? t.details.map(d => d.product?.subcategory?.name || d.product?.subcategory_name || '-').join('|') : (t.product?.subcategory?.name || t.product?.subcategory_name || '-');
      const tanggal = t.transaction_datetime_iso || t.transaction_date_local || t.transaction_date || '';
      const hargaBeli = (t.harga_beli ?? t.product?.purchase_price) || '';
      csv += `"${tanggal}","${t.transaction_number || ''}","${t.transaction_type || ''}","${t.related_party || ''}","${t.toko?.name || ''}","${t.warehouse?.name || ''}","${prodNames}","${prodCats}","${prodSubs}","${t.quantity || ''}","${t.unit || ''}","${hargaBeli}","${t.subtotal || ''}","${t.payment_status || ''}","${(t.notes || '').replace(/\n/g, ' ')}"\n`;
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

  const data = transactionsState?.data || [];
  const pager = transactionsState && Object.keys(transactionsState).length ? transactionsState : { current_page: 1, per_page: 15, links: [] };

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
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-auto">
              <thead>
                <tr className="text-left">
                  <th className="px-2 py-1">#</th>
                  <th className="px-2 py-1">Nomor</th>
                  <th className="px-2 py-1">Tipe</th>
                  <th className="px-2 py-1">Produk</th>
                  <th className="px-2 py-1">Kategori</th>
                  <th className="px-2 py-1">Subkategori</th>
                  <th className="px-2 py-1">Qty</th>
                  <th className="px-2 py-1">Harga Beli</th>
                  <th className="px-2 py-1">Tanggal</th>
                  <th className="px-2 py-1">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((r, idx) => (
                  <tr key={r.id || idx} className="border-t">
                    <td className="px-2 py-1">{idx + 1 + ((pager.current_page - 1) * pager.per_page || 0)}</td>
                    <td className="px-2 py-1">{r.transaction_number}</td>
                    <td className="px-2 py-1">{r.transaction_type}</td>
                    <td className="px-2 py-1">{r.product?.name || r.product_name || (r.details && r.details[0]?.product?.name) || '-'}</td>
                    <td className="px-2 py-1">{r.product?.category?.name || r.product?.category_name || '-'}</td>
                    <td className="px-2 py-1">{r.product?.subcategory?.name || r.product?.subcategory_name || '-'}</td>
                    <td className="px-2 py-1">{r.quantity || r.total_quantity || '-'}</td>
                    <td className="px-2 py-1">{r.harga_beli ?? r.product?.purchase_price ?? '-'}</td>
                    <td className="px-2 py-1">{fmtDate(r.transaction_datetime_iso || r.transaction_datetime_local || r.transaction_date)}</td>
                    <td className="px-2 py-1"><Link href={route('transaction-histories.show', r.id)} className="text-blue-600">Lihat</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* simple pager */}
          {pager.links && pager.links.length > 0 && (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-600">Halaman {pager.current_page} dari {pager.last_page || Math.ceil((pager.total || 0) / (pager.per_page || 15))}</div>
              <div className="flex gap-2">
                {pager.links.map((l, i) => (
                  <button key={i} className={`px-2 py-1 rounded ${l.active ? 'bg-gray-200' : 'border'}`} disabled={!l.url} onClick={() => fetchTransactions({ page: (() => { try { return new URL(l.url).searchParams.get('page') || 1 } catch (e) { return 1 } })() })} dangerouslySetInnerHTML={{ __html: l.label }} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

