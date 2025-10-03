# Invoice Number Berdasarkan Supplier

## Ringkasan Perubahan

Sistem invoice number untuk pembelian (Purchase) telah dimodifikasi untuk menyertakan kode supplier dalam format invoice number.

## Format Invoice Number

### Format Baru

-   **Dengan Supplier**: `PB-[KODE_SUPPLIER]-YYYY/MM/DD-XXX`
    -   Contoh: `PB-BUD-2024/10/03-001` (untuk supplier "Budi Jaya")
    -   Contoh: `PB-SIN-2024/10/03-001` (untuk supplier "Sinar Baru")
-   **Tanpa Supplier**: `PB-YYYY/MM/DD-XXX`
    -   Contoh: `PB-2024/10/03-001`

### Komponen Format

-   `PB` = Prefix untuk Purchase/Pembelian
-   `KODE_SUPPLIER` = 3 huruf pertama dari nama supplier (uppercase, karakter non-alfabet dihilangkan)
-   `YYYY/MM/DD` = Tanggal pembelian
-   `XXX` = Nomor urut (3 digit, padded dengan 0)

## Cara Kerja

### 1. Generate Kode Supplier

```php
// Backend: PurchaseController.php
$supplier = Supplier::find($supplierId);
$supplierCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $supplier->name), 0, 3));

// Jika kurang dari 3 karakter, padding dengan 'X'
if (strlen($supplierCode) < 3) {
    $supplierCode = str_pad($supplierCode, 3, 'X');
}
```

**Contoh Generate Kode:**

-   "Budi Jaya" → "BUD"
-   "PT. Sinar Makmur" → "SIN" (PT dihilangkan)
-   "88 Warehouse" → "WAR"
-   "AB" → "ABX" (padded dengan X)

### 2. Auto-Generate Invoice Number

Invoice number di-generate otomatis ketika:

-   User memilih tanggal pembelian
-   User memilih supplier (opsional)

Sistem akan:

1. Mengambil invoice number terakhir untuk kombinasi tanggal + supplier
2. Increment nomor urut
3. Return invoice number baru ke frontend

### 3. Frontend Integration

```javascript
// PurchaseFormInfo.jsx
useEffect(() => {
    const fetchNext = async () => {
        const params = new URLSearchParams({
            date: data.purchase_date,
        });

        // Kirim supplier_id jika dipilih
        if (data.supplier_id) {
            params.append("supplier_id", data.supplier_id);
        }

        const url = `/dashboard/purchases/next-invoice?${params.toString()}`;
        // Fetch dan set invoice_number
    };
    fetchNext();
}, [data.purchase_date, data.supplier_id]); // Re-fetch saat tanggal/supplier berubah
```

## File yang Dimodifikasi

### 1. Backend

**File**: `app/Http/Controllers/Apps/PurchaseController.php`

**Method**: `nextInvoice(Request $request)`

**Perubahan**:

-   Menambahkan parameter `supplier_id` (opsional)
-   Generate kode supplier dari nama
-   Ubah pattern pencarian invoice: `PB{$supplierCode}-{$formattedDate}-%`
-   Parsing invoice number yang lebih robust untuk ekstrak sequence number
-   Return tambahan field `supplier_code` di response JSON

### 2. Frontend

**File**: `resources/js/Pages/Dashboard/Purchases/PurchaseFormInfo.jsx`

**Perubahan**:

-   Tambahkan `supplier_id` ke query parameters
-   Tambahkan `data.supplier_id` sebagai dependency di useEffect
-   Invoice number akan otomatis update saat supplier berubah

## Endpoint API

### GET `/dashboard/purchases/next-invoice`

**Query Parameters**:

-   `date` (required): Tanggal pembelian (format: YYYY-MM-DD)
-   `supplier_id` (optional): ID supplier

**Response**:

```json
{
    "invoice_number": "PB-BUD-2024/10/03-001",
    "invoice_seq": "001",
    "supplier_code": "BUD"
}
```

## Contoh Penggunaan

### Scenario 1: Pembelian dengan Supplier

1. User memilih tanggal: 2024-10-03
2. User memilih supplier: "Budi Jaya" (id: 1)
3. Sistem generate: `PB-BUD-2024/10/03-001`

Jika ada pembelian ke-2 di hari sama untuk supplier yang sama:

-   Invoice: `PB-BUD-2024/10/03-002`

### Scenario 2: Pembelian ke Supplier Berbeda di Hari Sama

1. Supplier "Budi Jaya": `PB-BUD-2024/10/03-001`
2. Supplier "Sinar Baru": `PB-SIN-2024/10/03-001`
3. Supplier "Budi Jaya" lagi: `PB-BUD-2024/10/03-002`

### Scenario 3: Pembelian Tanpa Supplier

1. User memilih tanggal: 2024-10-03
2. User tidak memilih supplier (atau NULL)
3. Sistem generate: `PB-2024/10/03-001`

## Keunggulan

1. **Identifikasi Mudah**: Langsung terlihat pembelian dari supplier mana
2. **Pengelompokan**: Mudah untuk filter/search berdasarkan supplier
3. **Unique**: Tetap unique meskipun ada banyak pembelian di hari yang sama
4. **Backward Compatible**: Masih support pembelian tanpa supplier

## Testing

### Test Case 1: Generate dengan Supplier

```
Input:
- date: 2024-10-03
- supplier_id: 1 (Budi Jaya)

Expected Output:
- invoice_number: PB-BUD-2024/10/03-001
- supplier_code: BUD
```

### Test Case 2: Generate Tanpa Supplier

```
Input:
- date: 2024-10-03
- supplier_id: null

Expected Output:
- invoice_number: PB-2024/10/03-001
- supplier_code: null
```

### Test Case 3: Update Invoice Saat Ganti Supplier

```
Initial State:
- Supplier: Budi Jaya → Invoice: PB-BUD-2024/10/03-001

User Changes:
- Supplier: Sinar Baru → Invoice: PB-SIN-2024/10/03-001 (auto-update)
```

## Logging

Backend mencatat error jika terjadi masalah:

```php
Log::error('Error generating next invoice number', [
    'date' => $date ?? null,
    'supplier_id' => $supplierId ?? null,
    'error' => $e->getMessage(),
    'user_id' => Auth::id()
]);
```

## Build Command

```bash
npm run build
```

Build time: ~18-21 detik

## Tanggal Implementasi

3 Oktober 2025
