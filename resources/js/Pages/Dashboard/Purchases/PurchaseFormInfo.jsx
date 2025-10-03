import React, { useEffect, useState } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/Components/ui/select";
import TokoManualModal from "./TokoManualModal";
import SupplierManualModal from "./SupplierManualModal";

export default function PurchaseFormInfo({
   data,
   suppliers,
   tokos,
   products = [], // Tambahkan props products
   handleChange,
   setData,
   location,
   // Toko
   showTokoModal,
   setShowTokoModal,
   manualToko,
   setManualToko,
   handleManualTokoChange,
   handleManualTokoSubmit,
   // Supplier
   showSupplierModal,
   setShowSupplierModal,
   manualSupplier,
   setManualSupplier,
   handleManualSupplierChange,
   handleManualSupplierSubmit,
   manualSupplierErrors = {},
   manualSupplierSubmitting = false,
}) {
   useEffect(() => {
      if (location && (!data.toko_name || data.toko_name === "")) {
         setData("toko_name", location);
         setData("toko_id", null);
      }
   }, [location]);

   // Fetch next invoice number for given purchase_date and supplier
   useEffect(() => {
      const fetchNext = async () => {
         if (!data.purchase_date) return;
         try {
            // Build query parameters
            const params = new URLSearchParams({
               date: data.purchase_date,
            });

            // Add supplier_id if selected
            if (data.supplier_id) {
               params.append('supplier_id', data.supplier_id);
            }

            console.log('Fetching invoice with supplier_id:', data.supplier_id);

            // use explicit dashboard-prefixed path to match routes group
            const url =
               typeof route === "function" &&
                  typeof route("purchases.next-invoice") === "string"
                  ? route("purchases.next-invoice", {
                     date: data.purchase_date,
                     supplier_id: data.supplier_id || undefined,
                  })
                  : `/dashboard/purchases/next-invoice?${params.toString()}`;
            const res = await fetch(url, {
               headers: {
                  Accept: "application/json",
                  "X-Requested-With": "XMLHttpRequest",
               },
               // include credentials (cookies) to support authenticated dashboard routes
               credentials: "include",
               // avoid stale cache for diagnostic
               cache: "no-store",
            });
            console.debug("next-invoice fetch", url, "status", res.status);
            if (res.status === 401) {
               console.warn(
                  "next-invoice: 401 Unauthorized — session/cookie may be missing. Ensure you are logged in and assets are fresh."
               );
               return;
            }
            if (res.status === 404) {
               console.warn(
                  "next-invoice: 404 Not Found — route may be unreachable. URL:",
                  url
               );
               return;
            }
            if (!res.ok) return;
            const json = await res.json();
            console.log('Received invoice number:', json);
            if (json && json.invoice_number) {
               setData("invoice_number", json.invoice_number);
               // keep optional invoice_seq if needed elsewhere
               setData("invoice_seq", json.invoice_seq || "");
            }
         } catch (e) {
            console.error("Failed to fetch next invoice:", e);
         }
      };
      fetchNext();
   }, [data.purchase_date, data.supplier_id]); // Add supplier_id as dependency

   return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
         {/* Kolom Kiri: Form Informasi Pembelian */}
         <div>
            <Card>
               <CardContent>
                  <div className="flex  items-start gap-4">
                     <div className="flex-1">
                        <label className="block p-2 mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">
                           Lokasi
                        </label>
                        <Input
                           type="text"
                           name="toko_name"
                           value={data.toko_name || location || ""}
                           onChange={handleChange}
                           className="text-base bg-gray-50 dark:bg-gray-800 dark:text-gray-200"
                           readOnly
                        />

                        {data.toko_name && !data.toko_id && (
                           <div className=" p-2 mt-3 text-sm rounded bg-gray-50 dark:bg-gray-800 dark:text-gray-200">
                              <div>
                                 <span className="font-semibold">
                                    Nama:
                                 </span>{" "}
                                 {data.toko_name}
                              </div>
                           </div>
                        )}
                     </div>
                     {/* Keep a small area for date or helper text */}
                     <div className=" p-2 text-sm text-right text-gray-500 w-44 dark:text-gray-400">
                        Tgl: {data.purchase_date || "-"}
                     </div>
                  </div>
               </CardContent>
               <CardHeader>
                  <CardTitle>Informasi Pembelian</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 dark:text-gray-200">
                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                           Tanggal
                        </label>
                        <Input
                           type="date"
                           name="purchase_date"
                           value={data.purchase_date}
                           onChange={handleChange}
                           className="text-base bg-gray-50 dark:bg-gray-800 dark:text-gray-200 w-50"
                           required
                        />
                     </div>

                     {/* No. urut invoice di-generate otomatis di backend; input manual dihapus */}

                     <div className="md:col-span-2 ">
                        <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
                           No. Invoice (Otomatis)
                        </label>
                        <span className="block w-full px-4 py-3 text-base border rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-200">
                           {data.invoice_number || "-"}
                        </span>
                     </div>

                     <div className="md:col-span-2">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                           Supplier
                        </label>
                        <div className="flex gap-3">
                           <div className="flex-1">
                              <Select
                                 key={`supplier-select-${suppliers.length}`}
                                 value={data.supplier_name || ""}
                                 onValueChange={(value) => {
                                    handleChange({
                                       target: {
                                          name: "supplier_name",
                                          value,
                                       },
                                    });
                                 }}
                              >
                                 <SelectTrigger className="text-base">
                                    <SelectValue placeholder="Pilih Supplier" />
                                 </SelectTrigger>
                                 <SelectContent
                                    className="z-[100] max-h-60"
                                    position="popper"
                                    sideOffset={4}
                                 >
                                    {suppliers
                                       .filter(
                                          (supplier, index, self) =>
                                             index ===
                                             self.findIndex(
                                                (s) =>
                                                   s.name ===
                                                   supplier.name
                                             )
                                       )
                                       .map((s) => (
                                          <SelectItem
                                             key={`supplier-${s.id}-${s.name}`}
                                             value={s.name}
                                          >
                                             {s.name}
                                          </SelectItem>
                                       ))}
                                 </SelectContent>
                              </Select>
                           </div>
                           <Button
                              type="button"
                              variant="outline"
                              size="lg"
                              onClick={() => {
                                 setManualSupplier({
                                    name: "",
                                    address: "",
                                    phone: "",
                                 });
                                 setShowSupplierModal(true);
                              }}
                              title="Tambah Supplier Manual"
                           >
                              +
                           </Button>
                        </div>

                        {data.supplier_name &&
                           !suppliers.some(
                              (s) => s.name === data.supplier_name
                           ) && (
                              <div className="p-3 mt-3 text-sm border rounded bg-gray-50">
                                 <div>
                                    <span className="font-semibold">
                                       Nama:
                                    </span>{" "}
                                    {data.supplier_name}
                                 </div>
                                 <div>
                                    <span className="font-semibold">
                                       Alamat:
                                    </span>{" "}
                                    {data.address}
                                 </div>
                                 <div>
                                    <span className="font-semibold">
                                       Telepon:
                                    </span>{" "}
                                    {data.phone}
                                 </div>
                              </div>
                           )}
                     </div>

                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                           No. Telp Supplier
                        </label>
                        <Input
                           type="text"
                           name="phone"
                           value={data.phone}
                           onChange={handleChange}
                           className="text-base"
                        />
                     </div>

                     <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                           Alamat Supplier
                        </label>
                        <Input
                           type="text"
                           name="address"
                           value={data.address}
                           onChange={handleChange}
                           className="text-base"
                        />
                     </div>
                  </div>

               </CardContent>

            </Card>
         </div>

         {/* Kolom Kanan: Card Produk Supplier */}
         <div>
            {data.supplier_name ? (
               <Card className="border-blue-200 bg-blue-50/30 sticky top-4">
                  <CardHeader className="pb-3">
                     <CardTitle className="flex items-center gap-2 text-base">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-blue-900">
                           Produk dari Supplier: <span className="font-bold">{data.supplier_name}</span>
                        </span>
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-[600px] overflow-y-auto">
                     {(() => {
                        // Filter produk berdasarkan supplier yang dipilih
                        const selectedSupplier = suppliers.find(s => s.name === data.supplier_name);
                        let supplierProducts = selectedSupplier
                           ? products.filter(p => p.supplier_id === selectedSupplier.id)
                           : [];

                        if (supplierProducts.length === 0) {
                           return (
                              <div className="p-4 text-center text-gray-500 bg-white border border-dashed rounded-lg">
                                 <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                 </svg>
                                 <p className="font-medium">Tidak ada produk</p>
                                 <p className="text-sm">Supplier ini belum memiliki produk terdaftar</p>
                              </div>
                           );
                        }

                        return (
                           <div className="space-y-3">
                              <div className="flex items-center justify-between p-2 mb-2 rounded bg-blue-100/50">
                                 <span className="text-sm font-medium text-blue-900">
                                    Total: {supplierProducts.length} produk
                                 </span>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                 {supplierProducts.map((product, index) => (
                                    <div
                                       key={product.id || index}
                                       className="p-3 transition-shadow bg-white border rounded-lg shadow-sm hover:shadow-md"
                                    >
                                       <div className="flex items-start justify-between mb-2">
                                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                                             {product.category && product.subcategory
                                                ? `${product.category.name} ${product.subcategory.name} - ${product.name}`
                                                : product.category
                                                   ? `${product.category.name} - ${product.name}`
                                                   : product.subcategory
                                                      ? `${product.subcategory.name} - ${product.name}`
                                                      : product.name
                                             }
                                          </h4>
                                          <span className="px-2 py-1 ml-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-full whitespace-nowrap">
                                             #{index + 1}
                                          </span>
                                       </div>

                                       {product.barcode && (
                                          <div className="flex items-center gap-1 text-xs text-gray-600">
                                             <span className="font-medium">Barcode:</span>
                                             <code className="px-1.5 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 font-mono">
                                                {product.barcode}
                                             </code>
                                          </div>
                                       )}
                                    </div>
                                 ))}
                              </div>
                           </div>
                        );
                     })()}
                  </CardContent>
               </Card>
            ) : (
               <Card className="border-gray-200 bg-gray-50/30">
                  <CardContent className="p-8 text-center text-gray-500">
                     <svg className="w-16 h-16 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                     </svg>
                     <p className="text-sm font-medium">Pilih supplier untuk melihat produk</p>
                  </CardContent>
               </Card>
            )}
         </div>

         {/* Modals */}
         <TokoManualModal
            show={showTokoModal}
            onClose={() => setShowTokoModal(false)}
            onSubmit={handleManualTokoSubmit}
            manualToko={manualToko}
            onChange={handleManualTokoChange}
         />
         <SupplierManualModal
            show={showSupplierModal}
            onClose={() => setShowSupplierModal(false)}
            onSubmit={handleManualSupplierSubmit}
            manualSupplier={manualSupplier}
            onChange={handleManualSupplierChange}
            errors={typeof manualSupplierErrors !== 'undefined' ? manualSupplierErrors : {}}
            submitting={typeof manualSupplierSubmitting !== 'undefined' ? manualSupplierSubmitting : false}
         />
      </div>

   );
}
