import React, { useState, useEffect } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/Components/ui/select";

export default function PurchaseItemInput({
   // Single-item mode
   item,
   onChange,
   onAdd,
   // Form-level mode (Edit.jsx passes data + setData)
   data,
   setData,
   categories,
   subcategories,
   products,
   units,
   onAddCategory, // optional callback from parent to add a new category
   onAddSubcategory, // optional callback to add subcategory
   onAddProduct, // optional callback to add product
   onAddUnit, // optional callback to add unit
}) {
   const [showQtyFields, setShowQtyFields] = useState(false);
   // Determine mode
   const isFormMode = !item && data && typeof setData === "function";

   // In form-mode, the editable item is the last row
   const formItemIndex = isFormMode ? data.items.length - 1 : null;
   const currentItem = isFormMode ? data.items[formItemIndex] : item;

   // Auto-calculate qty_toko based on qty and qty_gudang
   useEffect(() => {
      const totalQty = parseFloat(currentItem?.qty) || 0;
      const qtyGudang = parseFloat(currentItem?.qty_gudang) || 0;

      let calculatedQtyToko = 0;

      if (showQtyFields) {
         // When checkbox is checked: qty_toko = qty - qty_gudang
         if (totalQty > 0) {
            calculatedQtyToko = totalQty - qtyGudang;
            if (calculatedQtyToko < 0) calculatedQtyToko = 0;
         } else if (qtyGudang > 0) {
            // If only gudang is entered, auto-set main qty
            if (isFormMode) {
               const newItems = [...data.items];
               newItems[formItemIndex] = {
                  ...newItems[formItemIndex],
                  qty: qtyGudang,
                  qty_toko: 0
               };
               setData("items", newItems);
               return;
            }
         }
      } else {
         // When checkbox is not checked: qty_toko = qty (all goes to shop)
         calculatedQtyToko = totalQty;
         // Also clear qty_gudang
         if (currentItem?.qty_gudang && currentItem.qty_gudang !== 0) {
            if (isFormMode) {
               const newItems = [...data.items];
               newItems[formItemIndex] = {
                  ...newItems[formItemIndex],
                  qty_gudang: 0,
                  qty_toko: calculatedQtyToko
               };
               setData("items", newItems);
               return;
            }
         }
      }

      // Update qty_toko if it has changed
      const currentQtyToko = parseFloat(currentItem?.qty_toko) || 0;
      if (Math.abs(calculatedQtyToko - currentQtyToko) > 0.001) {
         if (isFormMode) {
            const newItems = [...data.items];
            newItems[formItemIndex] = {
               ...newItems[formItemIndex],
               qty_toko: calculatedQtyToko
            };
            setData("items", newItems);
         } else if (onChange) {
            onChange({ target: { name: "qty_toko", value: calculatedQtyToko } });
         }
      }
   }, [currentItem?.qty, currentItem?.qty_gudang, showQtyFields]);

   const handleFieldChange = (e) => {
      const { name, value } = e.target;
      if (isFormMode) {
         const newItems = [...data.items];
         newItems[formItemIndex] = { ...newItems[formItemIndex], [name]: value };
         setData("items", newItems);
      } else if (onChange) {
         onChange({ target: { name, value } });
      }
   };
   // Display helper: show empty string when qty is 0 so placeholder '0' is visible
   const displayQty = (() => {
      const q = currentItem?.qty;
      // If it's exactly numeric zero (number 0) or string "0", show empty so placeholder appears
      if (q === 0 || q === "0") return "";
      return q ?? "";
   })();
   // Display helper for qty_gudang
   const displayQtyGudang = (() => {
      const q = currentItem?.qty_gudang;
      if (q === 0 || q === "0") return "";
      return q ?? "";
   })();

   // Display helper for harga_pembelian
   const displayHarga = (() => {
      const h = currentItem?.harga_pembelian;
      if (h === 0 || h === "0") return "";
      return h ?? "";
   })();
   return (
      <div className="p-4 mb-4 bg-white border rounded-lg shadow-sm">
         <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-5">
            {/* Row 1: Kategori, Subkategori, Produk, Unit, Qty */}
            {/* Kategori */}
            <div className="md:col-span-1">
               <label className="block mb-1 text-sm font-medium text-gray-700">
                  Kategori
               </label>
               <Select
                  value={(currentItem?.category_id?.toString()) || ""}
                  onValueChange={(value) =>
                     handleFieldChange({ target: { name: "category_id", value } })
                  }
               >
                  <SelectTrigger className="text-base bg-white">
                     <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                     {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                           {c.name}
                        </SelectItem>
                     ))}

                     {/* Footer: button to add new category if not present */}
                     <div className="px-3 py-2 mt-2 border-t">
                        <button
                           type="button"
                           onClick={() => {
                              try {
                                 if (
                                    typeof onAddCategory ===
                                    "function"
                                 ) {
                                    onAddCategory();
                                 } else {
                                    const name =
                                       window.prompt(
                                          "Nama kategori baru"
                                       );
                                    if (name && name.trim()) {
                                       window.dispatchEvent(
                                          new CustomEvent(
                                             "purchase:add-category",
                                             {
                                                detail: {
                                                   name: name.trim(),
                                                },
                                             }
                                          )
                                       );
                                    }
                                 }
                              } catch (e) {
                                 console.error(
                                    "Add category action failed",
                                    e
                                 );
                              }
                           }}
                           className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                        >
                           + Tambah Kategori
                        </button>
                     </div>
                  </SelectContent>
               </Select>
            </div>

            <div className="md:col-span-1">
               <label className="block mb-1 text-sm font-medium text-gray-700">
                  Subkategori
               </label>
               <Select
                  value={(currentItem?.subcategory_id?.toString()) || ""}
                  onValueChange={(value) =>
                     handleFieldChange({ target: { name: "subcategory_id", value } })
                  }
               >
                  <SelectTrigger className="text-base bg-white">
                     <SelectValue placeholder="Pilih Subkategori" />
                  </SelectTrigger>
                  <SelectContent>
                     {subcategories
                        .filter((sc) => sc.category_id == currentItem?.category_id)
                        .map((sc) => (
                           <SelectItem key={sc.id} value={sc.id.toString()}>
                              {sc.name}
                           </SelectItem>
                        ))}

                     <div className="px-3 py-2 mt-2 border-t">
                        <button
                           type="button"
                           onClick={() => {
                              try {
                                 if (typeof onAddSubcategory === "function") {
                                    onAddSubcategory(
                                       null,
                                       currentItem?.category_id
                                    );
                                 } else {
                                    const name = window.prompt(
                                       "Nama subkategori baru"
                                    );
                                    if (name && name.trim()) {
                                       window.dispatchEvent(
                                          new CustomEvent(
                                             "purchase:add-subcategory",
                                             {
                                                detail: {
                                                   name: name.trim(),
                                                   category_id:
                                                      currentItem?.category_id ||
                                                      null,
                                                },
                                             }
                                          )
                                       );
                                    }
                                 }
                              } catch (e) {
                                 console.error(
                                    "Add subcategory action failed",
                                    e
                                 );
                              }
                           }}
                           className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                        >
                           + Tambah Subkategori
                        </button>
                     </div>
                  </SelectContent>
               </Select>
            </div>

            <div className="md:col-span-1">
               <label className="block mb-1 text-sm font-medium text-gray-700">
                  Produk
               </label>
               <Select
                  value={(currentItem?.product_id?.toString()) || ""}
                  onValueChange={(value) =>
                     handleFieldChange({ target: { name: "product_id", value } })
                  }
               >
                  <SelectTrigger className="text-base bg-white">
                     <SelectValue placeholder="Pilih Produk" />
                  </SelectTrigger>
                  <SelectContent>
                     {/** DEBUG: temporary logs to diagnose missing products **/}
                     {typeof window !== "undefined" &&
                        (() => {
                           try {
                              console.debug("Product select debug:", {
                                 productsCount: products?.length || 0,
                                 category_id: currentItem?.category_id,
                                 subcategory_id: currentItem?.subcategory_id,
                                 sampleProductKeys:
                                    products && products[0]
                                       ? Object.keys(products[0]).slice(0, 6)
                                       : [],
                              });
                           } catch (e) { }
                           return null;
                        })()}
                     {products
                        .filter((p) => {
                           if (currentItem?.subcategory_id) {
                              return (
                                 String(p.subcategory_id) ===
                                 String(currentItem.subcategory_id)
                              );
                           }
                           if (currentItem?.category_id) {
                              return (
                                 String(p.category_id) ===
                                 String(currentItem.category_id)
                              );
                           }
                           return true;
                        })
                        .map((p) => (
                           <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name}
                           </SelectItem>
                        ))}

                     <div className="px-3 py-2 mt-2 border-t">
                        <button
                           type="button"
                           onClick={() => {
                              try {
                                 if (typeof onAddProduct === "function") {
                                    onAddProduct({
                                       name: null,
                                       category_id: currentItem?.category_id || null,
                                       subcategory_id: currentItem?.subcategory_id || null,
                                    });
                                 } else {
                                    const name = window.prompt(
                                       "Nama produk baru"
                                    );
                                    if (name && name.trim()) {
                                       window.dispatchEvent(
                                          new CustomEvent(
                                             "purchase:add-product",
                                             {
                                                detail: {
                                                   name: name.trim(),
                                                   category_id: currentItem?.category_id || null,
                                                   subcategory_id: currentItem?.subcategory_id || null,
                                                },
                                             }
                                          )
                                       );
                                    }
                                 }
                              } catch (e) {
                                 console.error(
                                    "Add product action failed",
                                    e
                                 );
                              }
                           }}
                           className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                        >
                           + Tambah Produk
                        </button>
                     </div>
                  </SelectContent>
               </Select>
            </div>

            <div className="md:col-span-1">
               <label className="block mb-1 text-sm font-medium text-gray-700">
                  Unit
               </label>
               <Select
                  value={(currentItem?.unit_id?.toString()) || ""}
                  onValueChange={(value) =>
                     handleFieldChange({ target: { name: "unit_id", value } })
                  }
               >
                  <SelectTrigger className="text-base bg-white">
                     <SelectValue placeholder="Pilih Unit" />
                  </SelectTrigger>
                  <SelectContent>
                     {units.map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>
                           {u.name}
                        </SelectItem>
                     ))}
                     <div className="px-3 py-2 mt-2 border-t">
                        <button
                           type="button"
                           onClick={() => {
                              console.debug(
                                 "Tambah Unit button clicked"
                              );
                              try {
                                 if (
                                    typeof onAddUnit === "function"
                                 ) {
                                    console.debug(
                                       "Calling onAddUnit function"
                                    );
                                    onAddUnit();
                                 } else {
                                    console.debug(
                                       "onAddUnit not provided, using prompt fallback"
                                    );
                                    const name =
                                       window.prompt(
                                          "Nama unit baru"
                                       );
                                    if (name && name.trim()) {
                                       window.dispatchEvent(
                                          new CustomEvent(
                                             "purchase:add-unit",
                                             {
                                                detail: {
                                                   name: name.trim(),
                                                },
                                             }
                                          )
                                       );
                                    }
                                 }
                              } catch (e) {
                                 console.error(
                                    "Add unit action failed",
                                    e
                                 );
                              }
                           }}
                           className="w-full text-sm text-left text-blue-600 hover:text-blue-800"
                        >
                           + Tambah Unit
                        </button>
                     </div>
                  </SelectContent>
               </Select>
            </div>

            <div className="md:col-span-1">
               <label className="block mb-1 text-sm font-medium text-gray-700">
                  Qty
               </label>
               <Input
                  type="number"
                  name="qty"
                  min="0"
                  value={displayQty}
                  onChange={handleFieldChange}
                  className="text-base"
                  placeholder="0"
               />
            </div>

            {/* Fee Kuli UI removed from per-item input (moved/handled in table footer) */}

         </div>

         {/* Row 2: checkbox and conditional qty fields, harga, add button */}
         <div className="grid items-end grid-cols-1 gap-4 md:grid-cols-5 mt-4">
            {/* Distribusi Qty Checkbox */}
            <div className="md:col-span-1">
               <label className="block mb-1 text-sm font-medium text-gray-700">
                  Alokasi Gudang
               </label>
               <div className="flex items-center">
                  <input
                     type="checkbox"
                     id="showQtyFields"
                     checked={showQtyFields}
                     onChange={(e) => setShowQtyFields(e.target.checked)}
                     className="mr-2"
                  />
                  <label htmlFor="showQtyFields" className="text-sm text-gray-700">
                     Atur Qty Gudang
                  </label>
               </div>
            </div>

            {showQtyFields ? (
               <>
                  {/* Qty Gudang */}
                  <div className="md:col-span-1">
                     <label className="block mb-1 text-sm font-medium text-gray-700">
                        Qty Stok Gudang
                     </label>
                     <Input
                        type="number"
                        name="qty_gudang"
                        min="0"
                        step="0.01"
                        value={displayQtyGudang}
                        onChange={handleFieldChange}
                        className="text-base"
                        placeholder="0"
                     />
                  </div>

                  {/* Qty Toko (Read-only, Auto-calculated) */}
                  <div className="md:col-span-1">
                     <label className="block mb-1 text-sm font-medium text-gray-700">
                        Qty Stok Toko (Auto)
                     </label>
                     <div className="h-10 flex items-center px-3 bg-gray-50 rounded border border-gray-200 text-base font-medium text-gray-700">
                        {currentItem?.qty_toko || 0}
                     </div>
                  </div>

                  {/* Harga Beli */}
                  <div className="md:col-span-1">
                     <label className="block mb-1 text-sm font-medium text-gray-700">
                        Harga Beli
                     </label>
                     <Input
                        type="number"
                        name="harga_pembelian"
                        min="0"
                        value={displayHarga}
                        onChange={handleFieldChange}
                        className="text-base"
                        placeholder="0"
                     />
                  </div>

                  {/* Add Button */}
                  <div className="flex items-center justify-center md:col-span-1">
                     <Button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center gap-2 text-base"
                     >
                        + Item
                     </Button>
                  </div>
               </>
            ) : (
               <>
                  {/* Empty columns when checkbox not checked */}
                  <div className="md:col-span-1"></div>
                  <div className="md:col-span-1"></div>

                  {/* Harga Beli */}
                  <div className="md:col-span-1">
                     <label className="block mb-1 text-sm font-medium text-gray-700">
                        Harga Beli
                     </label>
                     <Input
                        type="number"
                        name="harga_pembelian"
                        min="0"
                        value={displayHarga}
                        onChange={handleFieldChange}
                        className="text-base"
                        placeholder="0"
                     />
                  </div>

                  {/* Add Button */}
                  <div className="flex items-center justify-center md:col-span-1">
                     <Button
                        type="button"
                        onClick={() => {
                           if (isFormMode) {
                              // append new empty input row
                              const next = [...data.items, {
                                 product_id: "",
                                 unit_id: "",
                                 category_id: "",
                                 subcategory_id: "",
                                 qty: 0,
                                 qty_gudang: 0,
                                 qty_toko: 0,
                                 harga_pembelian: 0,
                                 kuli_fee: 0,
                              }];
                              setData("items", next);
                              localStorage.setItem("purchase_items_table", JSON.stringify(next.slice(0, -1)));
                              localStorage.removeItem("purchase_draft_item");
                           } else if (onAdd) {
                              onAdd();
                           }
                        }}
                        className="inline-flex items-center gap-2 text-base"
                     >
                        + Item
                     </Button>
                  </div>
               </>
            )}
         </div>
      </div>
   );
}
