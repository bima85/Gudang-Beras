# 🗃️ Struktur Database (Skema Saja)

## 📋 Ringkasan Struktur Tabel

File ini hanya berisi struktur/skema database tanpa data asli untuk tujuan keamanan.

## 🛡️ Pemberitahuan Keamanan

-   ✅ TIDAK ada data asli
-   ✅ TIDAK ada informasi pelanggan
-   ✅ TIDAK ada detail transaksi
-   ✅ Hanya struktur tabel dan relasi

## 📊 Skema Database

### Tabel Utama:

-   `users` - Manajemen pengguna
-   `roles` - Peran dan hak akses
-   `products` - Katalog produk
-   `categories` - Kategori produk
-   `suppliers` - Informasi supplier
-   `customers` - Manajemen pelanggan
-   `warehouses` - Lokasi gudang
-   `tokos` - Lokasi toko

### Tabel Transaksi:

-   `transactions` - Record transaksi utama
-   `transaction_details` - Item transaksi
-   `transaction_histories` - Jejak audit transaksi
-   `purchases` - Order pembelian
-   `purchase_items` - Item pembelian

### Manajemen Stok:

-   `warehouse_stocks` - Inventori gudang
-   `store_stocks` - Inventori toko
-   `stock_movements` - Pelacakan pergerakan stok
-   `stock_cards` - Record kartu stok

### Tabel Pendukung:

-   `units` - Satuan ukuran
-   `unit_conversions` - Tingkat konversi satuan
-   `price_histories` - Pelacakan harga
-   `delivery_notes` - Dokumentasi pengiriman
-   `surat_jalans` - Surat jalan

## 🔧 Instruksi Setup

1. **Buat Database:**

    ```sql
    CREATE DATABASE point_of_sales;
    ```

2. **Jalankan Migrasi:**

    ```bash
    php artisan migrate
    ```

3. **Seed Data Dasar:**
    ```bash
    php artisan db:seed
    ```

## 📝 Lokasi File Migrasi

Semua file migrasi terletak di: `database/migrations/`

## 🎯 Untuk Kolaborasi Tim

Anggota tim harus:

1. Clone repository
2. Setup file `.env` (lihat ENV_SETUP_GUIDE.md)
3. Jalankan migrasi untuk membuat struktur database
4. Seed dengan data contoh untuk development

---

Dibuat: 6 September 2025
**Catatan: File ini TIDAK mengandung data bisnis aktual untuk tujuan keamanan**
