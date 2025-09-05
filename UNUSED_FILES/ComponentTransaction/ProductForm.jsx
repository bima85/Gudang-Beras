import React from "react";
import Input from "@/Components/Dashboard/Input";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Button from "@/Components/Dashboard/Button";
import { IconShoppingCartPlus, IconMinus, IconPlus } from "@tabler/icons-react";
import { toast } from "react-toastify";

export default function ProductForm({
    selectedCustomer,
    setSelectedCustomer,
    selectedProduct,
    setSelectedProduct,
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    selectedUnit,
    setSelectedUnit,
    quantity,
    setQuantity,
    addToCart,
    customers,
    products,
    categories,
    subcategories,
    units,
}) {
    const [isManualQty, setIsManualQty] = React.useState(false);
    const [qtyWarning, setQtyWarning] = React.useState("");
    const [showManualQtyPrompt, setShowManualQtyPrompt] = React.useState(false);

    // Default qty 50
    React.useEffect(() => {
        if (typeof quantity === "undefined" || quantity < 50) {
            setQuantity(50);
        }
    }, []);

    // Validasi qty kelipatan 50
    const checkQtyMultiple = (value) => {
        let qtyInt = parseInt(value) || 0;
        if (!isManualQty && qtyInt < 50) {
            setQtyWarning("Qty minimal 50. Jika ingin isi manual, klik 'Iya'.");
            setShowManualQtyPrompt(true);
            qtyInt = 50;
        } else if (!isManualQty && qtyInt % 50 !== 0) {
            setQtyWarning("Qty harus kelipatan 50. Ingin isi manual?");
            setShowManualQtyPrompt(true);
        } else {
            setQtyWarning("");
            setShowManualQtyPrompt(false);
        }
        setQuantity(qtyInt);
    };

    const handleManualQtyConfirm = (confirm) => {
        setShowManualQtyPrompt(false);
        if (confirm) {
            setIsManualQty(true);
            setQtyWarning("");
        } else {
            setIsManualQty(false);
            setQtyWarning("");
            setQuantity(Math.max(50, Math.round(quantity / 50) * 50));
        }
    };
    const [filteredSubcategories, setFilteredSubcategories] = React.useState(
        []
    );
    const [filteredProducts, setFilteredProducts] = React.useState(products);

    // Filter subcategories when category changes
    React.useEffect(() => {
        if (selectedCategory) {
            const filtered = subcategories.filter(
                (sub) => sub.category_id === selectedCategory.id
            );
            setFilteredSubcategories(filtered);
            setSelectedSubcategory(null); // Reset subcategory selection
        } else {
            setFilteredSubcategories([]);
        }
        // Jangan reset selectedProduct di sini
    }, [selectedCategory]);

    // Filter products when category or subcategory changes
    React.useEffect(() => {
        let filtered = products;
        if (selectedCategory) {
            filtered = filtered.filter(
                (product) => product.category_id === selectedCategory.id
            );
        }
        if (selectedSubcategory) {
            filtered = filtered.filter(
                (product) => product.subcategory_id === selectedSubcategory.id
            );
        }
        setFilteredProducts(filtered);
    }, [selectedCategory, selectedSubcategory]);
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Add Products</h2>
            <InputSelect
                label="Customer"
                data={customers}
                selected={selectedCustomer}
                setSelected={setSelectedCustomer}
                displayKey="name"
                placeholder="Select Customer"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <InputSelect
                        label="Kategori"
                        data={categories}
                        selected={selectedCategory}
                        setSelected={setSelectedCategory}
                        displayKey="name"
                        placeholder="Pilih Kategori"
                    />
                </div>

                <div>
                    <InputSelect
                        label="Subkategori"
                        data={filteredSubcategories}
                        selected={selectedSubcategory}
                        setSelected={setSelectedSubcategory}
                        displayKey="name"
                        placeholder="Pilih Subkategori"
                        disabled={!selectedCategory}
                    />
                </div>
                <div className="mt-2 sm:mt-0">
                    <InputSelect
                        label="Product"
                        data={filteredProducts}
                        selected={selectedProduct}
                        setSelected={(product) => {
                            if (product) {
                                // Buat salinan agar harga bisa diedit
                                setSelectedProduct({ ...product });
                                setSelectedUnit(product.unit);
                            } else {
                                setSelectedProduct(null);
                            }
                        }}
                        displayKey="name"
                        placeholder="Pilih Produk"
                    />
                </div>
                <div className="sm:col-span-2">
                    <div className="flex items-center gap-2">
                        {/* <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Qty
                        </label> */}
                        <div className="flex items-center gap-3">
                            <label htmlFor="quantity">Quantity</label>
                            <Button
                                type="button"
                                icon={<IconMinus size={18} />}
                                className={`p-2 rounded-lg transition-colors duration-200 ${
                                    quantity <= 50
                                        ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                                        : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500"
                                }`}
                                onClick={() => {
                                    const newQty = quantity - 50;
                                    checkQtyMultiple(newQty);
                                }}
                                disabled={quantity <= 50}
                            />
                            <input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                    checkQtyMultiple(e.target.value)
                                }
                                min={1}
                                className="w-28 text-center font-semibold text-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-2 focus:ring-2 focus:ring-teal-500"
                                style={{ appearance: "textfield" }}
                            />
                            <Button
                                type="button"
                                icon={<IconPlus size={18} />}
                                className="p-2 rounded-lg bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-500 transition-colors duration-200"
                                onClick={() => {
                                    const newQty = quantity + 50;
                                    checkQtyMultiple(newQty);
                                }}
                            />
                        </div>
                    </div>

                    {qtyWarning && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                            <small className="text-red-600 dark:text-red-400 text-xs">
                                {qtyWarning}
                            </small>
                            {showManualQtyPrompt && (
                                <div className="flex gap-2 mt-2">
                                    <Button
                                        type="button"
                                        label="Iya"
                                        className="py-1 px-3 text-xs bg-teal-500 hover:bg-teal-600 transition-colors duration-200"
                                        onClick={() =>
                                            handleManualQtyConfirm(true)
                                        }
                                    />
                                    <Button
                                        type="button"
                                        label="Tidak"
                                        className="py-1 px-3 bg-red-500 hover:bg-red-600 text-xs transition-colors duration-200"
                                        onClick={() =>
                                            handleManualQtyConfirm(false)
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <InputSelect
                        label="Satuan"
                        data={units}
                        selected={selectedUnit}
                        setSelected={setSelectedUnit}
                        displayKey="name"
                        placeholder="Pilih Satuan"
                        disabled={!selectedProduct}
                    />
                </div>

                <div>
                    <Input
                        type="number"
                        label="Harga Satuan"
                        value={
                            selectedProduct &&
                            typeof selectedProduct.price !== "undefined" &&
                            selectedProduct.price !== null
                                ? String(selectedProduct.price)
                                : "0"
                        }
                        onChange={(e) =>
                            setSelectedProduct(
                                selectedProduct
                                    ? {
                                          ...selectedProduct,
                                          price: Number(e.target.value),
                                      }
                                    : null
                            )
                        }
                        min="0"
                        className="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Total
                    </label>
                    <input
                        type="text"
                        value={
                            selectedProduct
                                ? new Intl.NumberFormat("id-ID").format(
                                      selectedProduct.price * quantity
                                  )
                                : ""
                        }
                        readOnly
                        className="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md"
                    />
                </div>
            </div>

            <div className="flex justify-end mt-4">
                <Button
                    onClick={addToCart}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg shadow flex items-center gap-2 text-base transition-all duration-200"
                    type="button"
                    label="Tambah ke Keranjang"
                    icon={<IconShoppingCartPlus className="w-5 h-5" />}
                    style={{ minWidth: "180px" }}
                />
            </div>
        </div>
    );
}
