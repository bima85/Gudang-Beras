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
import GudangManualModal from "./GudangManualModal";
import ProductQuickModal from "./ProductQuickModal";
import BackToDashboard from "@/Components/Dashboard/BackToDashboard";

export default function Create(props) {
    const [timbanganGlobal, setTimbanganGlobal] = useState(0);
    // Realtime clock for the form
    const [currentTime, setCurrentTime] = useState(new Date());
    React.useEffect(() => {
        const id = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    // Only log when timbanganGlobal actually changes to avoid spamming the console
    React.useEffect(() => {
        console.debug("Nilai timbangan:", timbanganGlobal);
    }, [timbanganGlobal]);
    const {
        suppliers = [],
        warehouses = [],
        products = [],
        units = [],
        categories = [],
        subcategories = [],
        tokos: tokosProp = [],
        lastPurchaseId,
    } = props;

    // local state for categories so we can append new ones live
    const [categoriesState, setCategoriesState] = useState(categories);
    // local state for subcategories and products so we can append new ones live
    const [subcategoriesState, setSubcategoriesState] = useState(subcategories);
    const [productsState, setProductsState] = useState(products);
    // product quick-create modal state
    const [showProductQuickModal, setShowProductQuickModal] = useState(false);
    const [productQuickInitial, setProductQuickInitial] = useState(null);
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
                    qty: item.qty ? Number(item.qty) : 1,
                    qty_gudang: item.qty_gudang ? Number(item.qty_gudang) : 0,
                    qty_toko: item.qty_toko ? Number(item.qty_toko) : 0,
                    harga_pembelian: item.harga_pembelian
                        ? Number(item.harga_pembelian)
                        : 0,
                    kuli_fee: item.kuli_fee ? Number(item.kuli_fee) : 0,
                };
            }
        } catch {}
        return {
            product_id: "",
            unit_id: "",
            category_id: "",
            subcategory_id: "",
            qty: 1,
            qty_gudang: 0,
            qty_toko: 0,
            harga_pembelian: 0,
            kuli_fee: 0,
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
                    qty: item.qty ? Number(item.qty) : 1,
                    qty_gudang: item.qty_gudang ? Number(item.qty_gudang) : 0,
                    qty_toko: item.qty_toko ? Number(item.qty_toko) : 0,
                    harga_pembelian: item.harga_pembelian
                        ? Number(item.harga_pembelian)
                        : 0,
                    kuli_fee: item.kuli_fee ? Number(item.kuli_fee) : 0,
                }));
            }
        } catch {}
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
            qty: 1,
            qty_gudang: 0,
            qty_toko: 0,
            harga_pembelian: 0,
            kuli_fee: 0,
        });
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        invoice_number: "",
        invoice_seq: "",
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
        items: itemsInit,
    });

    // Generate invoice_number otomatis
    React.useEffect(() => {
        if (!data.purchase_date || !data.invoice_seq) {
            setData("invoice_number", "");
            return;
        }
        const date = new Date(data.purchase_date);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const seq = String(data.invoice_seq).padStart(3, "0");
        setData("invoice_number", `PB-${yyyy}/${mm}/${dd}-${seq}`);
    }, [data.purchase_date, data.invoice_seq]);

    // State untuk modal tambah toko manual
    const [showTokoModal, setShowTokoModal] = useState(false);
    const [manualToko, setManualToko] = useState({
        name: "",
        address: "",
        phone: "",
    });
    // State lokal untuk dropdown toko
    const [tokos, setTokos] = useState(tokosProp);

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
                } catch {}
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
    const [suppliersState, setSuppliersState] = useState(suppliers);
    const handleManualSupplierChange = (e) => {
        setManualSupplier({
            ...manualSupplier,
            [e.target.name]: e.target.value,
        });
    };
    const handleManualSupplierSubmit = async (e) => {
        e.preventDefault();
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
                        // Handle validation errors
                        const errorMessages = Object.values(
                            errJson.errors
                        ).flat();
                        msg += ": " + errorMessages.join(", ");
                    } else {
                        msg +=
                            ": " + (errJson.message || JSON.stringify(errJson));
                    }
                } catch (parseError) {
                    msg += ": Server returned non-JSON response";
                }
                throw new Error(msg);
            }
            const newSupplier = await response.json();
            setSuppliersState((prev) => [...prev, newSupplier]);
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
        }
    };

    // State untuk modal tambah gudang manual
    const [showGudangModal, setShowGudangModal] = useState(false);
    const [manualGudang, setManualGudang] = useState({
        name: "",
        address: "",
        phone: "",
    });
    const [warehousesState, setWarehousesState] = useState(warehouses);
    const handleManualGudangChange = (e) => {
        setManualGudang({
            ...manualGudang,
            [e.target.name]: e.target.value,
        });
    };
    const handleManualGudangSubmit = async (e) => {
        e.preventDefault();
        try {
            const warehouseStoreUrl =
                typeof route === "function"
                    ? route("dashboard.warehouses.store")
                    : "/warehouses";
            let csrfToken = "";
            const meta = document.querySelector('meta[name="csrf-token"]');
            if (meta) {
                csrfToken = meta.getAttribute("content");
            } else if (window.Laravel && window.Laravel.csrfToken) {
                csrfToken = window.Laravel.csrfToken;
            }
            const response = await fetch(warehouseStoreUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    name: manualGudang.name,
                    address: manualGudang.address,
                    phone: manualGudang.phone,
                    code: manualGudang.name
                        ? manualGudang.name
                              .replace(/\s+/g, "_")
                              .toUpperCase()
                              .slice(0, 20)
                        : `GDG_${Date.now()}`,
                }),
            });
            if (!response.ok) {
                let msg = "Gagal menambah gudang";
                try {
                    const errJson = await response.json();
                    msg += ": " + (errJson.message || JSON.stringify(errJson));
                } catch {}
                throw new Error(msg);
            }
            const newWarehouse = await response.json();
            console.log("Response gudang baru:", newWarehouse);
            setWarehousesState((prev) => [...prev, newWarehouse]);
            setData("warehouse_id", newWarehouse.id);
            setData("warehouse_name", newWarehouse.name);
            setData("warehouse_address", newWarehouse.address);
            setData("warehouse_phone", newWarehouse.phone);
            setShowGudangModal(false);
        } catch (err) {
            console.error("Error tambah gudang manual:", err);
            alert("Gagal menambah gudang: " + err.message);
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
        try {
            let categoryName = name;
            if (!categoryName) {
                categoryName = window.prompt("Nama kategori baru");
            }
            if (!categoryName || !categoryName.trim()) return;

            const url = "/dashboard/categories";
            const csrfToken = await getCsrfToken();

            // ask for a description because backend validation may require it
            let categoryDescription = "";
            try {
                categoryDescription = window.prompt(
                    "Deskripsi kategori (wajib jika diminta):",
                    ""
                );
            } catch (e) {}
            if (!categoryDescription || !String(categoryDescription).trim()) {
                categoryDescription = categoryName.trim();
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    name: categoryName.trim(),
                    code: genCode(categoryName, "CAT_"),
                    description: String(categoryDescription).trim(),
                }),
            });

            if (!response.ok) {
                let msg = "Gagal menambah kategori";
                try {
                    const errJson = await response.json();
                    msg += ": " + (errJson.message || JSON.stringify(errJson));
                } catch {}
                throw new Error(msg);
            }

            const newCat = await response.json();
            setCategoriesState((prev) => [...prev, newCat]);

            // Set ke draft item terakhir agar langsung terpilih
            try {
                const items = [...data.items];
                if (items.length) {
                    items[items.length - 1].category_id = String(newCat.id);
                    setData("items", items);
                }
            } catch (e) {}

            window.dispatchEvent(
                new CustomEvent("purchase:category-created", { detail: newCat })
            );
        } catch (err) {
            console.error("Error tambah kategori:", err);
            try {
                Swal.fire({
                    title: "Gagal!",
                    text: "Gagal menambah kategori: " + err.message,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } catch (e) {
                alert("Gagal menambah kategori: " + err.message);
            }
        }
    };

    const handleAddSubcategory = async (name, categoryId) => {
        try {
            let subName = name;
            let catId =
                categoryId ||
                data.items[data.items.length - 1]?.category_id ||
                null;
            if (!subName) {
                subName = window.prompt("Nama subkategori baru");
            }
            if (!subName || !subName.trim()) return;
            if (!catId) {
                alert(
                    "Pilih kategori terlebih dahulu sebelum menambah subkategori."
                );
                return;
            }

            const url = "/dashboard/subcategories";
            const csrfToken = await getCsrfToken();

            // ask description for subcategory if backend requires it
            let subDescription = "";
            try {
                subDescription = window.prompt(
                    "Deskripsi subkategori (opsional jika tidak diperlukan):",
                    ""
                );
            } catch (e) {}
            if (!subDescription || !String(subDescription).trim()) {
                subDescription = subName.trim();
            }

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-TOKEN": csrfToken,
                },
                body: JSON.stringify({
                    name: subName.trim(),
                    code: genCode(subName, "SUB_"),
                    description: String(subDescription).trim(),
                    category_id: Number(catId),
                }),
            });

            if (!response.ok) {
                let msg = "Gagal menambah subkategori";
                try {
                    const responseText = await response.text();
                    if (responseText.includes("<!DOCTYPE")) {
                        msg +=
                            ": Endpoint tidak ditemukan atau redirect ke HTML page";
                    } else {
                        const errJson = JSON.parse(responseText);
                        msg +=
                            ": " + (errJson.message || JSON.stringify(errJson));
                    }
                } catch (e) {
                    msg += ": Server error or invalid response";
                }
                throw new Error(msg);
            }

            let newSub;
            try {
                const responseText = await response.text();
                if (responseText.includes("<!DOCTYPE")) {
                    throw new Error(
                        "Server returned HTML instead of JSON - endpoint may be wrong"
                    );
                }
                newSub = JSON.parse(responseText);
            } catch (e) {
                throw new Error("Failed to parse response: " + e.message);
            }

            setSubcategoriesState((prev) => [...prev, newSub]);

            // Set ke draft item terakhir agar langsung terpilih
            try {
                const items = [...data.items];
                if (items.length) {
                    items[items.length - 1].subcategory_id = String(newSub.id);
                    setData("items", items);
                }
            } catch (e) {}

            window.dispatchEvent(
                new CustomEvent("purchase:subcategory-created", {
                    detail: newSub,
                })
            );
        } catch (err) {
            console.error("Error tambah subkategori:", err);
            try {
                Swal.fire({
                    title: "Gagal!",
                    text: "Gagal menambah subkategori: " + err.message,
                    icon: "error",
                    confirmButtonText: "OK",
                });
            } catch (e) {
                alert("Gagal menambah subkategori: " + err.message);
            }
        }
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
            } catch (e) {}
            if (!prodDescription || !String(prodDescription).trim()) {
                prodDescription = name.trim();
            }

            const response = await fetch(url, {
                method: "POST",
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
            });

            if (!response.ok) {
                let msg = "Gagal menambah produk";
                try {
                    const errJson = await response.json();
                    msg += ": " + (errJson.message || JSON.stringify(errJson));
                } catch {}
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
            } catch (e) {}

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

    // Handler perubahan field utama
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "supplier_name") {
            setData("supplier_name", value);
            const selected = suppliersState.find((s) => s.name === value);
            setData("phone", selected?.phone || "");
            setData("address", selected?.address || "");
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
        const value =
            e && e.target && e.target.value !== undefined ? e.target.value : e;
        if (name) {
            items[idx][name] = value;
        }

        // Jika yang berubah adalah qty, otomatis bagi ke toko/gudang
        try {
            const qtyVal = Number(items[idx].qty) || 0;
            const tokoShare = Math.floor(qtyVal / 2); // separuh untuk toko
            const gudangShare = qtyVal - tokoShare; // sisanya ke gudang
            items[idx].qty_toko = tokoShare;
            items[idx].qty_gudang = gudangShare;
        } catch (err) {}

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
                qty: 1,
                qty_gudang: 0,
                qty_toko: 0,
                harga_pembelian: 0,
                kuli_fee: 0,
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
                    // Reset semua form data
                    reset();

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

                    // Clear localStorage
                    localStorage.removeItem("purchase_draft_item");
                    localStorage.removeItem("purchase_items_table");

                    // determine lastPurchaseId if provided by backend
                    let lastId = null;
                    if (page && page.props && page.props.lastPurchaseId) {
                        lastId = page.props.lastPurchaseId;
                    } else if (page && page.lastPurchaseId) {
                        lastId = page.lastPurchaseId;
                    }

                    // Show success message and redirect
                    try {
                        Swal.fire({
                            title: "Berhasil!",
                            text: "Pembelian berhasil disimpan. Semua data telah direset untuk transaksi baru.",
                            icon: "success",
                            confirmButtonText: "OK",
                            timer: 3000,
                            timerProgressBar: true,
                        }).then(() => {
                            // Redirect dengan force reload untuk memastikan fresh state
                            const createUrl =
                                typeof route === "function"
                                    ? route("purchases.create")
                                    : "/dashboard/purchases/create";
                            window.location.href = createUrl;
                        });
                    } catch (err) {
                        console.log("Swal show error:", err);
                        // Fallback redirect
                        const createUrl =
                            typeof route === "function"
                                ? route("purchases.create")
                                : "/dashboard/purchases/create";
                        window.location.href = createUrl;
                    }
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
                            } catch (e) {}
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

    // Hitung total harga pembelian (subtotal per item: qty * unit_conversion * harga_pembelian + kuli_fee)
    // Hitung total harga pembelian dari semua item (kecuali baris input draft terakhir)
    const totalHarga = data.items.slice(0, -1).reduce((sum, item) => {
        // Ambil harga pembelian per item, jika kosong dianggap 0
        const harga = parseFloat(item.harga_pembelian) || 0;
        // Ambil jumlah (qty) item, jika kosong dianggap 0
        const qty = parseFloat(item.qty) || 0;
        // Ambil fee kuli per item, jika kosong dianggap 0
        const kuli = parseFloat(item.kuli_fee) || 0;
        // Default konversi unit ke kg adalah 1
        let unitConversion = 1;
        // Jika unit_id ada dan daftar units berupa array
        if (item.unit_id && Array.isArray(units)) {
            // Cari object unit yang sesuai dengan unit_id pada daftar units
            const unitObj = units.find(
                (u) => String(u.id) === String(item.unit_id)
            );
            // Jika unit ditemukan dan punya field conversion_to_kg, gunakan nilainya
            if (unitObj && unitObj.conversion_to_kg) {
                unitConversion = parseFloat(unitObj.conversion_to_kg) || 1;
            }
        }
        // Rumus subtotal per item: qty * konversi unit * harga - fee kuli
        // Akumulasi ke total
        return sum + (qty * unitConversion * harga - kuli);
    }, 0);

    return (
        <>
            <Head title="Tambah Pembelian" />

            {/* Top card */}
            <div className="mx-auto mt-6 max-w-7xl">
                {" "}
                {/* Ubah max-w-5xl menjadi max-w-7xl */}
                <div className="overflow-hidden bg-white border border-gray-100 shadow-md rounded-xl">
                    <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-white">
                        <svg
                            className="text-blue-600 w-7 h-7"
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
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">
                                Form Tambah Pembelian
                            </h2>
                            <p className="text-xs text-gray-500">
                                Isi detail pembelian dan tambahkan item.
                            </p>
                        </div>
                        {/* Realtime clock on the right */}
                        <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">
                            {new Date(currentTime).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            })}
                        </div>
                    </div>

                    <div className="p-4">
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
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                                {" "}
                                {/* Purchase form spans two columns on md+ */}
                                <div className="md:col-span-2">
                                    <PurchaseFormInfo
                                        data={data}
                                        suppliers={suppliersState}
                                        tokos={tokos}
                                        warehouses={warehousesState}
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
                                        // Gudang
                                        showGudangModal={showGudangModal}
                                        setShowGudangModal={setShowGudangModal}
                                        manualGudang={manualGudang}
                                        setManualGudang={setManualGudang}
                                        handleManualGudangChange={
                                            handleManualGudangChange
                                        }
                                        handleManualGudangSubmit={
                                            handleManualGudangSubmit
                                        }
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
                                    <div className="text-sm text-gray-500">
                                        Total:{" "}
                                        <span className="font-medium text-gray-800">
                                            {totalHarga.toLocaleString?.(
                                                "id-ID"
                                            ) ?? totalHarga}
                                        </span>
                                    </div>
                                </div>

                                <PurchaseItemInput
                                    item={data.items[data.items.length - 1]}
                                    categories={categoriesState}
                                    subcategories={subcategoriesState}
                                    products={productsState}
                                    units={units}
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
                                />

                                <div className="mt-4 overflow-hidden border rounded-lg">
                                    <PurchaseItemsTable
                                        items={data.items.slice(0, -1)}
                                        products={productsState}
                                        units={units}
                                        categories={categoriesState}
                                        subcategories={subcategoriesState}
                                        onRemove={removeItem}
                                        totalHarga={totalHarga}
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

                            <div className="flex items-center justify-end gap-3 mt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        // optional: clear draft
                                    }}
                                >
                                    Batal
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
                            {/* Modal Tambah Gudang Manual */}
                            <GudangManualModal
                                show={showGudangModal}
                                onClose={() => setShowGudangModal(false)}
                                onSubmit={handleManualGudangSubmit}
                                manualGudang={manualGudang}
                                onChange={handleManualGudangChange}
                            />
                            {/* Product quick-create modal (used by + Tambah Produk) */}
                            <ProductQuickModal
                                show={showProductQuickModal}
                                onClose={() => setShowProductQuickModal(false)}
                                initial={productQuickInitial}
                                units={units}
                                categories={categoriesState}
                                subcategories={subcategoriesState}
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
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

Create.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
