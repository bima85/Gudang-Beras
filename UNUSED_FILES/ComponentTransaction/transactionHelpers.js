// Helper untuk transaksi: addToCart, removeFromCart, handleSubmit
import { toast } from "react-toastify";
import axios from "axios";

export function addToCartHelper({
    transactionInfo,
    selectedProduct,
    selectedCategory,
    selectedSubcategory,
    selectedUnit,
    quantity,
    cart,
    setCart,
    setQuantity,
    setSelectedProduct,
    setSelectedUnit,
}) {
    try {
        if (!transactionInfo.customer?.id) {
            toast.error("Silakan pilih pelanggan terlebih dahulu");
            return;
        }
        if (!selectedProduct?.id) {
            toast.error("Silakan pilih produk");
            return;
        }
        if (!selectedCategory) {
            toast.error("Silakan pilih kategori produk");
            return;
        }
        if (!selectedSubcategory) {
            toast.error("Silakan pilih subkategori produk");
            return;
        }
        if (!selectedUnit?.id) {
            toast.error("Silakan pilih satuan");
            return;
        }
        if (!quantity || quantity < 1) {
            toast.error("Jumlah harus lebih dari 0");
            return;
        }
        const newQuantity = parseInt(quantity);
        const existingItem = cart.find((item) => item.id === selectedProduct.id);
        if (existingItem) {
            setCart(
                cart.map((item) =>
                    item.id === selectedProduct.id
                        ? {
                            ...item,
                            quantity: item.quantity + newQuantity,
                            unit: selectedUnit,
                            product: selectedProduct,
                        }
                        : item
                )
            );
            toast.success(
                `Berhasil menambah ${newQuantity} ${selectedUnit.name} ${selectedProduct.name}`
            );
        } else {
            setCart([
                ...cart,
                {
                    id: selectedProduct.id,
                    product: selectedProduct,
                    price: selectedProduct.price,
                    quantity: newQuantity,
                    category: selectedCategory,
                    subcategory: selectedSubcategory,
                    unit: selectedUnit,
                },
            ]);
            toast.success(`Berhasil menambah ${selectedProduct.name} ke keranjang`);
        }
        setQuantity(1);
        setSelectedProduct(null);
        setSelectedUnit(null);
    } catch (error) {
        console.error("Error adding to cart:", error);
        toast.error("Terjadi kesalahan saat menambahkan ke keranjang");
    }
}

export function removeFromCartHelper(productId, cart, setCart) {
    setCart(cart.filter((item) => item.id !== productId));
}

