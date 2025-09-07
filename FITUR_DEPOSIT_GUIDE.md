# 🏦 PANDUAN FITUR DEPOSIT - SISTEM POINT OF SALES

## ✅ Status Implementasi

**LENGKAP DAN SIAP DIGUNAKAN** - Backend dan Frontend telah terintegrasi sempurna

## 🎯 Fitur Deposit yang Tersedia

### 1. **Pembayaran dengan Deposit Customer**

-   ✅ Customer dapat menggunakan saldo deposit untuk membayar transaksi
-   ✅ Kombinasi pembayaran: Deposit + Tunai
-   ✅ Validasi saldo deposit otomatis
-   ✅ Update saldo deposit real-time

### 2. **Kembalian Menjadi Deposit**

-   ✅ Kembalian transaksi dapat dimasukkan ke deposit customer
-   ✅ Pilihan jumlah kembalian yang akan disimpan
-   ✅ Kembalian sisanya tetap diberikan tunai

## 🖥️ Cara Menggunakan di Frontend

### **Pembayaran dengan Deposit:**

1. **Pilih Customer** yang memiliki saldo deposit

    - Dropdown akan menampilkan badge "Deposit: Rp xxx" untuk customer yang punya saldo
    - Saldo deposit akan ditampilkan di kotak hijau

2. **Aktifkan Opsi Deposit Payment**

    - Centang "Gunakan deposit untuk pembayaran"
    - Masukkan jumlah deposit yang ingin digunakan
    - Atau klik "Maksimal" untuk menggunakan semua deposit
    - Atau klik "Bayar Semua" jika deposit cukup untuk seluruh transaksi

3. **Input Tunai Sisa**

    - Field tunai akan menunjukkan sisa yang perlu dibayar
    - Tombol "Pas", "+5K", "+10K" sudah disesuaikan dengan sisa pembayaran

4. **Review Pembayaran**
    - Akan muncul rincian: Deposit + Tunai = Total Pembayaran
    - Kembalian dihitung dari total pembayaran dikurangi grand total

### **Kembalian ke Deposit:**

1. Setelah ada kembalian, centang "Masukkan kembalian ke deposit"
2. Tentukan jumlah yang akan masuk deposit (atau kosongkan untuk semua)
3. Sistem akan split: sebagian ke deposit, sisanya tunai

## 🔧 Backend Implementation

### **Database Fields:**

```php
// Table: customers
deposit (decimal) - Saldo deposit customer

// Table: transactions
is_deposit (boolean) - Apakah menggunakan deposit
deposit_amount (decimal) - Jumlah deposit yang digunakan
add_change_to_deposit (boolean) - Kembalian masuk deposit
change_to_deposit_amount (decimal) - Jumlah kembalian ke deposit
payment_method (enum) - 'cash', 'tempo', 'deposit'
```

### **Controller Logic:**

```php
// Validasi saldo deposit
if ($request->is_deposit && $request->deposit_amount > 0) {
    if ($customer->deposit < $request->deposit_amount) {
        return response()->json(['message' => 'Saldo deposit tidak cukup'], 422);
    }
}

// Update saldo customer
$customer->deposit -= $request->deposit_amount; // Kurangi deposit yang digunakan
$customer->deposit += $request->change_to_deposit_amount; // Tambah dari kembalian
$customer->save();
```

## 📊 Contoh Skenario Penggunaan

### **Skenario 1: Bayar Kombinasi**

-   Total belanja: Rp 100,000
-   Saldo deposit Tono: Rp 210,050
-   Bayar deposit: Rp 60,000
-   Bayar tunai: Rp 40,000
-   Kembalian: Rp 0
-   Sisa deposit: Rp 150,050

### **Skenario 2: Kembalian ke Deposit**

-   Total belanja: Rp 75,000
-   Bayar tunai: Rp 100,000
-   Kembalian: Rp 25,000
-   Masukkan ke deposit: Rp 20,000
-   Terima tunai: Rp 5,000
-   Deposit bertambah: Rp 20,000

### **Skenario 3: Bayar Full Deposit**

-   Total belanja: Rp 50,000
-   Saldo deposit: Rp 210,050
-   Bayar deposit: Rp 50,000 (klik "Bayar Semua")
-   Bayar tunai: Rp 0
-   Kembalian: Rp 0
-   Sisa deposit: Rp 160,050

## 🎨 UI Components

### **Customer Selection Enhancement:**

-   Badge deposit di dropdown customer
-   Box hijau menampilkan saldo deposit
-   Real-time update saldo

### **Payment Section Features:**

-   Checkbox "Gunakan deposit untuk pembayaran"
-   Input jumlah deposit dengan tombol quick action
-   Summary pembayaran (Deposit + Tunai)
-   Validasi dan pesan error yang jelas

### **Smart Calculations:**

-   Auto-calculate sisa pembayaran tunai
-   Kembalian dari total pembayaran
-   Validasi real-time

## 🔐 Validasi & Security

### **Frontend Validations:**

-   Customer harus dipilih untuk fitur deposit
-   Jumlah deposit tidak boleh melebihi saldo
-   Total pembayaran harus mencukupi grand total

### **Backend Validations:**

-   Double-check saldo deposit di database
-   Validasi customer exists dan memiliki deposit
-   Transaction rollback jika validasi gagal

## 🚀 Testing

Customer test tersedia:

-   **Tono** (ID: 1) - Saldo: Rp 210,050
-   **Umum** (ID: 2) - Saldo: Rp 0

## 📝 Status Database

```sql
-- Current customer data
SELECT id, name, deposit FROM customers;
-- ID: 1, Name: Tono, Deposit: 210050.00
-- ID: 2, Name: Umum, Deposit: 0.00
```

## ✨ Fitur Tambahan

1. **Print Receipt** - Struk akan menampilkan detail deposit yang digunakan
2. **Transaction History** - Semua penggunaan deposit tercatat
3. **Customer Balance Tracking** - Riwayat perubahan saldo deposit
4. **Multi-payment Method** - Kombinasi deposit, tunai, dan tempo

---

## 🎉 KESIMPULAN

**Sistem deposit telah BERHASIL diimplementasi dengan lengkap!**

✅ Backend sudah sempurna
✅ Frontend sudah terintegrasi  
✅ Database sudah siap
✅ Validasi sudah komprehensif
✅ UI/UX sudah user-friendly

**Kasir sekarang dapat:**

-   Melihat saldo deposit customer
-   Menggunakan deposit untuk pembayaran
-   Kombinasi deposit + tunai
-   Mengubah kembalian menjadi deposit
-   Semua dengan interface yang intuitif

**Sistem siap untuk production use!** 🚀
