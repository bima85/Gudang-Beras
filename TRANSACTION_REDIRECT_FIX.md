# Fix: Transaction Processing Redirect Issue

## Problem Identified

Setelah proses transaksi berhasil, halaman tidak kembali ke `/dashboard/transactions` seperti yang diharapkan.

## Root Cause Analysis

### Controller Logic (TransactionController.php)

```php
// Return JSON response untuk AJAX requests
if ($request->expectsJson() || $request->ajax() || $request->wantsJson()) {
    return response()->json($responseData);
}

// Jika tidak terdeteksi sebagai AJAX, akan redirect ke print atau index
$shouldPrint = $request->input('print', true);
if ($shouldPrint) {
    return redirect()->route('transactions.print', ['invoice' => $transaction->invoice]);
}

return redirect()->route('transactions.index');
```

### Frontend Issue (IndexShadcn.jsx)

```jsx
// Request axios tanpa header yang proper
const response = await axios.post("/dashboard/transactions/store", {
    // data
});
```

**Masalah**: Axios request tidak mengirim header yang tepat untuk dideteksi sebagai AJAX request oleh Laravel.

## Solution Applied

### ✅ **Fixed Headers in Frontend**

```jsx
const response = await axios.post(
    "/dashboard/transactions/store",
    {
        warehouse_id: selectedWarehouse,
        customer_id: selectedCustomer,
        cash: cashAmount,
        change: change,
        discount: discountAmount,
        grand_total: grandTotal,
        payment_method: "cash",
        is_tempo: false,
        is_deposit: false,
        items: items,
        notes: notes,
    },
    {
        headers: {
            "Content-Type": "application/json",
            "X-Requested-With": "XMLHttpRequest", // AJAX detection
            Accept: "application/json", // JSON response expected
        },
    }
);
```

## How It Works

### 1. **AJAX Detection Headers**

-   `X-Requested-With: XMLHttpRequest` → Laravel mendeteksi sebagai AJAX request
-   `Accept: application/json` → Laravel tahu client expect JSON response
-   `Content-Type: application/json` → Data dikirim dalam format JSON

### 2. **Controller Response Flow**

```php
if ($request->expectsJson() || $request->ajax() || $request->wantsJson()) {
    // ✅ Sekarang akan masuk ke sini karena header tepat
    return response()->json($responseData);
}
```

### 3. **Frontend Handling**

```jsx
if (response.data.success) {
    toast.success("Transaksi berhasil diproses");

    // Clear form data
    setCash("");
    setDiscount("");
    // ... other resets

    // Open print page in new tab
    if (response.data.transaction_id) {
        window.open(
            `/transactions/print/${response.data.transaction_id}`,
            "_blank"
        );
    }

    // ✅ Redirect back to transactions index
    router.get(route("transactions.index"));
}
```

## Expected Behavior After Fix

### ✅ **Transaction Flow**

1. User fills transaction form
2. Clicks process transaction
3. AJAX request sent with proper headers
4. Controller detects as AJAX and returns JSON
5. Frontend receives JSON response
6. Success toast shown
7. Print page opens in new tab
8. **Main page redirects back to `/dashboard/transactions`** ← **FIXED**

### ✅ **Headers Sent**

```
Content-Type: application/json
X-Requested-With: XMLHttpRequest
Accept: application/json
```

### ✅ **Controller Response**

```json
{
    "success": true,
    "message": "Transaksi berhasil disimpan.",
    "transaction_id": 123,
    "invoice": "TRX-03/09/2025-001"
}
```

## Testing Results

### Before Fix

-   Transaction processed successfully
-   Print page opens in new tab
-   ❌ Main page does not redirect back to transactions index
-   ❌ User stays on same page with processed data

### After Fix

-   Transaction processed successfully
-   Print page opens in new tab
-   ✅ Main page redirects back to transactions index
-   ✅ Clean state for new transaction

## File Modified

-   ✅ `d:\herd\Toko88\resources\js\Pages\Dashboard\Transactions\IndexShadcn.jsx`

## Additional Notes

### Laravel AJAX Detection

Laravel checks for AJAX requests using these methods:

1. `$request->expectsJson()` - checks Accept header
2. `$request->ajax()` - checks X-Requested-With header
3. `$request->wantsJson()` - checks Accept header for JSON

### Axios Default Behavior

By default, axios tidak selalu mengirim header yang dibutuhkan Laravel untuk mendeteksi AJAX request, sehingga perlu explicit headers.

### Alternative Solution

Bisa juga menambahkan global axios interceptor, tapi untuk satu request specific ini, explicit headers lebih aman.

## Status: ✅ FIXED

Transaction processing sekarang akan redirect kembali ke `/dashboard/transactions` setelah berhasil diproses.
