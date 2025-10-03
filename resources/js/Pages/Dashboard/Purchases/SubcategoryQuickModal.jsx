import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/Components/ui/select";

export default function SubcategoryQuickModal({
   show,
   onClose,
   initial = {},
   categories = [],
   onCreated,
}) {
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState({
      name: "",
      description: "",
      category_id: null,
   });

   useEffect(() => {
      if (initial) {
         setData({
            name: initial.name || "",
            description: initial.description || "",
            category_id: initial.category_id || null,
         });
      }
   }, [initial, show]);

   if (!show) return null;

   const handleChange = (key, value) =>
      setData((d) => ({ ...d, [key]: value }));

   const handleSubmit = async (e) => {
      e && e.preventDefault();

      // Validate locally
      if (!data.name || !data.name.trim()) {
         Swal.fire({
            icon: "warning",
            title: "Nama subkategori wajib diisi"
         });
         return;
      }

      if (!data.category_id) {
         Swal.fire({
            icon: "warning",
            title: "Kategori wajib dipilih"
         });
         return;
      }

      try {
         setLoading(true);
         const meta = document.querySelector('meta[name="csrf-token"]');
         let csrfToken = "";
         if (meta) csrfToken = meta.getAttribute("content");
         else if (window.Laravel && window.Laravel.csrfToken)
            csrfToken = window.Laravel.csrfToken;

         const payload = {
            name: data.name.trim(),
            description: data.description?.trim() || data.name.trim(),
            category_id: data.category_id,
            image: null, // Optional: bisa ditambahkan upload image nanti
         };

         const url =
            typeof route === "function"
               ? route("subcategories.store")
               : "/dashboard/subcategories";

         const resp = await fetch(url, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Accept: "application/json",
               "X-Requested-With": "XMLHttpRequest",
               "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify(payload),
         });

         const ct = (resp.headers.get("content-type") || "").toLowerCase();
         let parsed = null;
         if (ct.includes("application/json")) {
            try {
               parsed = await resp.json();
            } catch (e) {
               parsed = null;
            }
         } else {
            const text = await resp.text();
            try {
               parsed = JSON.parse(text);
            } catch (e) {
               parsed = null;
            }
         }

         if (!resp.ok) {
            let msg = "Gagal membuat subkategori";
            if (parsed) {
               if (parsed.errors) {
                  const parts = [];
                  Object.values(parsed.errors).forEach((v) => {
                     if (Array.isArray(v)) parts.push(...v);
                     else if (typeof v === "string") parts.push(v);
                  });
                  if (parts.length) msg += ": " + parts.join(" \n");
                  else
                     msg +=
                        ": " +
                        (parsed.message || JSON.stringify(parsed));
               } else {
                  msg +=
                     ": " + (parsed.message || JSON.stringify(parsed));
               }
            } else {
               msg += ": server returned an error (non-JSON)";
            }
            throw new Error(msg);
         }

         const newSubcategory = parsed;
         if (!newSubcategory)
            throw new Error(
               "Server returned invalid/non-JSON response for new subcategory"
            );

         Swal.fire({
            title: "Berhasil",
            text: "Subkategori ditambahkan",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
         });

         onCreated && onCreated(newSubcategory);
         onClose && onClose();

         // Reset form
         setData({
            name: "",
            description: "",
            category_id: null,
         });
      } catch (err) {
         console.error("SubcategoryQuickModal submit error", err);
         Swal.fire({
            title: "Gagal",
            text: err.message || "Gagal membuat subkategori",
            icon: "error",
         });
      } finally {
         setLoading(false);
      }
   };

   return (
      <Dialog open={show} onOpenChange={onClose}>
         <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>Tambah Subkategori Baru</DialogTitle>
               <DialogDescription>
                  Tambahkan subkategori produk baru dengan cepat.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="subcategory-category">
                        Kategori <span className="text-red-500">*</span>
                     </Label>
                     <Select
                        value={data.category_id?.toString() || ""}
                        onValueChange={(val) =>
                           handleChange("category_id", parseInt(val))
                        }
                        disabled={loading}
                     >
                        <SelectTrigger id="subcategory-category">
                           <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                           {categories.map((cat) => (
                              <SelectItem
                                 key={cat.id}
                                 value={cat.id.toString()}
                              >
                                 {cat.name}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="subcategory-name">
                        Nama Subkategori <span className="text-red-500">*</span>
                     </Label>
                     <Input
                        id="subcategory-name"
                        placeholder="Contoh: Rojolele"
                        value={data.name}
                        onChange={(e) =>
                           handleChange("name", e.target.value)
                        }
                        disabled={loading}
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="subcategory-description">
                        Deskripsi
                     </Label>
                     <Textarea
                        id="subcategory-description"
                        placeholder="Deskripsi subkategori (opsional)"
                        value={data.description}
                        onChange={(e) =>
                           handleChange("description", e.target.value)
                        }
                        disabled={loading}
                        rows={3}
                     />
                  </div>
               </div>

               <div className="flex justify-end gap-2 mt-6">
                  <Button
                     type="button"
                     variant="outline"
                     onClick={onClose}
                     disabled={loading}
                  >
                     Batal
                  </Button>
                  <Button type="submit" disabled={loading}>
                     {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
               </div>
            </form>
         </DialogContent>
      </Dialog>
   );
}
