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

export default function CategoryQuickModal({
   show,
   onClose,
   initial = {},
   onCreated,
}) {
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState({
      name: "",
      description: "",
   });

   useEffect(() => {
      if (initial) {
         setData({
            name: initial.name || "",
            description: initial.description || "",
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
            title: "Nama kategori wajib diisi"
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
            image: null, // Optional: bisa ditambahkan upload image nanti
         };

         const url =
            typeof route === "function"
               ? route("categories.store")
               : "/dashboard/categories";

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
            let msg = "Gagal membuat kategori";
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

         const newCategory = parsed;
         if (!newCategory)
            throw new Error(
               "Server returned invalid/non-JSON response for new category"
            );

         Swal.fire({
            title: "Berhasil",
            text: "Kategori ditambahkan",
            icon: "success",
            timer: 1200,
            showConfirmButton: false,
         });

         onCreated && onCreated(newCategory);
         onClose && onClose();

         // Reset form
         setData({
            name: "",
            description: "",
         });
      } catch (err) {
         console.error("CategoryQuickModal submit error", err);
         Swal.fire({
            title: "Gagal",
            text: err.message || "Gagal membuat kategori",
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
               <DialogTitle>Tambah Kategori Baru</DialogTitle>
               <DialogDescription>
                  Tambahkan kategori produk baru dengan cepat.
               </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                     <Label htmlFor="category-name">
                        Nama Kategori <span className="text-red-500">*</span>
                     </Label>
                     <Input
                        id="category-name"
                        placeholder="Contoh: Beras Premium"
                        value={data.name}
                        onChange={(e) =>
                           handleChange("name", e.target.value)
                        }
                        disabled={loading}
                        autoFocus
                     />
                  </div>

                  <div className="space-y-2">
                     <Label htmlFor="category-description">
                        Deskripsi
                     </Label>
                     <Textarea
                        id="category-description"
                        placeholder="Deskripsi kategori (opsional)"
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
