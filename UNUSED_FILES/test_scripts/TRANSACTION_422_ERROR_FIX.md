# Fix Error 422 Transaction Store - Dokumentasi

## Problem yang Ditemukan

Error 422 (Unprocessable Content) terjadi karena ada perbedaan nama field antara frontend dan backend validation.

## Root Cause Analysis

### Frontend mengirim field:

```javascript
{
    // ... other fields
    use_change_as_deposit: useChangeAsDeposit,
    deposit_amount: finalDepositAmount,
    notes: notes,
}
```

### Backend validation mengharapkan:

```php
$validated = $request->validate([
    // ... other validations
    'add_change_to_deposit' => 'nullable|boolean',
    'change_to_deposit_amount' => 'nullable|numeric|min:0',
    // notes field tidak ada dalam validasi
]);
```

## Perbaikan yang Dilakukan

### 1. Sesuaikan Field Names

**Sebelum:**

```javascript
use_change_as_deposit: useChangeAsDeposit,
deposit_amount: finalDepositAmount,
```

**Sesudah:**

```javascript
add_change_to_deposit: useChangeAsDeposit,
change_to_deposit_amount: finalDepositAmount,
```

### 2. Hapus Field yang Tidak Divalidasi

**Dihapus:**

```javascript
notes: notes,  // Field ini tidak ada dalam backend validation
```

### 3. Tambahkan Field yang Duplikat Sesuai Validation

**Ditambahkan:**

```javascript
deposit_amount: finalDepositAmount,        // Untuk is_deposit logic
change_to_deposit_amount: finalDepositAmount, // Untuk validation
```

### 4. Improve Error Handling

**Sebelum:**

```javascript
catch (error) {
    toast.error("Terjadi kesalahan saat memproses transaksi");
    console.error(error);
}
```

**Sesudah:**

```javascript
catch (error) {
    console.error("Transaction error:", error);
    console.error("Error response:", error.response?.data);

    if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
            const errorMessages = Object.values(errors).flat().join(', ');
            toast.error(`Validasi gagal: ${errorMessages}`);
        } else {
            toast.error("Data tidak valid. Periksa kembali form Anda.");
        }
    } else {
        toast.error("Terjadi kesalahan saat memproses transaksi");
    }
}
```

## Field Mapping Reference

| Frontend State       | Frontend Send              | Backend Validation         |
| -------------------- | -------------------------- | -------------------------- |
| `useChangeAsDeposit` | `add_change_to_deposit`    | `add_change_to_deposit`    |
| `finalDepositAmount` | `deposit_amount`           | `deposit_amount`           |
| `finalDepositAmount` | `change_to_deposit_amount` | `change_to_deposit_amount` |
| `notes`              | ~~`notes`~~                | ❌ Not validated           |

## Final Request Structure

```javascript
{
    warehouse_id: selectedWarehouse,
    customer_id: selectedCustomer,
    cash: cashAmount,
    change: finalChange,
    deposit_amount: finalDepositAmount,
    add_change_to_deposit: useChangeAsDeposit,
    change_to_deposit_amount: finalDepositAmount,
    discount: discountAmount,
    grand_total: grandTotal,
    payment_method: "cash",
    is_tempo: false,
    is_deposit: finalDepositAmount > 0,
    items: items,
}
```

## Testing Steps

1. **Normal Transaction** (tanpa deposit)

    - Pastikan field `add_change_to_deposit: false`
    - Pastikan field `change_to_deposit_amount: 0`

2. **Transaction dengan Deposit**

    - Pastikan field `add_change_to_deposit: true`
    - Pastikan field `change_to_deposit_amount` > 0
    - Pastikan field `deposit_amount` sesuai

3. **Error Handling Test**
    - Jika validation error, pesan error yang spesifik akan ditampilkan
    - Console akan menampilkan detail error untuk debugging

## Expected Result

-   ✅ Error 422 teratasi
-   ✅ Transaction berhasil di-store
-   ✅ Deposit functionality bekerja sesuai harapan
-   ✅ Better error messaging untuk debugging

## Files Modified

-   `resources/js/Pages/Dashboard/Transactions/IndexShadcn.jsx`
    -   Fixed field names mapping
    -   Removed unsupported fields
    -   Enhanced error handling

## Status

✅ **FIXED**: Error 422 resolved with proper field mapping and enhanced error handling