export function handleSubmitHelper({
    e,
    transactionInfo,
    cart,
    isDeposit,
    depositAmount,
    grandTotal,
    setProcessing,
    setCart,
    setTransactionInfo,
    setIsDeposit,

    setDepositAmount,
    setSelectedUnit,
    setSelectedCategory,
    setSelectedSubcategory,
}) {
    console.log("handleSubmitHelper called", { transactionInfo, cart, isDeposit, depositAmount, grandTotal });
    e.preventDefault();
    if (!transactionInfo.transactionDate) {
        console.log("Validasi gagal: Tanggal transaksi harus diisi");
        toast.error("Tanggal transaksi harus diisi");
        return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(transactionInfo.transactionDate);
    if (selectedDate > today) {
        toast.error("Tanggal transaksi tidak boleh lebih dari hari ini");
        return;
    }
    if (!transactionInfo.invoice) {
        console.log("Validasi gagal: Nomor invoice harus diisi");
        toast.error("Nomor invoice harus diisi");
        return;
    }
    if (!transactionInfo.invoiceNumber || transactionInfo.invoiceNumber.length !== 3) {
        console.log("Validasi gagal: Nomor urut invoice harus 3 digit");
        toast.error("Nomor urut invoice harus 3 digit");
        return;
    }
    if (!transactionInfo.customer) {
        console.log("Validasi gagal: Pilih pelanggan terlebih dahulu");
        toast.error("Pilih pelanggan terlebih dahulu");
        return;
    }
    if (cart.length === 0) {
        console.log("Validasi gagal: Keranjang belanja masih kosong");
        toast.error("Keranjang belanja masih kosong");
        return;
    }
    const totalPayment = transactionInfo.paymentAmount + (isDeposit ? depositAmount : 0);
    if (transactionInfo.paymentMethod === "cash" && totalPayment < grandTotal) {
        console.log("Validasi gagal: Total pembayaran kurang dari total belanja");
        toast.error("Total pembayaran kurang dari total belanja");
        return;
    }
    if (transactionInfo.paymentMethod === "tempo" && !transactionInfo.tempoDueDate) {
        console.log("Validasi gagal: Tanggal jatuh tempo harus diisi");
        toast.error("Tanggal jatuh tempo harus diisi");
        return;
    }
    if (isDeposit) {
        if (!depositAmount || depositAmount <= 0) {
            console.log("Validasi gagal: Nominal deposit harus diisi");
            toast.error("Nominal deposit harus diisi");
            return;
        }
        if (depositAmount > (transactionInfo.customer.deposit || 0)) {
            console.log("Validasi gagal: Nominal deposit melebihi saldo deposit pelanggan");
            toast.error("Nominal deposit melebihi saldo deposit pelanggan");
            return;
        }
    }
    setProcessing(true);
    const data = {
        customer_id: transactionInfo.customer?.id,
        invoice: transactionInfo.invoice,
        transaction_date: transactionInfo.transactionDate,
        payment_method: transactionInfo.paymentMethod,
        is_tempo: transactionInfo.paymentMethod === "tempo" ? 1 : 0,
        tempo_due_date: transactionInfo.tempoDueDate,
        cash: transactionInfo.paymentAmount,
        change: transactionInfo.addChangeToDeposit ? 0 : transactionInfo.change,
        discount: transactionInfo.discount,
        grand_total: transactionInfo.grandTotal,
        is_deposit: isDeposit ? 1 : 0,
        deposit_amount: depositAmount,
        add_change_to_deposit: transactionInfo.addChangeToDeposit ? 1 : 0,
        warehouse_id: transactionInfo.warehouse?.id || null,
        items: cart.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            unit_id: item.unit.id,
        })),
    };
    console.log("Mengirim request transaksi ke backend:", data);
    axios
        .post("/dashboard/transactions/store", data, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
        .then((response) => {
            console.log("Response transaksi:", response);
            toast.success("Transaksi berhasil disimpan");
            setCart([]);
            setTransactionInfo({
                transactionDate: "",
                invoiceNumber: "",
                invoice: "",
                customer: null,
                paymentMethod: "cash",
                paymentAmount: 0,
                change: 0,
                discount: 0,
                grandTotal: 0,
                tempoDueDate: "",
                addChangeToDeposit: false,
            });
            setIsDeposit(false);
            setDepositAmount(0);
            setSelectedUnit(null);
            setSelectedCategory(null);
            setSelectedSubcategory(null);
            // Try to resolve an invoice or id to print. Prefer invoice string if provided by backend.
            const invoiceToPrint =
                response.data?.transaction_invoice ||
                response.data?.transaction?.invoice ||
                response.data?.invoice ||
                response.data?.transaction_id ||
                response.data?.id ||
                null;
            if (invoiceToPrint) {
                console.log("Print window open for:", invoiceToPrint);
                window.open(route("transactions.print", invoiceToPrint), "_blank");
            } else {
                console.warn("No invoice/id in response, cannot print.", response.data);
            }
        })
        .catch((error) => {
            console.error("Error transaksi:", error);
            toast.error(
                error.response?.data?.message ||
                "Terjadi kesalahan saat menyimpan transaksi"
            );
        })
        .finally(() => {
            setProcessing(false);
        });
}

