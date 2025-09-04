// Helper addToCart untuk transaksi
export const addToCart = ({
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
    toast,
}) => {
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
                        }
                        : item
                )
            );
            toast.success(`Berhasil menambah ${newQuantity} ${selectedUnit.name} ${selectedProduct.name}`);
        } else {
            setCart([
                ...cart,
                {
                    id: selectedProduct.id,
                    name: selectedProduct.name,
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
};
