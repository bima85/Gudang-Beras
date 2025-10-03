import React, { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import Swal from "sweetalert2";
import { Button } from "@/Components/ui/button";
import DashboardLayout from "@/Layouts/DashboardLayout";
import PurchaseFormInfo from "./PurchaseFormInfo";
import PurchaseItemInput from "./PurchaseItemInput";
import PurchaseItemsTable from "./PurchaseItemsTable";
import TokoManualModal from "./TokoManualModal";
import SupplierManualModal from "./SupplierManualModal";
import ProductQuickModal from "./ProductQuickModal";
import CategoryQuickModal from "./CategoryQuickModal";
import SubcategoryQuickModal from "./SubcategoryQuickModal";
import UnitManualModal from "./UnitManualModal";
import BackToDashboard from "@/Components/Dashboard/BackToDashboard";
import { Clock } from "lucide-react";
import { Card } from "@/Components/ui/card";
import { CardHeader, CardTitle } from "@/Components/ui/card";
export default function Create(props) {
   const [timbanganGlobal, setTimbanganGlobal] = useState(0);
   // State untuk supplier yang dipilih (untuk cascading filter)
   const [selectedSupplierId, setSelectedSupplierId] = useState(null);
   // Realtime clock for the form
   const [currentTime, setCurrentTime] = useState(new Date());
   const formattedTime = currentTime.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
   });
   // Only log when timbanganGlobal actually changes to avoid spamming the console
   React.useEffect(() => {
      console.debug("Nilai timbangan:", timbanganGlobal);
   }, [timbanganGlobal]);
   const {
      suppliers = [],
      products = [],
      units = [],
      categories = [],
      subcategories = [],
      tokos: tokosProp = [],
      lastPurchaseId,
      successMessage,
   } = props;

   // local state for categories so we can append new ones live
   const [categoriesState, setCategoriesState] = useState(categories);
   // local state for subcategories and products so we can append new ones live
   const [subcategoriesState, setSubcategoriesState] = useState(subcategories);
   const [productsState, setProductsState] = useState(products);
   const [unitsState, setUnitsState] = useState(units);
   // local state for suppliers and tokos
   const [suppliersState, setSuppliersState] = useState(suppliers);
   const [tokos, setTokos] = useState(tokosProp);
   // product quick-create modal state
   const [showProductQuickModal, setShowProductQuickModal] = useState(false);
   const [productQuickInitial, setProductQuickInitial] = useState(null);
   // category quick-create modal state
   const [showCategoryQuickModal, setShowCategoryQuickModal] = useState(false);
   const [categoryQuickInitial, setCategoryQuickInitial] = useState(null);
   // subcategory quick-create modal state
   const [showSubcategoryQuickModal, setShowSubcategoryQuickModal] = useState(false);
   const [subcategoryQuickInitial, setSubcategoryQuickInitial] = useState(null);
   React.useEffect(() => {
      let needCleanup = false;
      try {
         const d = localStorage.getItem("purchase_items_table");
         if (d) {
            const arr = JSON.parse(d);
            if (
               Array.isArray(arr) &&
               arr.some(
                  (item) =>
                     item == null ||
                     item.product_id == null ||
                     item.unit_id == null ||
                     item.category_id == null
               )
            ) {
               localStorage.removeItem("purchase_items_table");
               needCleanup = true;
            }
         }
      } catch {
         localStorage.removeItem("purchase_items_table");
         needCleanup = true;
      }
      if (needCleanup) {
         window.location.reload();
      }
   }, []);

   // Show success message if present
   React.useEffect(() => {
      if (successMessage) {
         // Clear localStorage to ensure clean state
         localStorage.removeItem("purchase_draft_item");
         localStorage.removeItem("purchase_items_table");

         // Reset all form data manually to ensure clean state
         setData({
            invoice_number: "",
            supplier_name: "",
            toko_id: "",
            toko_name: "",
            toko_address: "",
            toko_phone: "",
            purchase_date: "",
            phone: "",
            address: "",
            items: [{
               product_id: "",
               unit_id: "",
               category_id: "",
               subcategory_id: "",
               qty: 0,
               qty_gudang: 0,
               qty_toko: 0,
               harga_pembelian: 0,
               kuli_fee: 0,
            }],
         });

         // Reset semua state tambahan
         setTimbanganGlobal(0);

         // Reset modal states
         setShowTokoModal(false);
         setShowSupplierModal(false);

         // Reset manual forms
         setManualToko({ name: "", address: "", phone: "" });
         setManualSupplier({ name: "", address: "", phone: "" });

         // Reset state arrays to original props
         setTokos(tokosProp);
         setSuppliersState(suppliers);

         // Show success message
         Swal.fire({
            title: "Berhasil!",
            text: successMessage,
            icon: "success",
            confirmButtonText: "OK",
            timer: 5000,
            timerProgressBar: true,
         });
      }
   }, [successMessage]);

   // helper: generate short code from name for backend 'code' field
   const genCode = (str, prefix = "GEN_") =>
      str
         ? String(str).replace(/\s+/g, "_").toUpperCase().slice(0, 20)
         : `${prefix}${Date.now()}`;

   // Helper: cek draft item valid
   function isDraftValid(draft) {
      return (
         draft &&
         draft.product_id &&
         draft.unit_id &&
         draft.category_id &&
         String(draft.product_id).trim() !== "" &&
         String(draft.unit_id).trim() !== "" &&
         String(draft.category_id).trim() !== "" &&
         Number(draft.product_id) > 0 &&
         Number(draft.unit_id) > 0 &&
         Number(draft.category_id) > 0 &&
         Number(draft.qty) > 0 &&
         Number(draft.harga_pembelian) >= 0
      );
   }

   // Ambil draft item dari localStorage jika ada
   const draftItem = (() => {
      try {
         const d = localStorage.getItem("purchase_draft_item");
         if (d) {
            const item = JSON.parse(d);
            return {
               product_id: item.product_id ? String(item.product_id) : "",
               unit_id: item.unit_id ? String(item.unit_id) : "",
               category_id: item.category_id
                  ? String(item.category_id)
                  : "",
               subcategory_id: item.subcategory_id
                  ? String(item.subcategory_id)
                  : "",
               qty: item.qty ? Number(item.qty) : 0,
               qty_gudang: item.qty_gudang ? Number(item.qty_gudang) : 0,
               qty_toko: item.qty_toko ? Number(item.qty_toko) : 0,
               harga_pembelian: item.harga_pembelian
                  ? Number(item.harga_pembelian)
                  : 0,
               kuli_fee: item.kuli_fee ? Number(item.kuli_fee) : 0,
               _kuli_manual: item._kuli_manual
                  ? Boolean(item._kuli_manual)
                  : false,
            };
         }
      } catch { }
      return {
         product_id: "",
         unit_id: "",
         category_id: "",
         subcategory_id: "",
         qty: 0,
         qty_gudang: 0,
         qty_toko: 0,
         harga_pembelian: 0,
         kuli_fee: 0,
         _kuli_manual: false,
      };
   })();

   // Ambil daftar item dari localStorage jika ada
   const itemsTable = (() => {
      try {
         const d = localStorage.getItem("purchase_items_table");
         if (d) {
            return JSON.parse(d).map((item) => ({
               ...item,
               product_id: item.product_id ? String(item.product_id) : "",
               unit_id: item.unit_id ? String(item.unit_id) : "",
               category_id: item.category_id
                  ? String(item.category_id)
                  : "",
               subcategory_id: item.subcategory_id
                  ? String(item.subcategory_id)
                  : "",
               qty: item.qty ? Number(item.qty) : 0,
               qty_gudang: item.qty_gudang ? Number(item.qty_gudang) : 0,
               qty_toko: item.qty_toko ? Number(item.qty_toko) : 0,
               harga_pembelian: item.harga_pembelian
                  ? Number(item.harga_pembelian)
                  : 0,
               kuli_fee: item.kuli_fee ? Number(item.kuli_fee) : 0,
            }));
         }
      } catch { }
      return [];
   })();

   // Inisialisasi items: hanya tambahkan draft jika valid, jika tidak valid, hanya tampilkan table + 1 baris input kosong
   let itemsInit = [...itemsTable];
   if (isDraftValid(draftItem)) {
      itemsInit.push(draftItem);
   } else {
      itemsInit.push({
         product_id: "",
         unit_id: "",
         category_id: "",
         subcategory_id: "",
         qty: 0,
         qty_gudang: 0,
         qty_toko: 0,
         harga_pembelian: 0,
         kuli_fee: 0,
      });
   }

   const { data, setData, post, processing, errors, reset } = useForm({
      invoice_number: "",
      supplier_id: "",
      supplier_name: "",
      toko_id: "",
      toko_name: "",
      toko_address: "",
      toko_phone: "",
      purchase_date: "",
      phone: "",
      address: "",
      items: itemsInit,
   });

   // Update selectedSupplierId saat supplier_name berubah
   React.useEffect(() => {
      if (data.supplier_name) {
         const supplier = suppliersState.find(s => s.name === data.supplier_name);
         if (supplier) {
            setSelectedSupplierId(supplier.id);
         } else {
            setSelectedSupplierId(null);
         }
      } else {
         setSelectedSupplierId(null);
      }
   }, [data.supplier_name, suppliersState]);    // Filter products, categories, subcategories berdasarkan supplier
   const filteredProducts = React.useMemo(() => {
      if (!selectedSupplierId) return productsState;

      // Use loose comparison to handle string/number mismatch
      return productsState.filter(p =>
         String(p.supplier_id) === String(selectedSupplierId) ||
         Number(p.supplier_id) === Number(selectedSupplierId)
      );
   }, [selectedSupplierId, productsState]); const filteredCategories = React.useMemo(() => {
      if (!selectedSupplierId) return categoriesState;
      // Get unique categories from filtered products
      const categoryIds = [...new Set(filteredProducts.map(p => p.category_id))];
      return categoriesState.filter(c => categoryIds.includes(c.id));
   }, [selectedSupplierId, filteredProducts, categoriesState]);

   const filteredSubcategories = React.useMemo(() => {
      if (!selectedSupplierId) return subcategoriesState;
      // Get unique subcategories from filtered products
      const subcategoryIds = [...new Set(filteredProducts.map(p => p.subcategory_id))];
      return subcategoriesState.filter(sc => subcategoryIds.includes(sc.id));
   }, [selectedSupplierId, filteredProducts, subcategoriesState]);

   // Get nama supplier berdasarkan selectedSupplierId (untuk ditampilkan di table)
   const selectedSupplierName = React.useMemo(() => {
      if (!selectedSupplierId) return "";
      const supplier = suppliersState.find(s =>
         String(s.id) === String(selectedSupplierId) ||
         Number(s.id) === Number(selectedSupplierId)
      );
      return supplier ? supplier.name : "";
   }, [selectedSupplierId, suppliersState]);

   // State untuk modal tambah toko manual
   const [showTokoModal, setShowTokoModal] = useState(false);
   const [manualToko, setManualToko] = useState({
      name: "",
      address: "",
      phone: "",
   });

   // Handler input modal toko
   const handleManualTokoChange = (e) => {
      setManualToko({
         ...manualToko,
         [e.target.name]: e.target.value,
      });
   };

   // Submit modal toko (POST ke backend, update state jika sukses)
   const handleManualTokoSubmit = async (e) => {
      e.preventDefault();
      console.log("SUBMIT TOKO MANUAL", manualToko);
      try {
         let csrfToken = "";
         const meta = document.querySelector('meta[name="csrf-token"]');
         if (meta) {
            csrfToken = meta.getAttribute("content");
         } else if (window.Laravel && window.Laravel.csrfToken) {
            csrfToken = window.Laravel.csrfToken;
         }
         const tokoStoreUrl =
            typeof route === "function" ? route("tokos.store") : "/tokos";
         const response = await fetch(tokoStoreUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: {
               "Content-Type": "application/json",
               Accept: "application/json",
               "X-Requested-With": "XMLHttpRequest",
               "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
               name: manualToko.name,
               address: manualToko.address,
               phone: manualToko.phone,
            }),
         });
         if (!response.ok) {
            let msg = "Gagal menambah toko";
            try {
               const errJson = await response.json();
               msg += ": " + (errJson.message || JSON.stringify(errJson));
            } catch { }
            throw new Error(msg);
         }
         const newToko = await response.json();
         setTokos((prev) => [...prev, newToko]);
         setData("toko_id", newToko.id);
         setData("toko_name", newToko.name);
         setData("toko_address", newToko.address);
         setData("toko_phone", newToko.phone);
         setShowTokoModal(false);
      } catch (err) {
         console.error("Error tambah toko manual:", err);
         alert("Gagal menambah toko: " + err.message);
      }
   };

   // State untuk modal tambah supplier manual
   const [showSupplierModal, setShowSupplierModal] = useState(false);
   const [manualSupplier, setManualSupplier] = useState({
      name: "",
      address: "",
      phone: "",
   });
   const [manualSupplierErrors, setManualSupplierErrors] = useState({});
   const [manualSupplierSubmitting, setManualSupplierSubmitting] = useState(false);

   const handleManualSupplierChange = (e) => {
      setManualSupplier({
         ...manualSupplier,
         [e.target.name]: e.target.value,
      });
   };
   const handleManualSupplierSubmit = async (e) => {
      e.preventDefault();
      setManualSupplierSubmitting(true);
      setManualSupplierErrors({});
      try {
         const supplierStoreUrl =
            typeof route === "function"
               ? route("suppliers.store")
               : "/suppliers";
         let csrfToken = "";
         const meta = document.querySelector('meta[name="csrf-token"]');
         if (meta) {
            csrfToken = meta.getAttribute("content");
         } else if (window.Laravel && window.Laravel.csrfToken) {
            csrfToken = window.Laravel.csrfToken;
         }
         const response = await fetch(supplierStoreUrl, {
            method: "POST",
            credentials: "same-origin",
            headers: {
               "Content-Type": "application/json",
               Accept: "application/json",
               "X-Requested-With": "XMLHttpRequest",
               "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
               name: manualSupplier.name,
               address: manualSupplier.address,
               phone: manualSupplier.phone,
            }),
         });
         if (!response.ok) {
            let msg = "Gagal menambah supplier";
            try {
               const errJson = await response.json();
               if (errJson.errors) {
                  // Handle validation errors: set state for inline display
                  setManualSupplierErrors(errJson.errors || {});
                  const errorMessages = Object.values(errJson.errors).flat();
                  msg += ": " + errorMessages.join(", ");
               } else {
                  msg += ": " + (errJson.message || JSON.stringify(errJson));
               }
            } catch (parseError) {
               msg += ": Server returned non-JSON response";
            }
            throw new Error(msg);
         }
         const newSupplier = await response.json();
         setSuppliersState((prev) => [...prev, newSupplier]);
         setData("supplier_id", newSupplier.id);
         setData("supplier_name", newSupplier.name);
         setData("phone", newSupplier.phone);
         setData("address", newSupplier.address);
         setShowSupplierModal(false);
         // Reset manual supplier form
         setManualSupplier({
            name: "",
            address: "",
            phone: "",
         });
         setManualSupplierErrors({});
         // Show success message
         Swal.fire({
            title: "Berhasil!",
            text: "Supplier baru berhasil ditambahkan",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
         });
      } catch (err) {
         console.error("Error tambah supplier manual:", err);
         Swal.fire({
            title: "Gagal!",
            text: "Gagal menambah supplier: " + err.message,
            icon: "error",
            confirmButtonText: "OK",
         });
      } finally {
         setManualSupplierSubmitting(false);
      }
   };

   // State untuk modal tambah unit manual
   const [showUnitModal, setShowUnitModal] = useState(false);
   const [manualUnit, setManualUnit] = useState({
      name: "",
      conversion_to_kg: "",
   });
   const [isUnitLoading, setIsUnitLoading] = useState(false);

   const handleManualUnitChange = (e) => {
      setManualUnit({
         ...manualUnit,
         [e.target.name]: e.target.value,
      });
   };

   const handleManualUnitSubmit = async () => {
      if (!manualUnit.name.trim() || !manualUnit.conversion_to_kg) {
         alert("Nama unit dan konversi ke kilogram harus diisi");
         return;
      }

      setIsUnitLoading(true);
      try {
         const url =
            typeof route === "function"
               ? route("units.store")
               : "/dashboard/units";
         const csrfToken = await getCsrfToken();

         const response = await fetch(url, {
            method: "POST",
            credentials: "same-origin",
            headers: {
               "Content-Type": "application/json",
               Accept: "application/json",
               "X-Requested-With": "XMLHttpRequest",
               "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
               name: manualUnit.name.trim(),
               conversion_to_kg:
                  parseFloat(manualUnit.conversion_to_kg) || 1.0,
            }),
         });

         if (!response.ok) {
            let msg = "Gagal menambah unit";
            try {
               const errJson = await response.json();
               msg += ": " + (errJson.message || JSON.stringify(errJson));
            } catch { }
            throw new Error(msg);
         }

         const newUnit = await response.json();
         setUnitsState((prev) => [...prev, newUnit]);

         // Set to current draft item
         try {
            const items = [...data.items];
            if (items.length) {
               items[items.length - 1].unit_id = String(newUnit.id);
               setData("items", items);
            }
         } catch (e) { }

         // Close modal and reset form
         setShowUnitModal(false);
         setManualUnit({
            name: "",
            conversion_to_kg: "",
         });

         // Show success message
         Swal.fire({
            title: "Berhasil!",
            text: "Unit baru berhasil ditambahkan",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
         });

         // Dispatch event for any listeners
         window.dispatchEvent(
            new CustomEvent("purchase:unit-created", { detail: newUnit })
         );
      } catch (err) {
         console.error("Error tambah unit manual:", err);
         Swal.fire({
            title: "Gagal!",
            text: "Gagal menambah unit: " + err.message,
            icon: "error",
            confirmButtonText: "OK",
         });
      } finally {
         setIsUnitLoading(false);
      }
   };

   // Helper function to get CSRF token
   const getCsrfToken = async () => {
      let csrfToken = "";

      // Try multiple ways to get CSRF token
      const meta = document.querySelector('meta[name="csrf-token"]');
      if (meta) {
         csrfToken = meta.getAttribute("content");
      } else if (window.Laravel && window.Laravel.csrfToken) {
         csrfToken = window.Laravel.csrfToken;
      } else {
         // Try to get CSRF token from cookie
         const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(";").shift();
         };
         csrfToken = getCookie("XSRF-TOKEN") || "";
         if (csrfToken) {
            csrfToken = decodeURIComponent(csrfToken);
         }
      }

      // If no CSRF token found, try to get it via sanctum/csrf-cookie
      if (!csrfToken) {
         try {
            await fetch("/sanctum/csrf-cookie", {
               method: "GET",
               credentials: "same-origin",
            });

            // Try again to get CSRF token from cookie after refresh
            const getCookie = (name) => {
               const value = `; ${document.cookie}`;
               const parts = value.split(`; ${name}=`);
               if (parts.length === 2)
                  return parts.pop().split(";").shift();
            };
            csrfToken = getCookie("XSRF-TOKEN") || "";
            if (csrfToken) {
               csrfToken = decodeURIComponent(csrfToken);
            }
         } catch (e) {
            console.log("Failed to get CSRF token via sanctum:", e);
         }
      }

      console.log("CSRF Token found:", csrfToken ? "Yes" : "No");
      return csrfToken;
   };

   // Handlers untuk menambah Kategori / Subkategori / Produk dari inline add buttons
   const handleAddCategory = async (name) => {
      // Buka modal CategoryQuickModal
      setCategoryQuickInitial({ name: name || "" });
      setShowCategoryQuickModal(true);
   };

   const handleAddSubcategory = async (name, categoryId) => {
      // Buka modal SubcategoryQuickModal
      const catId =
         categoryId ||
         data.items[data.items.length - 1]?.category_id ||
         null;

      if (!catId) {
         Swal.fire({
            icon: "warning",
            title: "Pilih kategori terlebih dahulu",
            text: "Anda harus memilih kategori sebelum menambah subkategori.",
         });
         return;
      }

      setSubcategoryQuickInitial({
         name: name || "",
         category_id: parseInt(catId)
      });
      setShowSubcategoryQuickModal(true);
   };

   const handleAddProduct = async (payload = {}) => {
      try {
         let name = payload.name;
         if (!name) {
            name = window.prompt("Nama produk baru");
         }
         if (!name || !name.trim()) return;

         const body = {
            name: name.trim(),
            category_id:
               payload.category_id ||
               data.items[data.items.length - 1]?.category_id ||
               null,
            subcategory_id:
               payload.subcategory_id ||
               data.items[data.items.length - 1]?.subcategory_id ||
               null,
            unit_id: payload.unit_id || null,
         };

         const url = "/dashboard/products";
         const csrfToken = await getCsrfToken();

         // ask description for product if backend requires it
         let prodDescription = "";
         try {
            prodDescription = window.prompt(
               "Deskripsi produk (opsional):",
               ""
            );
         } catch (e) { }
         if (!prodDescription || !String(prodDescription).trim()) {
            prodDescription = name.trim();
         }

         const fetchOptions = {
            method: "POST",
            credentials: "same-origin",
            headers: {
               "Content-Type": "application/json",
               Accept: "application/json",
               "X-Requested-With": "XMLHttpRequest",
               "X-CSRF-TOKEN": csrfToken,
            },
            body: JSON.stringify({
               ...body,
               description: String(prodDescription).trim(),
               barcode:
                  "BRC_" + Date.now() + Math.floor(Math.random() * 1000),
            }),
         };

         console.debug("POSTing new product to", url, fetchOptions);

         const response = await fetch(url, fetchOptions);

         if (!response.ok) {
            console.error("Failed to add product", {
               url,
               status: response.status,
               statusText: response.statusText,
               headers: Array.from(response.headers.entries()),
            });

            // Try to capture body text and JSON for clearer error
            let bodyText = "";
            try {
               const clone = response.clone();
               bodyText = await clone.text();
               console.error("Response body:", bodyText);
            } catch (e) {
               console.error("Failed to read response body text", e);
            }

            let msg = "Gagal menambah produk";
            try {
               const parsed = bodyText ? JSON.parse(bodyText) : null;
               if (parsed && parsed.message) {
                  msg += ": " + parsed.message;
               } else if (bodyText) {
                  msg += ": " + bodyText;
               }
            } catch (e) {
               if (bodyText) msg += ": " + bodyText;
            }

            throw new Error(msg);
         }

         const newProd = await response.json();
         setProductsState((prev) => [...prev, newProd]);

         // Set ke draft item terakhir agar langsung terpilih
         try {
            const items = [...data.items];
            if (items.length) {
               items[items.length - 1].product_id = String(newProd.id);
               setData("items", items);
            }
         } catch (e) { }

         window.dispatchEvent(
            new CustomEvent("purchase:product-created", { detail: newProd })
         );
      } catch (err) {
         console.error("Error tambah produk:", err);
         try {
            Swal.fire({
               title: "Gagal!",
               text: "Gagal menambah produk: " + err.message,
               icon: "error",
               confirmButtonText: "OK",
            });
         } catch (e) {
            alert("Gagal menambah produk: " + err.message);
         }
      }
   };

   const handleAddUnit = async (name = null) => {
      console.debug("handleAddUnit called with name:", name);

      // If name is provided (for backward compatibility), use the old method
      if (name && name.trim()) {
         try {
            const url =
               typeof route === "function"
                  ? route("units.store")
                  : "/dashboard/units";
            const csrfToken = await getCsrfToken();

            const response = await fetch(url, {
               method: "POST",
               credentials: "same-origin",
               headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                  "X-Requested-With": "XMLHttpRequest",
                  "X-CSRF-TOKEN": csrfToken,
               },
               body: JSON.stringify({ name: name.trim() }),
            });

            if (!response.ok) {
               let msg = "Gagal menambah unit";
               try {
                  const errJson = await response.json();
                  msg +=
                     ": " + (errJson.message || JSON.stringify(errJson));
               } catch { }
               throw new Error(msg);
            }

            const newUnit = await response.json();
            setUnitsState((prev) => [...prev, newUnit]);

            // Set to draft item last
            try {
               const items = [...data.items];
               if (items.length) {
                  items[items.length - 1].unit_id = String(newUnit.id);
                  setData("items", items);
               }
            } catch (e) { }

            window.dispatchEvent(
               new CustomEvent("purchase:unit-created", {
                  detail: newUnit,
               })
            );
            return;
         } catch (err) {
            console.error("Error tambah unit:", err);
            Swal.fire({
               title: "Gagal!",
               text: "Gagal menambah unit: " + err.message,
               icon: "error",
               confirmButtonText: "OK",
            });
            return;
         }
      }

      // Otherwise, show the modal
      console.debug("Opening unit modal");
      setShowUnitModal(true);
   };

   // Handler perubahan field utama
   const handleChange = (e) => {
      const { name, value } = e.target;
      if (name === "supplier_name") {
         setData("supplier_name", value);
         const selected = suppliersState.find((s) => s.name === value);
         setData("supplier_id", selected?.id || "");
         setData("phone", selected?.phone || "");
         setData("address", selected?.address || "");

         // Auto-reset items saat supplier berubah
         // Reset hanya baris input terakhir (draft item)
         const items = [...data.items];
         if (items.length > 0) {
            const lastItem = items[items.length - 1];
            // Reset category, subcategory, dan product di baris input terakhir
            items[items.length - 1] = {
               ...lastItem,
               category_id: "",
               subcategory_id: "",
               product_id: "",
            };
            setData("items", items);
            // Clear draft dari localStorage
            localStorage.setItem(
               "purchase_draft_item",
               JSON.stringify(items[items.length - 1])
            );
         }
      } else if (name === "toko_id") {
         setData("toko_id", value);
         const selected = tokos.find((t) => String(t.id) === String(value));
         setData("toko_name", selected?.name || "");
         setData(
            "toko_address",
            selected?.address || selected?.alamat || ""
         );
         setData("toko_phone", selected?.phone || selected?.telp || "");
      } else if (
         name === "toko_name" ||
         name === "toko_address" ||
         name === "toko_phone"
      ) {
         setData(name, value);
      } else if (name === "warehouse_id") {
         setData("warehouse_id", value);
         console.log("WAREHOUSES STATE:", warehousesState);
         const selected = warehousesState.find(
            (w) => String(w.id) === String(value)
         );
         console.log("SELECTED WAREHOUSE:", selected);
         setData("warehouse_name", selected?.name || "");
         setData(
            "warehouse_address",
            selected?.address || selected?.alamat || ""
         );
         setData("warehouse_phone", selected?.phone || selected?.telp || "");
      } else {
         setData(name, value);
      }
   };

   // Handler perubahan item
   const handleItemChange = (idx, e) => {
      const items = [...data.items];
      // handle both synthetic events and direct value updates
      const name = e && e.target && e.target.name ? e.target.name : null;
      let value =
         e && e.target && e.target.value !== undefined ? e.target.value : e;
      // Coerce types for known fields
      if (
         name === "kuli_fee" ||
         name === "harga_pembelian" ||
         name === "qty" ||
         name === "qty_gudang" ||
         name === "qty_toko"
      ) {
         value =
            value === null || value === undefined || value === ""
               ? 0
               : Number(value);
      }
      if (name === "_kuli_manual") {
         value = Boolean(value);
      }
      if (name) {
         items[idx][name] = value;
      }

      setData("items", items);
      if (idx === data.items.length - 1) {
         localStorage.setItem(
            "purchase_draft_item",
            JSON.stringify(items[idx])
         );
      }
   };

   // Tambah item
   const addItem = () => {
      const newItems = [
         ...data.items,
         {
            product_id: "",
            unit_id: "",
            category_id: "",
            subcategory_id: "",
            qty: 0,
            qty_gudang: 0,
            qty_toko: 0,
            harga_pembelian: 0,
            kuli_fee: 0,
            _kuli_manual: false,
         },
      ];
      setData("items", newItems);
      localStorage.setItem(
         "purchase_items_table",
         JSON.stringify(newItems.slice(0, -1))
      );
      localStorage.removeItem("purchase_draft_item");
   };

   // Hapus item
   const removeItem = (idx) => {
      if (data.items.length === 1) return;
      const newItems = data.items.filter((_, i) => i !== idx);
      setData("items", newItems);
      localStorage.setItem(
         "purchase_items_table",
         JSON.stringify(newItems.slice(0, -1))
      );
   };

   // Submit
   const handleSubmit = (e) => {
      e.preventDefault();
      const itemsTable = data.items.slice(0, -1);
      const itemsValid = itemsTable
         .filter((item) => {
            return (
               item &&
               item.product_id !== undefined &&
               item.product_id !== null &&
               String(item.product_id).trim() !== "" &&
               Number(item.product_id) > 0 &&
               item.unit_id !== undefined &&
               item.unit_id !== null &&
               String(item.unit_id).trim() !== "" &&
               Number(item.unit_id) > 0 &&
               item.category_id !== undefined &&
               item.category_id !== null &&
               String(item.category_id).trim() !== "" &&
               Number(item.category_id) > 0 &&
               item.qty !== undefined &&
               item.qty !== null &&
               Number(item.qty) > 0 &&
               item.harga_pembelian !== undefined &&
               item.harga_pembelian !== null &&
               Number(item.harga_pembelian) >= 0
            );
         })
         .map((item, idx) => {
            return {
               ...item,
               product_id: Number(item.product_id),
               unit_id: Number(item.unit_id),
               category_id: Number(item.category_id),
               subcategory_id: item.subcategory_id
                  ? Number(item.subcategory_id)
                  : null,
               qty: Number(item.qty),
               qty_gudang: Number(item.qty_gudang),
               qty_toko: Number(item.qty_toko),
               harga_pembelian: Number(item.harga_pembelian),
               kuli_fee: Number(item.kuli_fee),
               timbangan: Number(timbanganGlobal), // pastikan selalu ambil dari state global
            };
         });
      console.log("[DEBUG] itemsTable:", itemsTable);
      console.log("[DEBUG] itemsValid:", itemsValid);
      if (itemsValid.length === 0) {
         alert("Silakan isi minimal 1 item pembelian yang valid.");
         return;
      }
      const payload = {
         invoice_number: data.invoice_number,
         supplier_name: data.supplier_name || null,
         toko_id: data.toko_id || null,
         warehouse_id: data.warehouse_id ? Number(data.warehouse_id) : null,
         purchase_date: data.purchase_date,
         phone: data.phone || null,
         address: data.address || null,
         items: itemsValid,
      };
      console.log("[DEBUG] payload:", payload);
      // Show confirmation before submitting
      Swal.fire({
         title: "Konfirmasi Pembayaran",
         text: "Apakah Anda yakin ingin menyimpan pembelian ini? Data yang disimpan akan diverifikasi.",
         icon: "warning",
         showCancelButton: true,
         confirmButtonText: "Ya, simpan",
         cancelButtonText: "Batal",
         reverseButtons: true,
      }).then((result) => {
         if (!result.isConfirmed) {
            Swal.fire({
               toast: true,
               position: "top-end",
               icon: "info",
               title: "Dibatalkan",
               showConfirmButton: false,
               timer: 1500,
            });
            return;
         }

         // User confirmed, submit via Inertia post
         post(route("purchases.store"), payload, {
            onSuccess: (page) => {
               // Clear localStorage first
               localStorage.removeItem("purchase_draft_item");
               localStorage.removeItem("purchase_items_table");

               // Reset all form data manually to ensure clean state
               setData({
                  invoice_number: "",
                  supplier_name: "",
                  toko_id: "",
                  toko_name: "",
                  toko_address: "",
                  toko_phone: "",
                  warehouse_id: "",
                  warehouse_name: "",
                  warehouse_address: "",
                  warehouse_phone: "",
                  purchase_date: "",
                  phone: "",
                  address: "",
                  items: [{
                     product_id: "",
                     unit_id: "",
                     category_id: "",
                     subcategory_id: "",
                     qty: 0,
                     qty_gudang: 0,
                     qty_toko: 0,
                     harga_pembelian: 0,
                     kuli_fee: 0,
                  }],
               });

               // Reset semua state tambahan
               setTimbanganGlobal(0);

               // Reset modal states
               setShowTokoModal(false);
               setShowSupplierModal(false);
               setShowGudangModal(false);

               // Reset manual forms
               setManualToko({ name: "", address: "", phone: "" });
               setManualSupplier({ name: "", address: "", phone: "" });
               setManualGudang({ name: "", address: "", phone: "" });

               // Reset state arrays to original props
               setTokos(tokosProp);
               setSuppliersState(suppliers);
               setWarehousesState(warehouses);

               // Success message will be shown by the useEffect when successMessage prop is received
               // No need to manually show Swal here as the backend handles it
            },
            onError: (errors) => {
               // Normalize various error shapes and always show a Swal toast
               try {
                  console.error("Submission errors:", errors);

                  let message = null;

                  // If errors is a string
                  if (typeof errors === "string") {
                     message = errors;
                  }

                  // If errors is an object of validation messages (Inertia returns { field: [msg,..] })
                  else if (errors && typeof errors === "object") {
                     const parts = [];
                     Object.values(errors).forEach((v) => {
                        if (Array.isArray(v)) {
                           parts.push(...v);
                        } else if (typeof v === "string") {
                           parts.push(v);
                        }
                     });
                     if (parts.length) message = parts.join(" \n");
                  }

                  // Try to read flashed error message from Inertia props as fallback
                  if (!message) {
                     try {
                        const inertiaPage =
                           window.page ||
                           (window.Inertia && window.Inertia.page) ||
                           null;
                        if (inertiaPage && inertiaPage.props) {
                           // common places: props.flash.error or props.errors
                           if (
                              inertiaPage.props.flash &&
                              inertiaPage.props.flash.error
                           ) {
                              message = inertiaPage.props.flash.error;
                           } else if (inertiaPage.props.errors) {
                              const vals = Object.values(
                                 inertiaPage.props.errors
                              ).flat();
                              if (vals.length)
                                 message = vals.join(" \n");
                           }
                        }
                     } catch (e) { }
                  }

                  if (!message)
                     message =
                        "Terjadi kesalahan saat menyimpan. Silakan coba lagi.";

                  Swal.fire({
                     toast: true,
                     position: "top-end",
                     icon: "error",
                     title: "Gagal menyimpan pembelian",
                     text: message,
                     showConfirmButton: false,
                     timer: 4000,
                  });
               } catch (err) {
                  console.log("Swal show error:", err);
               }
            },
         });
      });
   };


   // Hitung total harga pembelian (subtotal per item: qty * unit_conversion * harga_pembelian + kuli_fee + timbangan)
   // Hitung total harga pembelian dari semua item (kecuali baris input draft terakhir)
   const totalHarga = (() => {
      const itemsArr = data.items.slice(0, -1);
      let subtotalSum = 0;
      let kuliSum = 0;
      let timbanganSum = 0;
      itemsArr.forEach((item) => {
         const harga = parseFloat(item.harga_pembelian) || 0;
         const qty = parseFloat(item.qty) || 0;
         const qtyTimbangan = parseFloat(item.qty_timbangan) || qty;
         let unitConversion = 1;
         if (item.unit_id && Array.isArray(units)) {
            const unitObj = units.find(
               (u) => String(u.id) === String(item.unit_id)
            );
            if (unitObj && unitObj.conversion_to_kg) {
               unitConversion = parseFloat(unitObj.conversion_to_kg) || 1;
            }
         }
         // Subtotal dasar: qty * harga (TIDAK dikali unitConversion karena harga sudah per unit!)
         const subtotal = qty * harga;
         subtotalSum += subtotal;
         const feeRate = parseFloat(item.kuli_fee) || 0;
         // fee per item = flat fee (not multiplied by qty)
         kuliSum += feeRate;
         // timbangan: (qty_timbang - qty_input) * harga_satuan (TIDAK pakai unitConversion, harga sudah per unit!)
         const selisihTimbangan = (qtyTimbangan - qty) * harga;
         timbanganSum += selisihTimbangan;
      });
      // Return total termasuk fee kuli dan timbangan agar terhitung otomatis
      return subtotalSum + kuliSum + timbanganSum;
   })();

   return (
      <>
         <Head title="Tambah Pembelian" />

         {/* Top card */}
         <div className="mx-auto mt-6 max-w-7xl">
            {/* Ubah max-w-5xl menjadi max-w-7xl */}
            <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl dark:bg-gray-800 dark:border-gray-700">
               <Card className="flex flex-col sm:flex-row m-2 sm:m-4 p-3 sm:p-4 justify-between items-center border-b border-gray-100 dark:border-gray-700 gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 px-1 sm:px-2 py-1 w-full sm:w-auto">
                     <svg
                        className="text-blue-600 w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                     >
                        <path
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           d="M9 17v-2a4 4 0 014-4h3m4 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                     </svg>
                     <CardHeader className="p-0 sm:p-2 flex-1 min-w-0">
                        <CardTitle className="text-base sm:text-lg font-medium text-gray-700 dark:text-gray-200 truncate">
                           Tambah Pembelian Baru
                        </CardTitle>
                     </CardHeader>
                  </div>

                  {/* Realtime clock on the right */}
                  <div className="flex-shrink-0 w-full sm:w-auto flex justify-center sm:justify-end">
                     <Card className="bg-blue-500 dark:bg-gray-900 w-fit">
                        <div className="space-y-2 text-center py-2 sm:py-3 px-3 sm:px-4">
                           <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-white">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="hidden xs:inline">Waktu Real-time</span>
                              <span className="xs:hidden">Real-time</span>
                           </div>
                           <p className="font-sans text-white text-xs sm:text-sm font-semibold text-center">
                              {formattedTime}
                           </p>
                        </div>
                     </Card>
                  </div>
               </Card>

               <div className="p-4 sm:p-6">
                  {" "}
                  {/* Kurangi padding menjadi p-4 */}
                  <div className="mb-4 space-y-2">
                     <BackToDashboard />
                     <a
                        href={route("purchases.index")}
                        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200"
                     >
                        &larr; Kembali ke Daftar Pembelian
                     </a>
                  </div>
                  {(() => {
                     const itemsTable = data.items.slice(0, -1);
                     window.__hasValidItem =
                        itemsTable.filter(
                           (item) =>
                              item.product_id &&
                              item.unit_id &&
                              item.category_id &&
                              String(item.product_id).trim() !== "" &&
                              String(item.unit_id).trim() !== "" &&
                              String(item.category_id).trim() !==
                              "" &&
                              Number(item.product_id) > 0 &&
                              Number(item.unit_id) > 0 &&
                              Number(item.category_id) > 0 &&
                              Number(item.qty) > 0 &&
                              Number(item.harga_pembelian) >= 0
                        ).length > 0;
                  })()}
                  <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Grid utama: PurchaseFormInfo + Lokasi sejajar (desktop) */}
                     <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {" "}
                        {/* Purchase form spans two columns on md+ */}
                        <div className="md:col-span-2">
                           <PurchaseFormInfo
                              data={data}
                              suppliers={suppliersState}
                              tokos={tokos}
                              products={filteredProducts}
                              handleChange={handleChange}
                              setData={setData}
                              location={props.location}
                              // Toko
                              showTokoModal={showTokoModal}
                              setShowTokoModal={setShowTokoModal}
                              manualToko={manualToko}
                              setManualToko={setManualToko}
                              handleManualTokoChange={
                                 handleManualTokoChange
                              }
                              handleManualTokoSubmit={
                                 handleManualTokoSubmit
                              }
                              // Supplier
                              showSupplierModal={showSupplierModal}
                              setShowSupplierModal={
                                 setShowSupplierModal
                              }
                              manualSupplier={manualSupplier}
                              setManualSupplier={setManualSupplier}
                              handleManualSupplierChange={
                                 handleManualSupplierChange
                              }
                              handleManualSupplierSubmit={
                                 handleManualSupplierSubmit
                              }
                              manualSupplierErrors={manualSupplierErrors}
                              manualSupplierSubmitting={manualSupplierSubmitting}
                           />
                        </div>
                     </div>

                     {/* Bagian ringkasan: 1 bagian dengan 3 kolom (UI saja) */}
                     <div className="mt-6">
                        <h3 className="mb-3 text-lg font-semibold">
                           Ringkasan Pembelian
                        </h3>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 justify-items-center">
                           <div className="w-full max-w-sm p-4 mx-auto bg-white border rounded-lg shadow-sm">
                              <div className="text-sm text-gray-500">
                                 Total Item
                              </div>
                              <div className="mt-2 text-2xl font-bold text-gray-800">
                                 {Math.max(0, data.items.length - 1)}
                              </div>
                           </div>
                           <div className="w-full max-w-sm p-4 mx-auto bg-white border rounded-lg shadow-sm">
                              <div className="text-sm text-gray-500">
                                 Total Harga
                              </div>
                              <div className="mt-2 text-2xl font-bold text-gray-800">
                                 {typeof totalHarga === "number"
                                    ? totalHarga.toLocaleString(
                                       "id-ID"
                                    )
                                    : totalHarga}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-6">
                        <div className="flex items-center justify-between mb-3">
                           <h3 className="font-semibold text-gray-700 text-md">
                              Tambah Item Pembelian
                           </h3>
                           {/* <div className="text-sm text-gray-500">
                                        Total:{" "}
                                        <span className="font-medium text-gray-800">
                                            {totalHarga.toLocaleString?.(
                                                "id-ID"
                                            ) ?? totalHarga}
                                        </span>
                                    </div> */}
                        </div>

                        <PurchaseItemInput
                           item={data.items[data.items.length - 1]}
                           categories={filteredCategories}
                           subcategories={filteredSubcategories}
                           products={filteredProducts}
                           units={unitsState}
                           onChange={(e) =>
                              handleItemChange(
                                 data.items.length - 1,
                                 e
                              )
                           }
                           onAdd={addItem}
                           onAddCategory={(name) =>
                              handleAddCategory(name)
                           }
                           onAddSubcategory={(name, categoryId) =>
                              handleAddSubcategory(name, categoryId)
                           }
                           onAddProduct={(payload) =>
                              handleAddProduct(payload)
                           }
                           onAddUnit={() => handleAddUnit()}
                        />

                        <div className="mt-4 border rounded-lg">
                           <div className="overflow-x-auto w-full">
                              <div className="min-w-[900px]">
                                 <PurchaseItemsTable
                                    items={data.items.slice(0, -1)}
                                    products={filteredProducts}
                                    units={unitsState}
                                    categories={filteredCategories}
                                    subcategories={filteredSubcategories}
                                    supplierName={selectedSupplierName}
                                    onRemove={removeItem}
                                    onItemUpdate={(itemIndex, updatedItem) => {
                                       const items = [...data.items];

                                       const totalQty = parseFloat(updatedItem.qty) || 0;
                                       const qtyGudang = parseFloat(updatedItem.qty_gudang) || 0;

                                       // Simplified Logic: Qty Toko is ALWAYS calculated automatically
                                       // Qty Toko = Qty - Qty Gudang
                                       // If Qty Gudang > Qty, then Qty Toko = 0

                                       if (totalQty > 0) {
                                          // Calculate shop qty from main qty minus warehouse qty
                                          const calculatedQtyToko = totalQty - qtyGudang;
                                          updatedItem.qty_toko = calculatedQtyToko > 0 ? calculatedQtyToko : 0;
                                       } else if (qtyGudang > 0) {
                                          // If only warehouse qty is entered, auto-set main qty
                                          updatedItem.qty = qtyGudang;
                                          updatedItem.qty_toko = 0;
                                       } else {
                                          // Both zero
                                          updatedItem.qty_toko = 0;
                                       }

                                       items[itemIndex] = updatedItem;
                                       // Update localStorage
                                       localStorage.setItem(
                                          "purchase_items_table",
                                          JSON.stringify(items.slice(0, -1))
                                       );
                                       setData("items", items);
                                    }}
                                    onKuliFeeCheckboxChange={(checked) => {
                                       const items = [...data.items];
                                       for (
                                          let i = 0;
                                          i < items.length - 1;
                                          i++
                                       ) {
                                          items[i].kuli_fee = checked
                                             ? 1000
                                             : 0;
                                       }
                                       setData("items", items);
                                    }}
                                    onKuliFeeChange={(value) => {
                                       const items = [...data.items];
                                       for (
                                          let i = 0;
                                          i < items.length - 1;
                                          i++
                                       ) {
                                          items[i].kuli_fee = value;
                                       }
                                       setData("items", items);
                                    }}
                                    onKuliManualChange={(checked) => {
                                       const items = [...data.items];
                                       for (
                                          let i = 0;
                                          i < items.length - 1;
                                          i++
                                       ) {
                                          items[i]._kuli_manual = checked;
                                          if (!checked)
                                             items[i].kuli_fee = 0;
                                       }
                                       setData("items", items);
                                    }}
                                    timbanganGlobal={timbanganGlobal}
                                    setTimbanganGlobal={(value) => {
                                       setTimbanganGlobal(value);
                                       const items = [...data.items];
                                       for (
                                          let i = 0;
                                          i < items.length - 1;
                                          i++
                                       ) {
                                          items[i].timbangan = value;
                                       }
                                       setData("items", items);
                                    }}
                                    onTimbanganChange={(value) => {
                                       setTimbanganGlobal(value);
                                       const items = [...data.items];
                                       for (
                                          let i = 0;
                                          i < items.length - 1;
                                          i++
                                       ) {
                                          items[i].timbangan = value;
                                       }
                                       setData("items", items);
                                    }}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center justify-end gap-3 mt-4">
                        <Button
                           type="button"
                           variant="outline"
                           onClick={() => {
                              // Konfirmasi sebelum reset
                              Swal.fire({
                                 title: "Reset Form?",
                                 text: "Semua data yang belum disimpan akan hilang. Apakah Anda yakin?",
                                 icon: "warning",
                                 showCancelButton: true,
                                 confirmButtonText: "Ya, Reset",
                                 cancelButtonText: "Batal",
                                 confirmButtonColor: "#ef4444",
                                 reverseButtons: true,
                              }).then((result) => {
                                 if (result.isConfirmed) {
                                    // Clear localStorage
                                    localStorage.removeItem("purchase_draft_item");
                                    localStorage.removeItem("purchase_items_table");

                                    // Reset all form data
                                    setData({
                                       invoice_number: "",
                                       supplier_name: "",
                                       toko_id: "",
                                       toko_name: "",
                                       toko_address: "",
                                       toko_phone: "",
                                       purchase_date: "",
                                       phone: "",
                                       address: "",
                                       items: [{
                                          product_id: "",
                                          unit_id: "",
                                          category_id: "",
                                          subcategory_id: "",
                                          qty: 0,
                                          qty_gudang: 0,
                                          qty_toko: 0,
                                          harga_pembelian: 0,
                                          kuli_fee: 0,
                                          _kuli_manual: false,
                                       }],
                                    });

                                    // Reset timbangan global
                                    setTimbanganGlobal(0);

                                    // Reset selected supplier
                                    setSelectedSupplierId(null);

                                    // Reset modal states
                                    setShowTokoModal(false);
                                    setShowSupplierModal(false);
                                    setShowUnitModal(false);
                                    setShowProductQuickModal(false);
                                    setShowCategoryQuickModal(false);
                                    setShowSubcategoryQuickModal(false);

                                    // Reset manual forms
                                    setManualToko({ name: "", address: "", phone: "" });
                                    setManualSupplier({ name: "", address: "", phone: "" });
                                    setManualUnit({ name: "", conversion_to_kg: "" });

                                    // Show success message
                                    Swal.fire({
                                       toast: true,
                                       position: "top-end",
                                       icon: "success",
                                       title: "Form berhasil direset",
                                       showConfirmButton: false,
                                       timer: 2000,
                                    });
                                 }
                              });
                           }}
                        >
                           Reset
                        </Button>
                        <Button
                           type="submit"
                           disabled={
                              processing || !window.__hasValidItem
                           }
                        >
                           {processing ? "Memproses..." : "Bayar"}
                        </Button>
                     </div>

                     {/* Modal Tambah Toko Manual */}
                     <TokoManualModal
                        show={showTokoModal}
                        onClose={() => setShowTokoModal(false)}
                        onSubmit={handleManualTokoSubmit}
                        manualToko={manualToko}
                        onChange={handleManualTokoChange}
                     />
                     {/* Modal Tambah Supplier Manual */}
                     <SupplierManualModal
                        show={showSupplierModal}
                        onClose={() => setShowSupplierModal(false)}
                        onSubmit={handleManualSupplierSubmit}
                        manualSupplier={manualSupplier}
                        onChange={handleManualSupplierChange}
                     />
                     {/* Modal Tambah Unit Manual */}
                     <UnitManualModal
                        show={showUnitModal}
                        onClose={() => setShowUnitModal(false)}
                        onSubmit={handleManualUnitSubmit}
                        manualUnit={manualUnit}
                        onChange={handleManualUnitChange}
                        isLoading={isUnitLoading}
                     />
                     {/* Product quick-create modal (used by + Tambah Produk) */}
                     <ProductQuickModal
                        show={showProductQuickModal}
                        onClose={() => setShowProductQuickModal(false)}
                        initial={productQuickInitial}
                        units={units}
                        categories={categoriesState}
                        subcategories={subcategoriesState}
                        supplierId={selectedSupplierId}
                        onCreated={(newProd) => {
                           // Append to local products state and dispatch event
                           setProductsState((prev) => [
                              ...prev,
                              newProd,
                           ]);
                           window.dispatchEvent(
                              new CustomEvent(
                                 "purchase:product-created",
                                 {
                                    detail: newProd,
                                 }
                              )
                           );
                           setShowProductQuickModal(false);
                        }}
                     />
                     {/* Category quick-create modal */}
                     <CategoryQuickModal
                        show={showCategoryQuickModal}
                        onClose={() => setShowCategoryQuickModal(false)}
                        initial={categoryQuickInitial}
                        onCreated={(newCategory) => {
                           // Append to local categories state
                           setCategoriesState((prev) => [
                              ...prev,
                              newCategory,
                           ]);

                           // Auto-select category yang baru dibuat di item terakhir
                           try {
                              const items = [...data.items];
                              if (items.length) {
                                 items[items.length - 1].category_id = String(newCategory.id);
                                 setData("items", items);
                              }
                           } catch (e) {
                              console.error("Error auto-selecting category:", e);
                           }

                           window.dispatchEvent(
                              new CustomEvent(
                                 "purchase:category-created",
                                 {
                                    detail: newCategory,
                                 }
                              )
                           );
                           setShowCategoryQuickModal(false);
                        }}
                     />
                     {/* Subcategory quick-create modal */}
                     <SubcategoryQuickModal
                        show={showSubcategoryQuickModal}
                        onClose={() => setShowSubcategoryQuickModal(false)}
                        initial={subcategoryQuickInitial}
                        categories={filteredCategories}
                        onCreated={(newSubcategory) => {
                           // Append to local subcategories state
                           setSubcategoriesState((prev) => [
                              ...prev,
                              newSubcategory,
                           ]);

                           // Auto-select subcategory yang baru dibuat di item terakhir
                           try {
                              const items = [...data.items];
                              if (items.length) {
                                 items[items.length - 1].subcategory_id = String(newSubcategory.id);
                                 setData("items", items);
                              }
                           } catch (e) {
                              console.error("Error auto-selecting subcategory:", e);
                           }

                           window.dispatchEvent(
                              new CustomEvent(
                                 "purchase:subcategory-created",
                                 {
                                    detail: newSubcategory,
                                 }
                              )
                           );
                           setShowSubcategoryQuickModal(false);
                        }}
                     />
                  </form>
               </div>
            </div>
         </div>
      </>
   );
}

Create.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
