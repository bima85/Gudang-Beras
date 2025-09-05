# Fitur Deposit dari Kembalian - Dokumentasi

## Overview

Fitur ini memungkinkan pelanggan untuk mengubah kembalian transaksi menjadi deposit yang dapat digunakan untuk transaksi di masa depan.

## Fitur yang Ditambahkan

### 1. UI Components

-   **Checkbox untuk aktifkan deposit**: Muncul ketika ada kembalian positif
-   **Input manual jumlah deposit**: Opsional, jika kosong maka seluruh kembalian akan menjadi deposit
-   **Real-time calculation**: Menampilkan pembagian antara deposit dan kembalian yang diterima

### 2. State Management

```jsx
// State baru yang ditambahkan
const [useChangeAsDeposit, setUseChangeAsDeposit] = useState(false);
const [depositAmount, setDepositAmount] = useState("");
```

### 3. Business Logic

#### Calculation Logic

```jsx
// Jika deposit diaktifkan dan ada kembalian
if (useChangeAsDeposit && change > 0) {
    const depositToAdd = parseFloat(depositAmount) || change;
    finalDepositAmount = Math.min(depositToAdd, change);
    finalChange = change - finalDepositAmount;
}
```

#### Data yang Dikirim ke Backend

```jsx
{
    // ... data lainnya
    change: finalChange,
    deposit_amount: finalDepositAmount,
    use_change_as_deposit: useChangeAsDeposit,
    is_deposit: finalDepositAmount > 0,
}
```

## User Experience Flow

### 1. Kondisi Normal (Tanpa Deposit)

-   Pelanggan melakukan transaksi
-   Ada kembalian positif
-   Kembalian ditampilkan sebagai biasa

### 2. Dengan Fitur Deposit

-   Pelanggan melakukan transaksi
-   Ada kembalian positif
-   Muncul opsi checkbox "Masukkan kembalian ke deposit"
-   Jika dicentang:
    -   Muncul input untuk jumlah deposit manual
    -   Jika input kosong → seluruh kembalian menjadi deposit
    -   Jika input diisi → jumlah tersebut menjadi deposit (max sesuai kembalian)
    -   Real-time update menampilkan pembagian deposit vs kembalian

### 3. Display Information

```
Deposit yang akan disimpan: Rp 15.000
Kembalian yang diterima: Rp 5.000
```

## Technical Implementation

### Frontend Changes

#### IndexShadcn.jsx

-   Tambah state `useChangeAsDeposit` dan `depositAmount`
-   Update `processTransaction` function untuk handle deposit logic
-   Pass props baru ke `PaymentSection`
-   Clear deposit states saat reset form

#### PaymentSection.jsx

-   Import `Checkbox` component
-   Tambah props untuk deposit handling
-   Tambah `handleDepositAmountChange` function
-   Update calculation logic untuk split change/deposit
-   Tambah UI section untuk deposit option dengan conditional rendering

### Backend Requirements

Controller harus siap menerima parameter baru:

-   `deposit_amount`: Jumlah yang akan disimpan sebagai deposit
-   `use_change_as_deposit`: Boolean flag
-   `is_deposit`: Boolean untuk marking transaksi sebagai deposit transaction

## Validation Rules

### Frontend Validation

1. **Deposit amount tidak boleh melebihi kembalian**

    ```jsx
    finalDepositAmount = Math.min(depositToAdd, change);
    ```

2. **Input hanya angka**

    ```jsx
    const value = e.target.value.replace(/[^0-9]/g, "");
    ```

3. **Deposit option hanya muncul jika ada kembalian positif**
    ```jsx
    {change > 0 && (
        // Deposit UI
    )}
    ```

## Keamanan dan Error Handling

### 1. Safe Number Processing

-   Semua input di-parse dengan fallback ke 0
-   Menggunakan `Math.min()` untuk memastikan deposit tidak melebihi kembalian

### 2. UI State Management

-   Reset semua deposit states saat clear form
-   Conditional rendering untuk mencegah error display

### 3. Backend Integration

-   Data terstruktur dengan clear flag `use_change_as_deposit`
-   Explicit `is_deposit` flag untuk database marking

## Testing Scenarios

### 1. Normal Transaction (No Deposit)

-   Total: Rp 100.000
-   Cash: Rp 150.000
-   Change: Rp 50.000
-   Deposit checkbox: Unchecked
-   Result: Change = Rp 50.000, Deposit = Rp 0

### 2. Full Change to Deposit

-   Total: Rp 100.000
-   Cash: Rp 150.000
-   Change: Rp 50.000
-   Deposit checkbox: Checked
-   Deposit amount: (empty)
-   Result: Change = Rp 0, Deposit = Rp 50.000

### 3. Partial Change to Deposit

-   Total: Rp 100.000
-   Cash: Rp 150.000
-   Change: Rp 50.000
-   Deposit checkbox: Checked
-   Deposit amount: Rp 30.000
-   Result: Change = Rp 20.000, Deposit = Rp 30.000

### 4. Deposit Amount Exceeds Change

-   Total: Rp 100.000
-   Cash: Rp 150.000
-   Change: Rp 50.000
-   Deposit checkbox: Checked
-   Deposit amount: Rp 70.000
-   Result: Change = Rp 0, Deposit = Rp 50.000 (capped)

## Future Enhancements

1. **Integration dengan Customer Deposit Balance**

    - Tampilkan current deposit balance
    - Update balance setelah transaksi

2. **Deposit History**

    - Track deposit transactions
    - Show deposit usage history

3. **Minimum Deposit Amount**

    - Set minimum amount untuk deposit
    - Validation di frontend dan backend

4. **Deposit Expiry**
    - Optional expiry date untuk deposit
    - Auto-cleanup expired deposits

## Files Modified

1. `resources/js/Pages/Dashboard/Transactions/IndexShadcn.jsx`

    - Added deposit state management
    - Updated processTransaction logic
    - Added props passing

2. `resources/js/Pages/Dashboard/Transactions/components/PaymentSection.jsx`
    - Added deposit UI components
    - Updated calculation logic
    - Added deposit handling functions

## Status

✅ **IMPLEMENTED**: Frontend deposit functionality with UI and calculations
🔄 **PENDING**: Backend integration untuk menyimpan deposit ke database
📝 **DOCUMENTED**: Complete feature documentation dengan testing scenarios
