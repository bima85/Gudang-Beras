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

export default function Edit(props) {
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
        purchase = {},
    } = props;

    // local state for categories so we can append new ones live
    const [categoriesState, setCategoriesState] = useState(categories);
    // local state for subcategories and products so we can append new ones live
    const [subcategoriesState, setSubcategoriesState] = useState(subcategories);
    const [productsState, setProductsState] = useState(products);
    // product quick-create modal state
    const [showProductQuickModal, setShowProductQuickModal] = useState(false);
    const [productQuickInitial, setProductQuickInitial] = useState(null);

    // Clean up localStorage if there is any invalid/null item (from old bug)
    React.useEffect(() => {
        let needCleanup = false;
        try {
            const d = localStorage.getItem("purchase_draft_item");
            if (d) {
                const item = JSON.parse(d);
                if (
                    item == null ||
                    item.product_id == null ||
                    item.unit_id == null ||
                    item.category_id == null
                ) {
                    localStorage.removeItem("purchase_draft_item");
                    needCleanup = true;
                }
            }
        } catch {
            localStorage.removeItem("purchase_draft_item");
            needCleanup = true;
        }
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

    // Helper untuk parsing invoice_seq dari invoice_number (format: PB-YYYY/MM/DD-SEQ)
    function parseInvoiceSeq(invoiceNumber) {
        if (!invoiceNumber) return "";
        const parts = invoiceNumber.split("-");
        if (parts.length === 3) {
            const seq = parts[2];
            return seq;
        }
        return "";
    }

    // Helper untuk baris kosong tambah item
    function getEmptyItem() {
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
        };
    }

    // Initialize items from purchase data
    let itemsFromPurchase = purchase.items
        ? purchase.items.map((item) => ({
            product_id: String(item.product_id || ""),
            unit_id: String(item.unit_id || ""),
            category_id: String(item.category_id || ""),
            subcategory_id: String(item.subcategory_id || ""),
            qty: Number(item.qty || 0),
            qty_gudang: Number(item.qty_gudang || 0),
            qty_toko: Number(item.qty_toko || 0),
            harga_pembelian: Number(item.harga_pembelian || 0),
            kuli_fee: Number(item.kuli_fee || 0),
        }))
        : [];

    // Add empty row for new item input
    itemsFromPurchase = [...itemsFromPurchase, getEmptyItem()];

    const { data, setData, put, processing, errors, reset } = useForm({
        invoice_number: purchase.invoice_number || "",
        invoice_seq: parseInvoiceSeq(purchase.invoice_number),
        supplier_id: String(purchase.supplier_id || ""),
        supplier_name: purchase.supplier?.name || "",
        toko_id: String(purchase.toko_id || ""),
        toko_name: purchase.toko?.name || "",
        toko_address: purchase.toko?.address || purchase.toko?.alamat || "",
        toko_phone: purchase.toko?.phone || purchase.toko?.telp || "",
        warehouse_id: String(purchase.warehouse_id || ""),
        warehouse_name: purchase.warehouse?.name || "",
        warehouse_address: purchase.warehouse?.address || "",
        warehouse_phone: purchase.warehouse?.phone || "",
        purchase_date: purchase.purchase_date
            ? String(purchase.purchase_date).slice(0, 10)
            : "",
        phone: purchase.supplier?.phone || "",
        address: purchase.supplier?.address || "",
        items: itemsFromPurchase,
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

    // State untuk modal tambah supplier manual
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [manualSupplier, setManualSupplier] = useState({
        name: "",
        address: "",
        phone: "",
    });
    // State lokal untuk dropdown supplier
    const [suppliersState, setSuppliersState] = useState(suppliers);

    // State untuk modal tambah gudang manual
    const [showGudangModal, setShowGudangModal] = useState(false);
    const [manualGudang, setManualGudang] = useState({
        name: "",
        address: "",
        phone: "",
    });
    // State lokal untuk dropdown gudang
    const [warehousesState, setWarehousesState] = useState(warehouses);

    // Handler perubahan item
    const handleItemChange = (idx, field, value) => {
        const items = [...data.items];
        items[idx][field] = value;
        setData("items", items);

        // Auto-save draft for the last item (input row)
        if (idx === data.items.length - 1) {
            localStorage.setItem(
                "purchase_draft_item",
                JSON.stringify(items[idx])
            );
        }
    };

    // Tambah item baru
    const addItem = () => {
        const newItems = [...data.items, getEmptyItem()];
        setData("items", newItems);

        // Save completed items (excluding the new input row)
        localStorage.setItem(
            "purchase_items_table",
            JSON.stringify(newItems.slice(0, -1))
        );
        localStorage.removeItem("purchase_draft_item");
    };

    // Hapus item
    const removeItem = (idx) => {
        if (data.items.length <= 1) return; // Keep at least one input row

        const newItems = data.items.filter((_, i) => i !== idx);
        setData("items", newItems);

        // Update localStorage
        localStorage.setItem(
            "purchase_items_table",
            JSON.stringify(newItems.slice(0, -1))
        );
    };

    // Calculate total
    const totalHarga = data.items.slice(0, -1).reduce((sum, item) => {
        const harga = parseFloat(item.harga_pembelian) || 0;
        const qty = parseFloat(item.qty) || 0;
        return sum + harga * qty;
    }, 0);

    // Handler untuk update suppliers state setelah tambah manual
    const onSupplierAdded = (newSupplier) => {
        setSuppliersState((prev) => [...prev, newSupplier]);
        setData("supplier_id", String(newSupplier.id));
        setData("supplier_name", newSupplier.name);
        setData("phone", newSupplier.phone || "");
        setData("address", newSupplier.address || "");
    };

    // Handler untuk update tokos state setelah tambah manual
    const onTokoAdded = (newToko) => {
        setTokos((prev) => [...prev, newToko]);
        setData("toko_id", String(newToko.id));
        setData("toko_name", newToko.name);
        setData("toko_address", newToko.address || newToko.alamat || "");
        setData("toko_phone", newToko.phone || newToko.telp || "");
    };

    // Handler untuk update warehouses state setelah tambah manual
    const onGudangAdded = (newGudang) => {
        setWarehousesState((prev) => [...prev, newGudang]);
        setData("warehouse_id", String(newGudang.id));
        setData("warehouse_name", newGudang.name);
        setData(
            "warehouse_address",
            newGudang.address || newGudang.alamat || ""
        );
        setData("warehouse_phone", newGudang.phone || newGudang.telp || "");
    };

    // Handler untuk update categories state setelah tambah quick
    const onCategoryAdded = (newCategory) => {
        setCategoriesState((prev) => [...prev, newCategory]);
    };

    // Handler untuk update subcategories state setelah tambah quick
    const onSubcategoryAdded = (newSubcategory) => {
        setSubcategoriesState((prev) => [...prev, newSubcategory]);
    };

    // Handler untuk update products state setelah tambah quick
    const onProductAdded = (newProduct) => {
        setProductsState((prev) => [...prev, newProduct]);
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
            .map((item) => ({
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
            }));

        if (itemsValid.length === 0) {
            Swal.fire({
                title: "Peringatan",
                text: "Silakan isi minimal 1 item pembelian yang valid.",
                icon: "warning",
                confirmButtonText: "OK",
            });
            return;
        }

        const payload = {
            invoice_number: data.invoice_number,
            supplier_id: data.supplier_id ? Number(data.supplier_id) : null,
            toko_id: data.toko_id ? Number(data.toko_id) : null,
            warehouse_id: data.warehouse_id ? Number(data.warehouse_id) : null,
            purchase_date: data.purchase_date,
            phone: data.phone || null,
            address: data.address || null,
            items: itemsValid,
            _method: "PUT",
        };

        put(route("purchases.update", purchase.id), {
            onSuccess: () => {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Pembelian berhasil diperbarui!",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    window.location.href = route("purchase-report.index");
                });
            },
            onError: (errors) => {
                console.error("Error updating purchase:", errors);
                Swal.fire({
                    title: "Error!",
                    text: "Terjadi kesalahan saat memperbarui pembelian.",
                    icon: "error",
                    confirmButtonText: "OK",
                });
            },
        });
    };

    return (
        <>
            <Head title="Edit Pembelian" />
            <div className="container p-4 mx-auto space-y-6">
                <BackToDashboard />

                <div className="p-6 bg-white border rounded-lg shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">
                            Edit Pembelian
                        </h1>
                        <div className="text-sm text-gray-500">
                            {currentTime.toLocaleString("id-ID")}
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <PurchaseFormInfo
                            data={data}
                            setData={setData}
                            suppliers={suppliersState}
                            warehouses={warehousesState}
                            tokos={tokos}
                            onOpenSupplierModal={() =>
                                setShowSupplierModal(true)
                            }
                            onOpenTokoModal={() => setShowTokoModal(true)}
                            onOpenGudangModal={() => setShowGudangModal(true)}
                            errors={errors}
                        />

                        <PurchaseItemInput
                            data={data}
                            setData={setData}
                            categories={categoriesState}
                            subcategories={subcategoriesState}
                            products={productsState}
                            units={units}
                            timbanganGlobal={timbanganGlobal}
                            setTimbanganGlobal={setTimbanganGlobal}
                            onOpenProductQuickModal={(initial) => {
                                setProductQuickInitial(initial);
                                setShowProductQuickModal(true);
                            }}
                        />

                        <PurchaseItemsTable
                            data={data}
                            setData={setData}
                            categories={categoriesState}
                            subcategories={subcategoriesState}
                            products={productsState}
                            units={units}
                        />

                        <div className="flex justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => window.history.back()}
                            >
                                Batal
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {processing ? "Memperbarui..." : "Perbarui"}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Modal Components */}
                <TokoManualModal
                    show={showTokoModal}
                    onClose={() => setShowTokoModal(false)}
                    onTokoAdded={onTokoAdded}
                />

                <SupplierManualModal
                    show={showSupplierModal}
                    onClose={() => setShowSupplierModal(false)}
                    onSupplierAdded={onSupplierAdded}
                />

                <GudangManualModal
                    show={showGudangModal}
                    onClose={() => setShowGudangModal(false)}
                    onGudangAdded={onGudangAdded}
                />

                <ProductQuickModal
                    show={showProductQuickModal}
                    onClose={() => setShowProductQuickModal(false)}
                    onProductAdded={onProductAdded}
                    onCategoryAdded={onCategoryAdded}
                    onSubcategoryAdded={onSubcategoryAdded}
                    categories={categoriesState}
                    subcategories={subcategoriesState}
                    units={units}
                    initialData={productQuickInitial}
                />
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout>{page}</DashboardLayout>;
