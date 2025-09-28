# Toko88 - Sistem Manajemen Gudang Beras

Aplikasi Point of Sales yang dikustomisasi khusus untuk manajemen gudang beras dengan sistem stok terpisah antara gudang dan toko.

## Tech Stack

-   Laravel 11.x
-   Inertia.js
-   React
-   TailwindCSS + Shadcn UI
-   MySQL

## Authors

-   [Bima85](https://github.com/bima85)

## 📌 Fitur Utama

| No  | Nama                                  | Status         |
| --- | ------------------------------------- | -------------- |
| 1   | Authentikasi Admin                    | ✅ Done        |
| 2   | Manajemen Pengguna                    | ✅ Done        |
| 3   | Manajemen Hak Akses                   | ✅ Done        |
| 4   | Manajemen Role                        | ✅ Done        |
| 5   | Manajemen Kategori                    | ✅ Done        |
| 6   | Manajemen Produk                      | ✅ Done        |
| 7   | Manajemen Pelanggan                   | ✅ Done        |
| 8   | Manajemen Supplier                    | ✅ Done        |
| 9   | Sistem Stok Terpisah (Gudang vs Toko) | ✅ Done        |
| 10  | Purchase Management                   | ✅ Done        |
| 11  | Sales Transactions                    | ✅ Done        |
| 12  | Print Invoice                         | ✅ Done        |
| 13  | Laporan Penjualan                     | ✅ Done        |
| 14  | Stock Movements Tracking              | ✅ Done        |
| 15  | Modern UI dengan Shadcn               | ✅ Done        |

## 🏗️ Arsitektur Sistem Stok

### Pemisahan Stok

-   **Warehouse Stocks**: Stok di gudang utama
-   **Store Stocks**: Stok di toko/cabang
-   **Transaction Histories**: Tracking semua pergerakan stok

### Database Schema

```
warehouse_stocks: product_id, warehouse_id, qty_in_kg
store_stocks: product_id, toko_id, qty_in_kg
transaction_histories: toko_id, product_id, stock_before, stock_after
```

## 💻 Panduan Instalasi

1. **Clone Repository**

```bash
git clone https://github.com/bima85/Gudang-Beras.git
cd Gudang-Beras
```

2. **Install Dependencies**

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
```

3. **Konfigurasi Database**
   Edit file `.env`:

```
DB_DATABASE=gudang_beras
DB_USERNAME=root
DB_PASSWORD=
```

4. **Setup Database**

```bash
php artisan config:cache
php artisan storage:link
php artisan migrate:fresh --seed
```

5. **Build Assets & Run**

```bash
npm run build
php artisan serve
```

## 🚀 Perubahan Terbaru

-   ✅ Implementasi sistem stok terpisah gudang-toko
-   ✅ Upgrade UI ke Shadcn components
-   ✅ Perbaikan foreign key constraints
-   ✅ Cleanup 127+ file tidak terpakai
-   ✅ Format display stok yang lebih clean
-   ✅ Implementasi modern transaction system

## 📞 Kontak

Untuk pertanyaan atau kontribusi, silahkan hubungi melalui GitHub issues.
