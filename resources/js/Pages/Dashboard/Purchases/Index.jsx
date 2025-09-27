import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm, router } from "@inertiajs/react";
import { toast } from "react-toastify";

export default function Index({ purchases = [] }) {
   const { delete: destroy } = useForm();

   const [search, setSearch] = useState("");
   const [debouncedSearch, setDebouncedSearch] = useState("");
   const [filterStartDate, setFilterStartDate] = useState("");
   const [filterEndDate, setFilterEndDate] = useState("");
   const [filterSupplier, setFilterSupplier] = useState("");
   const [filterWarehouse, setFilterWarehouse] = useState("");

   // Debounce search input
   useEffect(() => {
      const timer = setTimeout(() => {
         setDebouncedSearch(search);
      }, 300);
      return () => clearTimeout(timer);
   }, [search]);

   // Function to reload with filters
   const reloadWithFilters = (params) => {
      router.visit(route('purchases.index'), {
         data: params,
         preserveScroll: true,
         only: ['purchases'],
      });
   };

   // Handle filter changes
   const handleSearchChange = (value) => {
      setSearch(value);
   };

   const handleDateChange = (start, end) => {
      setFilterStartDate(start);
      setFilterEndDate(end);
      const params = {};
      if (start) params.start_date = start;
      if (end) params.end_date = end;
      reloadWithFilters(params);
   };

   const handleSupplierChange = (value) => {
      setFilterSupplier(value);
      const params = { supplier: value };
      reloadWithFilters(params);
   };

   const handleWarehouseChange = (value) => {
      setFilterWarehouse(value);
      const params = { warehouse: value };
      reloadWithFilters(params);
   };

   // Reload when debounced search changes
   useEffect(() => {
      if (debouncedSearch !== "") {
         const params = { search: debouncedSearch };
         reloadWithFilters(params);
      }
   }, [debouncedSearch]);

   const supplierList = useMemo(() => {
      const names = purchases.data ? purchases.data.map((p) => p.supplier?.name).filter(Boolean) : [];
      return [...new Set(names)];
   }, [purchases.data]);

   const warehouseList = useMemo(() => {
      const names = purchases.data ? purchases.data.map((p) => p.warehouse?.name).filter(Boolean) : [];
      return [...new Set(names)];
   }, [purchases.data]);

   const handleDelete = (id) => {
      if (confirm("Yakin hapus pembelian ini?")) {
         destroy(route("purchases.destroy", id), {
            onSuccess: () => toast.success("Berhasil dihapus"),
            onError: () => toast.error("Gagal menghapus"),
         });
      }
   };

   const filtered = useMemo(() => {
      return purchases.data || [];
   }, [purchases.data]);

   const warehouseGroups = useMemo(() => {
      const groups = {};
      filtered.forEach((p) => {
         const warehouseName = p.warehouse?.name || "-";
         if (!groups[warehouseName]) groups[warehouseName] = [];
         p.items?.forEach((item) => {
            groups[warehouseName].push({ purchase: p, item });
         });
      });
      return groups;
   }, [filtered]);

   const grandTotal = Object.values(warehouseGroups)
      .flat()
      .reduce((total, { item }) => total + (item.subtotal || 0), 0);

   return (
      <>
         <Head title="Pembelian" />
         <div className="p-4 sm:p-6 lg:p-8 w-full min-h-screen flex flex-col">
            <div className="container mx-auto space-y-6">
               {/* Header & Actions */}
               <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <h1 className="text-2xl font-bold">Daftar Pembelian</h1>
                  <div className="flex flex-wrap gap-2">
                     <Link
                        href={route("purchases.create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
                     >
                        + Tambah Pembelian
                     </Link>
                     <a
                        href={route("purchases.export", {
                           format: "excel",
                        })}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        Export Excel
                     </a>
                     <a
                        href={route("purchases.export", {
                           format: "pdf",
                        })}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                     >
                        Export PDF
                     </a>
                  </div>
               </div>

               {/* Filter Bar */}
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  <input
                     type="text"
                     placeholder="Cari supplier/produk..."
                     value={search}
                     onChange={(e) => handleSearchChange(e.target.value)}
                     className="px-3 py-2 rounded border text-sm w-full"
                  />
                  <input
                     type="date"
                     value={filterStartDate}
                     onChange={(e) => handleDateChange(e.target.value, filterEndDate)}
                     className="px-3 py-2 rounded border text-sm w-full"
                  />
                  <input
                     type="date"
                     value={filterEndDate}
                     onChange={(e) => handleDateChange(filterStartDate, e.target.value)}
                     className="px-3 py-2 rounded border text-sm w-full"
                  />
                  <select
                     value={filterSupplier}
                     onChange={(e) => handleSupplierChange(e.target.value)}
                     className="px-3 py-2 rounded border text-sm w-full"
                  >
                     <option value="">Semua Supplier</option>
                     {supplierList.map((s, i) => (
                        <option key={i} value={s}>
                           {s}
                        </option>
                     ))}
                  </select>
                  <select
                     value={filterWarehouse}
                     onChange={(e) => handleWarehouseChange(e.target.value)}
                     className="px-3 py-2 rounded border text-sm w-full"
                  >
                     <option value="">Semua Gudang</option>
                     {warehouseList.map((w, i) => (
                        <option key={i} value={w}>
                           {w}
                        </option>
                     ))}
                  </select>
               </div>

               {/* Table with Scroll */}
               {filtered.length === 0 ? (
                  <p className="text-gray-500">Tidak ada data pembelian.</p>
               ) : (
                  <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
                     <div className="overflow-x-auto">
                        <div className="max-h-[60vh] overflow-y-auto">
                           <table className="min-w-[1100px] w-full divide-y divide-gray-200 dark:divide-gray-600 text-sm leading-relaxed">
                              <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0 z-10">
                                 <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Tanggal</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Supplier</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Gudang</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Subkategori</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Produk</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Qty</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Harga</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Kuli Fee</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Timbangan</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Subtotal</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Toko</th>
                                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-gray-100">Aksi</th>
                                 </tr>
                              </thead>
                              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                                 {filtered.flatMap((p) => (
                                    (p.items || []).map((it) => ({
                                       id: `${p.id}-${it.id || Math.random()}`,
                                       tanggal: p.purchase_date,
                                       supplier: p.supplier?.name || "-",
                                       gudang: p.warehouse?.name || "-",
                                       subkategori: it.subcategory?.name || "-",
                                       produk: it.product?.name || "-",
                                       qty: it.qty || 0,
                                       unit: it.unit?.name || "",
                                       harga: it.harga_pembelian || 0,
                                       kuli_fee: it.kuli_fee || 0,
                                       timbangan: it.timbangan ?? null,
                                       subtotal: it.subtotal || 0,
                                       toko: p.toko?.name || "-",
                                       purchaseId: p.id,
                                    }))
                                 )).map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{new Date(row.tanggal).toLocaleDateString("id-ID")}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.supplier}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.gudang}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.subkategori}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.produk}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{`${row.qty} ${row.unit}`}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">Rp {Number(row.harga || 0).toLocaleString("id-ID")}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">Rp {Number(row.kuli_fee || 0).toLocaleString("id-ID")}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                                          {row.timbangan !== null && row.timbangan !== undefined ? `Rp ${Number(row.timbangan).toLocaleString("id-ID")}` : "-"}
                                       </td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">Rp {Number(row.subtotal || 0).toLocaleString("id-ID")}</td>
                                       <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{row.toko}</td>
                                       <td className="px-4 py-3">
                                          <div className="flex flex-wrap gap-1">
                                             <Link href={route("purchases.receipt", row.purchaseId)} className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 transition-colors" target="_blank">Cetak Nota</Link>
                                             <Link href={route("purchases.show", row.purchaseId)} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors">Lihat</Link>
                                             <Link href={route("purchases.edit", row.purchaseId)} className="text-xs bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500 transition-colors">Edit</Link>
                                             <button onClick={() => handleDelete(row.purchaseId)} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Hapus</button>
                                          </div>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </div>

                     {/* Pagination controls */}
                     <div className="flex items-center justify-between p-3">
                        <div className="text-sm text-gray-700">
                           Menampilkan {purchases.from || 0} sampai {purchases.to || 0} dari {purchases.total || 0} hasil
                        </div>
                        <div className="space-x-2">
                           {purchases.links?.map((link, index) => (
                              <button
                                 key={index}
                                 onClick={() => {
                                    if (link.url) {
                                       router.visit(link.url, {
                                          preserveState: true,
                                          preserveScroll: true,
                                       });
                                    }
                                 }}
                                 disabled={!link.url}
                                 className={`px-3 py-1 border rounded ${link.active ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                 dangerouslySetInnerHTML={{ __html: link.label }}
                              />
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* Grand Total */}
               <div className="text-right text-lg font-semibold text-green-700 dark:text-green-300">
                  Total Seluruh Pembelian: Rp{" "}
                  {grandTotal.toLocaleString("id-ID")}
               </div>
            </div>
         </div>
      </>
   );
}

Index.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
