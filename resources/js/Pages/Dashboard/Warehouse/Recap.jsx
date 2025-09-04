import React, { useState } from "react";
import DashboardLayout from '@/Layouts/DashboardLayout';
import { Head, router, usePage } from "@inertiajs/react";
import Input from '@/Components/Dashboard/Input';
import Button from '@/Components/Dashboard/Button';
import { ExcelIcon } from '@/Components/Dashboard/ExportIcons';

export default function WarehouseRecap({ warehouses, totalWarehouse = 0, start_date = '', end_date = '' }) {
  const { errors } = usePage().props;
  const [start, setStart] = useState(start_date || "");
  const [end, setEnd] = useState(end_date || "");

  const handleFilter = (e) => {
    e.preventDefault();
    router.get(route('dashboard.warehouses.recap'), { start_date: start, end_date: end });
  };

  const handleExport = () => {
    let csv = 'Nama,Lokasi,Deskripsi,Dibuat Pada\n';
    warehouses.data.forEach(w => {
      csv += `${w.name},${w.location || ''},${w.description || ''},${w.created_at}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-warehouse.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Head title="Rekap Warehouse" />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-blue-700">Rekap Data Warehouse</h1>
        <form onSubmit={handleFilter} className="flex gap-2 items-center bg-white p-2 rounded shadow">
          <Input type="date" label="Dari" value={start} onChange={e => setStart(e.target.value)} className="min-w-[150px]" />
          <span className="mx-1">s/d</span>
          <Input type="date" label="Sampai" value={end} onChange={e => setEnd(e.target.value)} className="min-w-[150px]" />
          <Button type="submit" label="Filter" className="bg-blue-600 hover:bg-blue-700 text-white shadow transition-all px-6 py-2 rounded-lg font-semibold flex items-center gap-2" />
        </form>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-300 rounded shadow text-center">
          <div className="text-gray-500 text-sm">Total Warehouse</div>
          <div className="text-2xl font-bold text-blue-900">{totalWarehouse}</div>
        </div>
      </div>
      <div className="flex justify-end mt-6 gap-2 flex-wrap">
        <Button type="button" label="Export CSV" icon={<ExcelIcon className="w-5 h-5" />} onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow w-full sm:w-auto" />
      </div>
      <div className="mt-8 bg-white rounded shadow p-4 overflow-x-auto">
        <table className="min-w-[600px] text-sm w-full">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="p-2">No</th>
              <th className="p-2">Nama</th>
              <th className="p-2">Lokasi</th>
              <th className="p-2">Deskripsi</th>
              <th className="p-2">Dibuat Pada</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.data.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-400">Tidak ada data warehouse</td></tr>
            ) : (
              warehouses.data.map((w, i) => (
                <tr key={w.id} className="border-b hover:bg-blue-50 text-black">
                  <td className="p-2 text-center">{i + 1 + ((warehouses.current_page-1) * warehouses.per_page)}</td>
                  <td className="p-2 font-semibold">{w.name}</td>
                  <td className="p-2">{w.location}</td>
                  <td className="p-2">{w.description}</td>
                  <td className="p-2">{w.created_at?.slice(0,10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div className="mt-4 flex justify-end gap-2 flex-wrap">
          {warehouses.links && warehouses.links.map((link, i) => (
            <Button key={i} label={link.label.replace(/&laquo;|&raquo;|&lsaquo;|&rsaquo;/g, '')} onClick={() => link.url && router.get(link.url)} disabled={!link.url} className={link.active ? 'bg-blue-500 text-white' : ''} />
          ))}
        </div>
      </div>
    </>
  );
}

WarehouseRecap.layout = page => <DashboardLayout children={page} />;
