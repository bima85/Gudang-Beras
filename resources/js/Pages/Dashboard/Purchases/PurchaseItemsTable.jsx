import React from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
   TableFooter,
} from "@/Components/ui/table";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { CardHeader, CardTitle } from "@/Components/ui/card";

export default function PurchaseItemsTable({
   items = [],
   products = [],
   units = [],
   categories = [],
   subcategories = [],
   supplierName = "",
   onRemove,
   onKuliFeeCheckboxChange,
   onKuliFeeChange,
   onKuliManualChange = () => { },
   timbanganGlobal = 0,
   setTimbanganGlobal = () => { },
   onItemUpdate = () => { },
}) {
   // Hitung subtotal untuk setiap item
   const subtotals = items.map((item) => {
      if (!item) return 0;
      const harga = parseFloat(item.harga_pembelian) || 0;
      const qty = parseFloat(item.qty) || 0;
      let unitConversion = 1;
      if (item.unit_id && Array.isArray(units)) {
         const unitObj = units.find((u) => String(u.id) === String(item.unit_id));
         if (unitObj && unitObj.conversion_to_kg) {
            unitConversion = parseFloat(unitObj.conversion_to_kg) || 1;
         }
      }
      return qty * unitConversion * harga;
   });
   const totalSubtotals = subtotals.reduce((sum, val) => sum + val, 0);

   // Hitung total fee kuli berdasarkan tiap item (flat fee per item)
   const kuliTotal = items.reduce((sum, item) => {
      if (!item) return sum;
      const feeRate = parseFloat(item.kuli_fee) || 0;
      return sum + feeRate;
   }, 0);

   const kuliRates = items.filter(Boolean).map((it) => parseFloat(it.kuli_fee) || 0);
   const kuliRateUniform = kuliRates.length > 0 && kuliRates.every((r) => r === kuliRates[0]);
   const kuliRate = kuliRateUniform ? kuliRates[0] : 0;

   // Hitung total timbangan sebagai pengurang flat sekali dari total (bukan per item)
   const timbanganFlat = Number(timbanganGlobal) || 0;
   const totalTimbangan = -timbanganFlat;

   const totalFinal = totalSubtotals - kuliTotal + totalTimbangan;

   // Local state to toggle timbangan input visibility
   const [showTimbangan, setShowTimbangan] = React.useState(Boolean(Number(timbanganGlobal)));
   React.useEffect(() => {
      setShowTimbangan(Boolean(Number(timbanganGlobal)));
   }, [timbanganGlobal]);

   // State untuk format currency di input fee kuli
   const [kuliFeeDisplay, setKuliFeeDisplay] = React.useState("");

   // State untuk format currency di input harga per item (array untuk setiap item)
   const [hargaDisplays, setHargaDisplays] = React.useState({});

   // State untuk format currency di input timbangan
   const [timbanganDisplay, setTimbanganDisplay] = React.useState("");

   // Update display ketika kuliRate berubah
   React.useEffect(() => {
      if (kuliRate > 0) {
         setKuliFeeDisplay(kuliRate.toLocaleString("id-ID"));
      } else {
         setKuliFeeDisplay("");
      }
   }, [kuliRate]);

   // Update display harga ketika items berubah
   React.useEffect(() => {
      const newDisplays = {};
      items.filter(Boolean).forEach((item, idx) => {
         if (item.harga_pembelian > 0) {
            newDisplays[idx] = item.harga_pembelian.toLocaleString("id-ID");
         } else {
            newDisplays[idx] = "";
         }
      });
      setHargaDisplays(newDisplays);
   }, [items]);

   // Update display timbangan ketika timbanganGlobal berubah
   React.useEffect(() => {
      if (timbanganGlobal > 0) {
         setTimbanganDisplay(timbanganGlobal.toLocaleString("id-ID"));
      } else {
         setTimbanganDisplay("");
      }
   }, [timbanganGlobal]);

   // Handler untuk format currency input fee kuli
   const handleKuliFeeInput = (e) => {
      const value = e.target.value;
      // Remove non-digit characters
      const numericValue = value.replace(/\D/g, "");
      const numberValue = Number(numericValue) || 0;

      // Update parent dengan nilai numeric
      if (typeof onKuliFeeChange === "function") {
         onKuliFeeChange(numberValue);
      }

      // Update display dengan format
      if (numericValue) {
         setKuliFeeDisplay(numberValue.toLocaleString("id-ID"));
      } else {
         setKuliFeeDisplay("");
      }
   };

   // Handler untuk format currency input harga per item
   const handleHargaInput = (idx, item, value) => {
      // Remove non-digit characters
      const numericValue = value.replace(/\D/g, "");
      const numberValue = Number(numericValue) || 0;

      // Update item
      const updatedItem = { ...item, harga_pembelian: numberValue };
      onItemUpdate(idx, updatedItem);

      // Update display dengan format
      setHargaDisplays(prev => ({
         ...prev,
         [idx]: numericValue ? numberValue.toLocaleString("id-ID") : ""
      }));
   };

   // Handler untuk format currency input timbangan
   const handleTimbanganInput = (e) => {
      const value = e.target.value;
      // Remove non-digit characters
      const numericValue = value.replace(/\D/g, "");
      const numberValue = Number(numericValue) || 0;

      // Update parent dengan nilai numeric
      setTimbanganGlobal(numberValue);

      // Update display dengan format
      if (numericValue) {
         setTimbanganDisplay(numberValue.toLocaleString("id-ID"));
      } else {
         setTimbanganDisplay("");
      }
   };

   return (
      <div className="mt-4 ">
         {/* Supplier Info Header */}
         {supplierName && (
            <div className="mb-3 m-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
               <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <div>
                     <span className="text-lg text-blue-600 font-medium">Supplier</span>
                     <p className="text-sm font-semibold text-blue-900">{supplierName}</p>
                  </div>
               </div>
            </div>
         )}

         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead className="w-8">#</TableHead>
                  <TableHead className="min-w-[180px]">Produk</TableHead>
                  <TableHead className="min-w-[120px]">Kategori</TableHead>
                  <TableHead className="min-w-[120px]">Subkategori</TableHead>
                  <TableHead className="w-24 text-right">Qty</TableHead>
                  <TableHead className="w-28">Unit</TableHead>
                  <TableHead className="w-28 text-right">Gudang</TableHead>
                  <TableHead className="w-28 text-right">Toko (Auto)</TableHead>
                  <TableHead className="w-32 text-right">Harga</TableHead>
                  <TableHead className="w-32 text-right">Subtotal</TableHead>
                  <TableHead className="w-20">Aksi</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {items.filter(Boolean).map((item, idx) => {
                  const harga = parseFloat(item.harga_pembelian) || 0;
                  const qty = parseFloat(item.qty) || 0;
                  let unitConversion = 1;
                  if (item.unit_id && Array.isArray(units)) {
                     const unitObj = units.find((u) => String(u.id) === String(item.unit_id));
                     if (unitObj && unitObj.conversion_to_kg) {
                        unitConversion = parseFloat(unitObj.conversion_to_kg) || 1;
                     }
                  }
                  const subtotal = qty * unitConversion * harga;
                  const kuliFlat = parseFloat(item.kuli_fee) || 0;
                  const displaySubtotal = subtotal; // Fee kuli adalah PENAMBAHAN biaya

                  return (
                     <TableRow key={idx}>
                        <TableCell className="font-medium w-8">{idx + 1}</TableCell>
                        <TableCell>
                           <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                 {products.find((p) => p.id == item.product_id)?.name || "-"}
                              </span>
                              {/* <span className="text-xs text-muted-foreground">
                                            {units.find((u) => u.id == item.unit_id)?.name || ""}
                                        </span> */}
                           </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                           {categories.find((c) => c.id == item.category_id)?.name || "-"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                           {subcategories.find((sc) => sc.id == item.subcategory_id)?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                           <Input
                              type="number"
                              value={item.qty || ""}
                              onChange={(e) => {
                                 const newQty = parseFloat(e.target.value) || 0;
                                 const updatedItem = { ...item, qty: newQty };
                                 onItemUpdate(idx, updatedItem);
                              }}
                              className="w-20 h-8 text-right px-2"
                              min="0"
                              step="0.01"
                           />
                        </TableCell>
                        <TableCell>
                           {units.find((u) => u.id == item.unit_id)?.name || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                           <Input
                              type="number"
                              value={item.qty_gudang || ""}
                              onChange={(e) => {
                                 const newQtyGudang = parseFloat(e.target.value) || 0;
                                 const updatedItem = { ...item, qty_gudang: newQtyGudang };
                                 onItemUpdate(idx, updatedItem);
                              }}
                              className="w-20 h-8 text-right px-2"
                              min="0"
                              step="0.01"
                           />
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="w-20 h-8 flex items-center justify-end px-2 bg-gray-50 rounded border border-gray-200 text-sm font-medium text-gray-700">
                              {item.qty_toko || 0}
                           </div>
                        </TableCell>
                        <TableCell className="text-right">
                           <div className="relative">
                              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                 Rp
                              </span>
                              <Input
                                 type="text"
                                 value={hargaDisplays[idx] || ""}
                                 onChange={(e) => handleHargaInput(idx, item, e.target.value)}
                                 className="w-28 h-8 text-right px-2 pl-7"
                                 placeholder="0"
                              />
                           </div>
                        </TableCell>
                        <TableCell className="sm:text-right text-center sm:w-28 md:w-32 font-medium">{"Rp " + displaySubtotal.toLocaleString("id-ID")}
                           {/* {kuliFlat !== 0 && (
                                        <div className="text-xs text-gray-500">(+ Fee Kuli Rp {kuliFlat.toLocaleString('id-ID')})</div>
                                    )} */}
                        </TableCell>
                        <TableCell>
                           <Button type="button" variant="destructive" size="sm" onClick={() => onRemove(idx)} className="px-2 py-1">Hapus</Button>
                        </TableCell>
                     </TableRow>
                  );
               })}
            </TableBody>
            <TableFooter>
               <TableRow>
                  <TableCell colSpan={8} className="font-bold text-right bg-muted/50">Fee Kuli (Optional)</TableCell>
                  <TableCell colSpan={3} className="bg-muted/50">
                     <div className="space-y-2">
                        {/* <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => typeof onKuliFeeChange === "function" && onKuliFeeChange(10)} className={`px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-50 ${kuliRate === 10 ? "border-red-500 text-red-600" : "border-gray-200 text-gray-700"}`}>Rp 10</button>
                                    <button type="button" onClick={() => typeof onKuliFeeChange === "function" && onKuliFeeChange(20)} className={`px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-50 ${kuliRate === 20 ? "border-red-500 text-red-600" : "border-gray-200 text-gray-700"}`}>Rp 20</button>
                                    <button type="button" onClick={() => typeof onKuliFeeChange === "function" && onKuliFeeChange(40)} className={`px-3 py-1 text-sm border rounded-md bg-white hover:bg-gray-50 ${kuliRate === 40 ? "border-red-500 text-red-600" : "border-gray-200 text-gray-700"}`}>Rp 40</button>
                                    <button type="button" onClick={() => { typeof onKuliFeeChange === "function" && onKuliFeeChange(0); typeof onKuliFeeCheckboxChange === "function" && onKuliFeeCheckboxChange(false); }} className="px-2 py-1 text-sm text-red-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50">Reset</button>
                                </div> */}

                        <div className="text-sm text-gray-700">Total Fee Kuli: <span className="font-medium">Rp {kuliTotal.toLocaleString("id-ID")}</span></div>

                        <div className="flex items-center mt-2 space-x-2">
                           <label className="inline-flex items-center text-sm text-gray-600">
                              <input type="checkbox" className="mr-2" checked={items.some((it) => it && it._kuli_manual)} onChange={(e) => { const checked = e.target.checked; typeof onKuliFeeCheckboxChange === "function" && onKuliFeeCheckboxChange(false); typeof onKuliManualChange === "function" && onKuliManualChange(checked); }} /> aktifkan Kuli
                           </label>
                        </div>

                        {items.some((it) => it && it._kuli_manual) && (
                           <div className="mt-2">
                              <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                    Rp
                                 </span>
                                 <Input
                                    type="text"
                                    name="kuli_fee"
                                    value={kuliFeeDisplay}
                                    onChange={handleKuliFeeInput}
                                    className="h-8 pl-10"
                                    placeholder="0"
                                 />
                              </div>

                           </div>
                        )}
                     </div>
                  </TableCell>
               </TableRow>
               <TableRow>
                  <TableCell colSpan={8} className="font-bold text-right bg-muted/50">Timbangan (Total Rp)</TableCell>
                  <TableCell colSpan={3} className="bg-muted/50">
                     <div className="flex items-center space-x-3">
                        <label className="inline-flex items-center text-sm text-gray-600">
                           <input type="checkbox" className="mr-2" checked={showTimbangan} onChange={(e) => { const checked = e.target.checked; setShowTimbangan(checked); if (!checked) setTimbanganGlobal(0); }} />
                           Aktifkan Timbangan (Total Rp)
                        </label>
                        {showTimbangan && (
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                                 Rp
                              </span>
                              <Input
                                 type="text"
                                 name="timbangan"
                                 value={timbanganDisplay}
                                 onChange={handleTimbanganInput}
                                 placeholder="0"
                                 className="h-8 w-36 pl-8"
                              />
                           </div>
                        )}
                     </div>
                  </TableCell>
               </TableRow>
               <TableRow>
                  {/* <TableCell colSpan={8} className="font-bold text-right bg-muted/50">Total Timbangan</TableCell> */}
                  {/* <TableCell colSpan={3} className="bg-muted/50">
                            <div className="text-sm font-medium">{totalTimbangan >= 0 ? "+" : ""}{totalTimbangan.toLocaleString("id-ID")}
                                <div className="text-xs text-gray-500 mt-1">{totalTimbangan >= 0 ? "Penambahan nilai total" : "Pengurangan nilai total"}</div>
                            </div>
                        </TableCell> */}
               </TableRow>
               <TableRow>
                  <TableCell colSpan={8} className="font-bold text-right" hidden>Total (incl. Fee Kuli)</TableCell>
                  <TableCell colSpan={3} className="font-bold text-right" hidden>{totalFinal.toLocaleString("id-ID")}</TableCell>
               </TableRow>
               <TableRow>
                  <TableCell colSpan={8} className="font-bold text-right bg-muted/20  text-xl">Total Subtotal  </TableCell>
                  <TableCell colSpan={3} className="font-bold  text-right bg-muted/20 text-xl">Rp  {totalFinal.toLocaleString("id-ID")}</TableCell>
               </TableRow>
            </TableFooter>
         </Table>
      </div >
   );
}
