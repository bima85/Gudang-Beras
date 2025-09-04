# 📦 DOKUMENTASI SISTEM STOK TERBARU

## 🎯 **Overview**

Sistem stok telah diperbarui untuk memastikan:

1. **Pembelian** → Stok otomatis terdistribusi 50%-50% ke gudang dan toko
2. **Penjualan** → Prioritas ambil dari stok toko, otomatis buat surat jalan jika stok toko habis

---

## 🛒 **Sistem Pembelian (Purchase)**

### ✅ **Auto Allocation 50%-50%**

Ketika user membuat pembelian dengan qty **200 unit sak**:

-   **100 unit sak** → Masuk ke **Stok Gudang**
-   **100 unit sak** → Masuk ke **Stok Toko**

### 🔄 **Konversi Otomatis ke Kg**

Semua stok disimpan dalam **kg** menggunakan `UnitConverter`:

```php
// Contoh: 1 sak = 25 kg
100 sak × 25 kg/sak = 2,500 kg
```

### 📋 **Implementasi di PurchaseController**

```php
// Default alokasi 50%-50%
$qtyGudang = round($totalQty * 0.5, 2);
$qtyToko = round($totalQty * 0.5, 2);

// Update stok menggunakan StockUpdateService
StockUpdateService::updateStockAfterPurchase(
    $productId,
    $distribution,
    $warehouseId,
    $tokoId,
    $userId
);
```

---

## 🛍️ **Sistem Penjualan (Sales)**

### 🏪 **Prioritas Stok Toko**

1. **Cek stok toko** terlebih dahulu
2. Jika **stok toko cukup** → Langsung kurangi dari stok toko
3. Jika **stok toko tidak cukup** → Lanjut ke langkah berikutnya

### 📦 **Auto Delivery Note**

Ketika stok toko tidak mencukupi:

1. **Kurangi semua stok toko** yang tersedia
2. **Cek stok gudang** untuk kekurangan
3. **Buat surat jalan otomatis** untuk transfer dari gudang ke toko
4. **Kurangi stok gudang** sesuai kekurangan

### ⚠️ **Warning System**

Frontend akan menampilkan peringatan:

```html
⚠️ PERINGATAN: Stok toko tidak mencukupi, surat jalan otomatis telah dibuat
untuk mengambil barang dari gudang.
```

### 🚫 **Stok Tidak Cukup**

Jika total stok (toko + gudang) tidak mencukupi:

-   **Transaction ditolak**
-   **Error message** yang jelas
-   **Tidak ada perubahan stok**

---

## 🗂️ **Model Database**

### 📊 **WarehouseStock Table**

```sql
warehouse_stocks:
- product_id (FK)
- warehouse_id (FK)
- qty_in_kg (decimal 15,2)
```

### 🏪 **StoreStock Table**

```sql
store_stocks:
- product_id (FK)
- toko_id (FK)
- qty_in_kg (decimal 15,2)
```

### 🚚 **DeliveryNote Table**

```sql
delivery_notes:
- delivery_number (unique)
- transaction_id (FK)
- product_id (FK)
- warehouse_id (FK)
- toko_id (FK)
- qty_transferred (original unit)
- unit (unit symbol)
- qty_kg (converted to kg)
- status (pending/completed)
- notes
```

---

## 🎮 **User Experience**

### 📥 **Saat Pembelian**

1. User input qty total (misal: 200 sak)
2. Sistem otomatis split 50%-50%
3. **Success message**: "Pembelian berhasil. Stok terdistribusi ke gudang dan toko."

### 📤 **Saat Penjualan**

**Scenario 1 - Stok Toko Cukup:**

-   ✅ Transaksi langsung berhasil
-   No additional warnings

**Scenario 2 - Stok Toko Tidak Cukup:**

-   ⚠️ **Warning popup** muncul di frontend
-   ✅ Transaksi tetap berhasil
-   📄 Surat jalan otomatis dibuat
-   🔄 Stok otomatis diambil dari gudang

**Scenario 3 - Stok Total Tidak Cukup:**

-   ❌ **Error message** dengan detail stok yang tersedia
-   🚫 Transaksi dibatalkan

---

## 🔧 **Technical Implementation**

### 🏗️ **StockUpdateService**

```php
// Pembelian
StockUpdateService::updateStockAfterPurchase($productId, $distribution, $warehouseId, $tokoId, $userId);

// Penjualan
StockUpdateService::updateStockAfterSale($productId, $qtyNeeded, $unit, $tokoId, $warehouseId, $saleId, $userId);
```

### 🔄 **UnitConverter Helper**

```php
// Convert TO kg
UnitConverter::toKg($qty, $unit);

// Convert FROM kg
UnitConverter::fromKg($qtyKg, $unit);
```

### 🎯 **ProductController API**

```php
// Return stock info dengan field descriptive
return response()->json([
    'product' => $product,
    'available_qty' => $finalStock,      // Total yang bisa dijual
    'warehouse_stock_kg' => $warehouseStockKg,
    'store_stock_kg' => $storeStockKg,
    'total_stock_kg' => $totalStockKg
]);
```

---

## ✅ **Benefits**

1. **🎯 Otomatis** - Tidak perlu manual input alokasi
2. **🔄 Konsisten** - Semua dalam kg, konversi otomatis
3. **⚠️ Transparent** - Warning jelas saat stok toko habis
4. **📄 Audit Trail** - Delivery note untuk tracking transfer
5. **🚫 Safe** - Tidak bisa oversell, validasi ketat
6. **📱 User Friendly** - Interface tetap sederhana

---

## 🏁 **Status: COMPLETED ✅**

Sistem stok telah berhasil diimplementasikan dengan:

-   ✅ Purchase auto-allocation 50%-50%
-   ✅ Sales priority dari stok toko
-   ✅ Auto delivery note generation
-   ✅ Frontend warning system
-   ✅ Complete error handling
-   ✅ Database consistency
