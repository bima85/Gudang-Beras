# Update: Input Form Tambah Pembelian

## Perubahan pada Form Input (PurchaseItemInput)

### Sebelumnya:

Saat checkbox "Pisah Qty Toko & Gudang" dicentang, muncul 2 input field:

-   ❌ **Qty Gudang** (editable)
-   ❌ **Qty Toko** (editable) → Bisa menyebabkan error/inkonsistensi

### Sekarang:

Saat checkbox "**Atur Qty Gudang**" dicentang, hanya muncul:

-   ✅ **Qty Gudang** (editable)
-   ✅ **Qty Toko (Auto)** (read-only, auto-calculated)

---

## Cara Kerja

### 1. Checkbox TIDAK Dicentang (Default)

```
Form Input:
  Kategori: [Select]
  Produk: [Select]
  Unit: [Select]
  Qty: 100
  ☐ Atur Qty Gudang (tidak dicentang)
  Harga: 10000

Hasil:
  qty = 100
  qty_gudang = 0
  qty_toko = 100 (semua ke toko)
```

### 2. Checkbox DICENTANG

```
Form Input:
  Kategori: [Select]
  Produk: [Select]
  Unit: [Select]
  Qty: 100
  ☑ Atur Qty Gudang (dicentang)

  Qty Gudang: 30 (editable)
  Qty Toko (Auto): 70 (read-only, auto-calculated)

  Harga: 10000

Hasil:
  qty = 100
  qty_gudang = 30
  qty_toko = 70 (otomatis: 100 - 30)
```

---

## Perubahan UI

### Label Checkbox

**Sebelum:** "Pisah Qty Toko & Gudang"
**Sekarang:** "**Atur Qty Gudang**"

Lebih jelas karena yang bisa diatur hanya Qty Gudang.

### Field Qty Toko

**Sebelum:**

```jsx
<Input
    type="number"
    name="qty_toko"
    value={displayQtyToko}
    onChange={handleFieldChange} // Editable
/>
```

**Sekarang:**

```jsx
<div className="h-10 flex items-center px-3 bg-gray-50 rounded border border-gray-200">
    {currentItem?.qty_toko || 0} // Read-only display
</div>
```

---

## Logika Auto-Calculate

### useEffect yang Menghitung Qty Toko

```javascript
useEffect(() => {
    const totalQty = parseFloat(currentItem?.qty) || 0;
    const qtyGudang = parseFloat(currentItem?.qty_gudang) || 0;

    let calculatedQtyToko = 0;

    if (showQtyFields) {
        // Checkbox dicentang: qty_toko = qty - qty_gudang
        if (totalQty > 0) {
            calculatedQtyToko = totalQty - qtyGudang;
            if (calculatedQtyToko < 0) calculatedQtyToko = 0;
        } else if (qtyGudang > 0) {
            // Jika hanya gudang yang diisi, auto-set main qty
            updatedItem.qty = qtyGudang;
            updatedItem.qty_toko = 0;
        }
    } else {
        // Checkbox tidak dicentang: semua ke toko
        calculatedQtyToko = totalQty;
    }

    // Update qty_toko jika berubah
    if (calculatedQtyToko !== currentQtyToko) {
        updateItem({ qty_toko: calculatedQtyToko });
    }
}, [currentItem?.qty, currentItem?.qty_gudang, showQtyFields]);
```

---

## Keuntungan

### 1. Mencegah Error Input

-   User tidak bisa salah input qty_toko
-   Tidak ada kemungkinan qty_toko + qty_gudang ≠ qty

### 2. Lebih Jelas

-   Label "Atur Qty Gudang" lebih deskriptif
-   "Qty Toko (Auto)" menunjukkan bahwa nilainya otomatis

### 3. Konsisten dengan Table

-   Form input dan table view sekarang sama-sama menampilkan Qty Toko sebagai read-only
-   User experience lebih konsisten

### 4. Lebih Sederhana

-   Hanya fokus pada Qty total dan alokasi gudang
-   Qty toko otomatis terhitung

---

## Testing

### Test 1: Tidak Centang Checkbox

1. Input Qty = 100
2. Jangan centang checkbox
3. Klik "+ Item"
4. ✅ Expected: qty_toko = 100, qty_gudang = 0

### Test 2: Centang Checkbox - Input Gudang

1. Input Qty = 100
2. Centang checkbox "Atur Qty Gudang"
3. Input Qty Gudang = 30
4. Lihat Qty Toko (Auto) = 70
5. Klik "+ Item"
6. ✅ Expected: qty = 100, qty_gudang = 30, qty_toko = 70

### Test 3: Centang Checkbox - Ubah Qty

1. Input Qty = 100
2. Centang checkbox
3. Input Qty Gudang = 25
4. Lihat Qty Toko (Auto) = 75
5. Ubah Qty menjadi 200
6. ✅ Expected: Qty Toko (Auto) berubah menjadi 175

### Test 4: Unchecked setelah Checked

1. Input Qty = 100
2. Centang checkbox
3. Input Qty Gudang = 30
4. Uncheck checkbox
5. ✅ Expected: Qty Gudang reset ke 0, Qty Toko (Auto) = 100

---

## File yang Dimodifikasi

1. ✅ `PurchaseItemInput.jsx`
    - Hapus input Qty Toko, ganti dengan display read-only
    - Update label checkbox
    - Update logika auto-calculate di useEffect
    - Hapus helper function `displayQtyToko`

---

## Screenshot Referensi

### Form Tanpa Checkbox

```
┌─────────────────────────────────────────┐
│ Qty: [100]                              │
│ ☐ Atur Qty Gudang                       │
│ Harga: [10000]              [+ Item]    │
└─────────────────────────────────────────┘
```

### Form Dengan Checkbox

```
┌─────────────────────────────────────────┐
│ Qty: [100]                              │
│ ☑ Atur Qty Gudang                       │
│ Qty Gudang: [30]                        │
│ Qty Toko (Auto): │ 70 │ (gray bg)       │
│ Harga: [10000]              [+ Item]    │
└─────────────────────────────────────────┘
```

---

## Catatan Penting

⚠️ **Perubahan ini hanya pada FORM INPUT**, bukan pada table yang menampilkan items yang sudah ditambahkan.

✅ Kedua komponen (Form Input dan Table) sekarang konsisten menampilkan Qty Toko sebagai auto-calculated dan read-only.
