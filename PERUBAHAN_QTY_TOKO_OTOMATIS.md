# Perubahan: Qty Toko Otomatis

## Ringkasan Perubahan

### Sebelumnya:

-   Ada 3 input field: **Qty**, **Qty Gudang**, dan **Qty Toko**
-   User bisa mengedit semua field secara manual
-   Rentan error jika user salah input

### Sekarang:

-   Ada 2 input field: **Qty** dan **Qty Gudang**
-   **Qty Toko** dihitung otomatis (read-only)
-   Lebih sederhana dan tidak bisa error

---

## Cara Kerja Baru

### Formula Sederhana:

```
Qty Toko = Qty - Qty Gudang
```

### Contoh 1: Hanya Input Qty

```
Input:
  Qty: 100
  Gudang: (kosong atau 0)

Hasil Otomatis:
  Toko: 100
```

✅ **Semua stok masuk ke toko**

---

### Contoh 2: Input Qty + Gudang

```
Input:
  Qty: 100
  Gudang: 30

Hasil Otomatis:
  Toko: 70 (dihitung: 100 - 30)
```

✅ **Stok dibagi: 30 ke gudang, 70 ke toko**

---

### Contoh 3: Hanya Input Gudang

```
Input:
  Qty: (kosong atau 0)
  Gudang: 50

Hasil Otomatis:
  Qty: 50 (auto-set)
  Toko: 0
```

✅ **Semua stok masuk ke gudang**

---

## Tampilan UI

### Header Tabel

```
| Qty | Unit | Gudang | Toko (Auto) | Harga |
```

Label **"Toko (Auto)"** menunjukkan bahwa nilai dihitung otomatis.

### Field Toko

Field Toko ditampilkan dengan:

-   ✅ Background abu-abu (tidak bisa diklik)
-   ✅ Border abu-abu
-   ✅ Nilai angka otomatis muncul
-   ❌ Tidak bisa diedit manual

---

## Keuntungan

### 1. Lebih Sederhana

-   Hanya 2 field yang perlu diisi
-   Fokus pada total qty dan alokasi gudang saja

### 2. Mencegah Error

-   Tidak mungkin qty toko + qty gudang ≠ qty total
-   Perhitungan selalu konsisten dan akurat

### 3. Lebih Jelas

-   User langsung tahu berapa yang masuk toko
-   Tidak ada kebingungan tentang field mana yang harus diisi

### 4. Otomatis Update

-   Setiap perubahan qty atau gudang, toko langsung update
-   Real-time calculation

---

## Testing Cepat

1. **Test 1**: Input Qty = 100 → Toko otomatis jadi 100 ✓
2. **Test 2**: Input Qty = 100, Gudang = 25 → Toko otomatis jadi 75 ✓
3. **Test 3**: Input Gudang = 60 (tanpa Qty) → Qty auto = 60, Toko = 0 ✓
4. **Test 4**: Ubah Qty dari 100 ke 200 → Toko otomatis update ✓

---

## File yang Diubah

1. ✅ `PurchaseItemsTable.jsx` - Ubah input jadi display
2. ✅ `Create.jsx` - Sederhanakan logika perhitungan
3. ✅ `QTY_UPDATE_LOGIC.md` - Update dokumentasi

Backend tidak perlu diubah karena logika perhitungan sudah benar.
