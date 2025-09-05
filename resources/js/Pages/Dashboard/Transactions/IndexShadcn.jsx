import React, { useState, useEffect } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Alert, AlertDescription } from "@/Components/ui/alert";
import BackToDashboard from "@/Components/Dashboard/BackToDashboard";
import { toast } from "sonner";
import Swal from "sweetalert2";
import axios from "axios";
import { cn } from "@/lib/utils";
import { ShoppingCart, AlertTriangle, CheckCircle } from "lucide-react";

// Import komponen Shadcn UI yang telah dibuat
import ProductForm from "./components/ProductForm";
import CartTable from "./components/CartTable";
import PaymentSection from "./components/PaymentSection";
import CustomerModal from "./components/CustomerModal";
import TransactionInfo from "./components/TransactionInfo";

export default function IndexShadcn() {
    const page = usePage();
    const {
        auth,
        warehouses,
        categories,
        subcategories,
        products: productsProp,
        units,
        customers,
        carts,
        carts_total,
        flash,
        tokos,
    } = page.props;

    // Flash message handling
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            Swal.fire({
                title: "Perhatian",
                html: flash.error,
                icon: "warning",
                confirmButtonText: "OK",
            });
        }
    }, [flash]);

    const isUserToko = (page.props.location || "")
        .toString()
        .toLowerCase()
        .includes("toko");

    // State management
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [isProcessingTransaction, setIsProcessingTransaction] =
        useState(false);
    const [product, setProduct] = useState({});
    const [stokToko, setStokToko] = useState(null);
    const [pakaiStokToko, setPakaiStokToko] = useState(false);
    const [barcode, setBarcode] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedToko, setSelectedToko] = useState(null);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cash, setCash] = useState("");
    const [discount, setDiscount] = useState("");
    const [notes, setNotes] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [useSuratJalan, setUseSuratJalan] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState(null);
    const [qty, setQty] = useState("");

    // Deposit states
    const [useChangeAsDeposit, setUseChangeAsDeposit] = useState(false);
    const [depositAmount, setDepositAmount] = useState("");

    // Transaction number states
    const [transactionNumber, setTransactionNumber] = useState("");
    const [transactionSequence, setTransactionSequence] = useState("001");

    // Customer modal states
    const [showCustomerModal, setShowCustomerModal] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [newCustomerPhone, setNewCustomerPhone] = useState("");
    const [newCustomerAddress, setNewCustomerAddress] = useState("");

    // Generate transaction number function
    const generateTransactionNumber = (sequence = "001") => {
        const today = new Date();
        const day = today.getDate().toString().padStart(2, "0");
        const month = (today.getMonth() + 1).toString().padStart(2, "0");
        const year = today.getFullYear();
        return `TRX-${day}/${month}/${year}-${sequence}`;
    };

    // Auto-generate transaction number on component mount
    useEffect(() => {
        const generatedNumber = generateTransactionNumber(transactionSequence);
        setTransactionNumber(generatedNumber);
    }, [transactionSequence]);

    // Auto-select warehouse and toko to defaults (fixed)
    useEffect(() => {
        // If no warehouse selected yet, pick the first available as default
        if (warehouses && warehouses.length > 0 && !selectedWarehouse) {
            setSelectedWarehouse(warehouses[0].id);
        }

        // If no toko selected yet, pick the first available as default
        if (tokos && tokos.length > 0 && !selectedToko) {
            setSelectedToko(tokos[0]);
        }
    }, [warehouses, tokos, selectedWarehouse, selectedToko]);

    // Load saved data from localStorage
    useEffect(() => {
        const savedCash = localStorage.getItem("cash");
        const savedDiscount = localStorage.getItem("discount");
        if (savedCash) setCash(savedCash);
        if (savedDiscount) setDiscount(savedDiscount);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (cash) localStorage.setItem("cash", cash);
        if (discount) localStorage.setItem("discount", discount);
    }, [cash, discount]);

    // Filter products based on category and subcategory
    useEffect(() => {
        let filtered = productsProp || [];

        if (selectedCategory) {
            filtered = filtered.filter(
                (product) => product.category_id === selectedCategory
            );
        }

        if (selectedSubcategory) {
            filtered = filtered.filter(
                (product) => product.subcategory_id === selectedSubcategory
            );
        }

        setFilteredProducts(filtered);

        // Reset selected product when filters change
        if (selectedProduct && filtered.length > 0) {
            const stillExists = filtered.find(
                (p) => p.id === selectedProduct.id
            );
            if (!stillExists) {
                setSelectedProduct(null);
                setBarcode("");
                setProduct({});
            }
        }
    }, [selectedCategory, selectedSubcategory, productsProp, selectedProduct]);

    // Auto-fill barcode when product is selected
    useEffect(() => {
        if (selectedProduct && selectedProduct.barcode) {
            setBarcode(selectedProduct.barcode);
            // Auto search the selected product
            searchProduct(selectedProduct.barcode, selectedWarehouse, null);
        }
    }, [selectedProduct]);

    // Search product function
    const searchProduct = async (barcodeValue, warehouseId, unitId) => {
        const searchBarcode = barcodeValue || barcode.trim();
        if (!searchBarcode) return;

        if (!warehouseId && !selectedToko) {
            toast.error("Pilih gudang dan toko terlebih dahulu");
            return;
        }

        setIsLoadingProduct(true);
        try {
            const params = {
                barcode: searchBarcode,
                category_id: selectedCategory,
                subcategory_id: selectedSubcategory,
            };

            if (warehouseId) params.warehouse_id = warehouseId;
            if (selectedToko && selectedToko.id)
                params.toko_id = selectedToko.id;
            if (unitId) params.unit_id = unitId;

            const response = await axios.get(route("products.search"), {
                params,
            });

            if (response.data && response.data.product) {
                // Preserve any user-selected unit
                setProduct((prev) => {
                    const serverProduct = response.data.product || {};
                    return {
                        ...serverProduct,
                        selectedUnit:
                            (prev && prev.selectedUnit) ||
                            serverProduct.selectedUnit ||
                            null,
                    };
                });

                // Handle toko stock data
                const rawTokoPerUnit =
                    response.data && response.data.stok_toko != null
                        ? response.data.stok_toko
                        : null;
                const rawTokoAggregated =
                    response.data && response.data.stok_toko_aggregated != null
                        ? response.data.stok_toko_aggregated
                        : null;

                // Use per-unit stock if available, otherwise use aggregated
                const effectiveTokoStok =
                    rawTokoPerUnit !== null
                        ? rawTokoPerUnit
                        : rawTokoAggregated;
                setStokToko(effectiveTokoStok);

                toast.success("Produk ditemukan");
            } else {
                toast.error("Produk tidak ditemukan");
                setProduct({});
                setStokToko(null);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan saat mencari produk");
            console.error(error);
        } finally {
            setIsLoadingProduct(false);
        }
    };

    // Add to cart function
    const addToCart = async () => {
        if (!product.id) {
            toast.error("Pilih produk terlebih dahulu");
            return;
        }
        if (!selectedWarehouse) {
            toast.error("Pilih gudang terlebih dahulu");
            return;
        }
        if (!sellingPrice || parseFloat(sellingPrice) <= 0) {
            toast.error("Masukkan harga jual yang valid");
            return;
        }
        if (!qty || parseInt(qty) <= 0) {
            toast.error("Masukkan qty yang valid");
            return;
        }

        try {
            const payload = {
                product_id: product.id,
                sell_price: parseFloat(sellingPrice),
                qty: parseInt(qty), // Use qty from state instead of default 1
                unit_id: product.selectedUnit
                    ? product.selectedUnit.id
                    : product.unit_id,
                warehouse_id: selectedWarehouse,
                subcategory_id: selectedSubcategory,
                pakaiStokToko: pakaiStokToko,
                toko_id: selectedToko ? selectedToko.id : null,
                useSuratJalan: useSuratJalan,
            };

            const response = await axios.post(
                route("transactions.addToCart"),
                payload
            );

            if (response.data && response.data.success) {
                toast.success("Produk berhasil ditambahkan ke keranjang");
                setBarcode("");
                setProduct({});
                setStokToko(null);
                setPakaiStokToko(false);
                setSellingPrice("");
                setQty("");
                setUseSuratJalan(false);
                // Refresh page to update cart
                router.reload({ only: ["carts", "carts_total"] });
            } else {
                toast.error(
                    response.data.message || "Gagal menambah ke keranjang"
                );
            }
        } catch (error) {
            const msg = error?.response?.data?.message || "Terjadi kesalahan";
            toast.error(msg);
            console.error(error);
        }
    };

    // Remove from cart function
    const removeFromCart = async (index) => {
        try {
            const response = await axios.delete(
                `/dashboard/transactions/remove-from-cart/${index}`
            );
            // Backend returns { message: "success..." }
            toast.success("Produk dihapus dari keranjang");
            router.reload({ only: ["carts", "carts_total"] });
        } catch (error) {
            toast.error("Gagal menghapus produk");
            console.error(error);
        }
    };

    // Update cart quantity function
    const updateCartQuantity = async (index, quantity) => {
        if (quantity < 1) return;

        try {
            const response = await axios.put(
                `/transactions/update-cart/${index}`,
                {
                    quantity: quantity,
                }
            );
            if (response.data.success) {
                router.reload({ only: ["carts", "carts_total"] });
            }
        } catch (error) {
            toast.error("Gagal mengupdate quantity");
            console.error(error);
        }
    };

    // Process transaction function
    const processTransaction = async () => {
        if (!carts || carts.length === 0) {
            toast.error("Keranjang kosong");
            return;
        }

        // Safe number parsing
        const total = isNaN(parseFloat(carts_total))
            ? 0
            : parseFloat(carts_total);
        const discountAmount = parseFloat(discount) || 0;
        const finalTotal = total - discountAmount;
        const cashAmount = parseFloat(cash) || 0;

        if (cashAmount < finalTotal) {
            toast.error("Uang tunai tidak mencukupi");
            return;
        }

        // Validate customer selection if using deposit
        if (useChangeAsDeposit && !selectedCustomer) {
            toast.error(
                "Pilih pelanggan terlebih dahulu untuk menggunakan fitur deposit"
            );
            return;
        }

        setIsProcessingTransaction(true);
        try {
            // Prepare transaction items from cart
            const items = carts.map((cart) => ({
                product_id: cart.product?.id,
                qty: cart.qty,
                unit_id: cart.unit?.id,
                price: cart.price,
            }));

            // Calculate values
            const grandTotal = isNaN(parseFloat(carts_total))
                ? 0
                : parseFloat(carts_total);
            const change = Math.max(
                0,
                cashAmount - (grandTotal - discountAmount)
            );

            // Handle deposit from change
            let finalDepositAmount = 0;
            let finalChange = change;

            if (useChangeAsDeposit && change > 0) {
                const depositToAdd = parseFloat(depositAmount) || change;
                finalDepositAmount = Math.min(depositToAdd, change);
                finalChange = change - finalDepositAmount;
            }

            const response = await axios.post(
                "/dashboard/transactions/store",
                {
                    warehouse_id: selectedWarehouse,
                    customer_id: selectedCustomer,
                    cash: cashAmount,
                    change: finalChange,
                    discount: discountAmount,
                    grand_total: grandTotal,
                    payment_method: "cash",
                    is_tempo: false,
                    is_deposit: false, // Set false karena ini bukan payment dengan deposit
                    add_change_to_deposit: useChangeAsDeposit,
                    change_to_deposit_amount: finalDepositAmount,
                    print: false, // Prevent auto redirect to print page
                    items: items,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-Requested-With": "XMLHttpRequest",
                        Accept: "application/json",
                    },
                }
            );

            if (response.data.success) {
                toast.success("Transaksi berhasil diproses");

                // Clear form
                setCash("");
                setDiscount("");
                setNotes("");
                setSelectedCustomer(null);
                setUseChangeAsDeposit(false);
                setDepositAmount("");
                localStorage.removeItem("cash");
                localStorage.removeItem("discount");

                // Generate new transaction number for next transaction
                const newSequence = (parseInt(transactionSequence) + 1)
                    .toString()
                    .padStart(3, "0");
                setTransactionSequence(newSequence);

                // Reload only cart data to clear it
                router.reload({ only: ["carts", "carts_total"] });

                // Optional: Open print page in new tab without redirecting current page
                if (response.data.transaction_id) {
                    const shouldPrint = confirm(
                        "Apakah ingin mencetak struk transaksi?"
                    );
                    if (shouldPrint) {
                        window.open(
                            `/transactions/print/${response.data.transaction_id}`,
                            "_blank"
                        );
                    }
                }
            } else {
                toast.error(
                    response.data.message || "Gagal memproses transaksi"
                );
            }
        } catch (error) {
            console.error("Transaction error:", error);
            console.error("Error response:", error.response?.data);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors) {
                    const errorMessages = Object.values(errors)
                        .flat()
                        .join(", ");
                    toast.error(`Validasi gagal: ${errorMessages}`);
                } else {
                    toast.error("Data tidak valid. Periksa kembali form Anda.");
                }
            } else {
                toast.error("Terjadi kesalahan saat memproses transaksi");
            }
        } finally {
            setIsProcessingTransaction(false);
        }
    };

    // Handle add customer
    const handleAddCustomer = async () => {
        // Frontend validation
        if (!newCustomerName.trim()) {
            toast.error("Nama pelanggan harus diisi");
            return;
        }

        if (!newCustomerPhone.trim()) {
            toast.error("Nomor telepon harus diisi");
            return;
        }

        try {
            const response = await axios.post("/dashboard/customers", {
                name: newCustomerName.trim(),
                no_telp: newCustomerPhone.trim(), // Changed from 'phone' to 'no_telp'
                address: newCustomerAddress.trim() || "",
            });

            if (response.data.success) {
                toast.success("Pelanggan berhasil ditambahkan");
                setNewCustomerName("");
                setNewCustomerPhone("");
                setNewCustomerAddress("");
                setShowCustomerModal(false);
                router.reload({ only: ["customers"] });
            }
        } catch (error) {
            console.error("Customer creation error:", error);
            console.error("Error response:", error.response?.data);

            if (error.response?.status === 422) {
                const errors = error.response.data.errors;
                if (errors) {
                    const errorMessages = Object.values(errors)
                        .flat()
                        .join(", ");
                    toast.error(`Validasi gagal: ${errorMessages}`);
                } else {
                    toast.error(
                        "Data pelanggan tidak valid. Periksa kembali form Anda."
                    );
                }
            } else {
                toast.error("Gagal menambahkan pelanggan");
            }
            console.error(error);
        }
    };

    return (
        <DashboardLayout>
            <Head title="Transaksi Penjualan" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Transaksi Penjualan
                        </h1>
                        <p className="text-muted-foreground">
                            Kelola transaksi penjualan dengan mudah dan cepat
                        </p>
                    </div>
                    <BackToDashboard />
                </div>

                {/* Alert for user guidance */}
                {carts && carts.length === 0 && (
                    <Alert>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                            Mulai dengan mencari produk menggunakan barcode atau
                            nama produk, kemudian tambahkan ke keranjang untuk
                            memproses transaksi.
                        </AlertDescription>
                    </Alert>
                )}

                {/* LAYOUT 3 BAGIAN VERTIKAL - TIDAK KESAMPING */}

                {/* BAGIAN 1: Informasi Transaksi */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Informasi Transaksi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Transaction Number Field */}
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-foreground">
                                        No. Transaksi
                                    </label>
                                    <input
                                        type="text"
                                        value={transactionNumber}
                                        readOnly
                                        className="w-full px-3 py-2 text-sm border rounded-md border-input bg-muted"
                                        placeholder="TRX-03/09/2025-001"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-foreground">
                                        No. Urut
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="999"
                                        value={
                                            parseInt(transactionSequence) || ""
                                        }
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "") {
                                                setTransactionSequence("");
                                            } else {
                                                const numValue =
                                                    parseInt(value);
                                                if (
                                                    numValue >= 1 &&
                                                    numValue <= 999
                                                ) {
                                                    setTransactionSequence(
                                                        numValue
                                                            .toString()
                                                            .padStart(3, "0")
                                                    );
                                                }
                                            }
                                        }}
                                        className="w-full px-3 py-2 text-sm border rounded-md border-input bg-background"
                                        placeholder="Masukkan nomor urut (1-999)"
                                    />
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Format akan menjadi:{" "}
                                        {transactionSequence}
                                    </p>
                                </div>
                            </div>

                            {/* Original TransactionInfo Component */}
                            <TransactionInfo
                                selectedWarehouse={selectedWarehouse}
                                warehouses={warehouses}
                                location={page.props.location}
                                auth={auth}
                                transactionNumber={transactionNumber}
                                transactionSequence={transactionSequence}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* BAGIAN 2: Pencarian Produk */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Pencarian Produk
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ProductForm
                            barcode={barcode}
                            setBarcode={setBarcode}
                            product={product}
                            stokToko={stokToko}
                            pakaiStokToko={pakaiStokToko}
                            setPakaiStokToko={setPakaiStokToko}
                            categories={categories}
                            subcategories={subcategories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            setSelectedSubcategory={setSelectedSubcategory}
                            selectedWarehouse={selectedWarehouse}
                            setSelectedWarehouse={setSelectedWarehouse}
                            selectedToko={selectedToko}
                            setSelectedToko={setSelectedToko}
                            selectedProduct={selectedProduct}
                            setSelectedProduct={setSelectedProduct}
                            filteredProducts={filteredProducts}
                            warehouses={warehouses}
                            tokos={tokos}
                            isLoadingProduct={isLoadingProduct}
                            searchProduct={searchProduct}
                            addToCart={addToCart}
                            isUserToko={isUserToko}
                            sellingPrice={sellingPrice}
                            setSellingPrice={setSellingPrice}
                            useSuratJalan={useSuratJalan}
                            setUseSuratJalan={setUseSuratJalan}
                            selectedUnit={selectedUnit}
                            setSelectedUnit={setSelectedUnit}
                            units={units}
                            qty={qty}
                            setQty={setQty}
                        />
                    </CardContent>
                </Card>

                {/* BAGIAN 3: Keranjang Belanja */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5" />
                            Keranjang Belanja
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CartTable
                            carts={carts}
                            carts_total={
                                isNaN(parseFloat(carts_total))
                                    ? 0
                                    : parseFloat(carts_total)
                            }
                            removeFromCart={removeFromCart}
                            updateCartQuantity={updateCartQuantity}
                        />
                    </CardContent>
                </Card>

                {/* BAGIAN 4: Pembayaran & Checkout */}
                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Pembayaran & Checkout
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PaymentSection
                            carts_total={
                                isNaN(parseFloat(carts_total))
                                    ? 0
                                    : parseFloat(carts_total)
                            }
                            cash={cash}
                            setCash={setCash}
                            discount={discount}
                            setDiscount={setDiscount}
                            selectedCustomer={selectedCustomer}
                            setSelectedCustomer={setSelectedCustomer}
                            customers={customers}
                            notes={notes}
                            setNotes={setNotes}
                            useChangeAsDeposit={useChangeAsDeposit}
                            setUseChangeAsDeposit={setUseChangeAsDeposit}
                            depositAmount={depositAmount}
                            setDepositAmount={setDepositAmount}
                            processTransaction={processTransaction}
                            isProcessingTransaction={isProcessingTransaction}
                            openCustomerModal={() => setShowCustomerModal(true)}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Customer Modal */}
            <CustomerModal
                showModal={showCustomerModal}
                setShowModal={setShowCustomerModal}
                customers={customers}
                newCustomerName={newCustomerName}
                setNewCustomerName={setNewCustomerName}
                newCustomerPhone={newCustomerPhone}
                setNewCustomerPhone={setNewCustomerPhone}
                newCustomerAddress={newCustomerAddress}
                setNewCustomerAddress={setNewCustomerAddress}
                handleAddCustomer={handleAddCustomer}
                onSelectCustomer={setSelectedCustomer}
            />
        </DashboardLayout>
    );
}
