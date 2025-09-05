# File-file yang Tidak Terpakai

Folder ini berisi file-file yang sudah dikonfirmasi tidak digunakan dalam aplikasi dan **AMAN UNTUK DIHAPUS**.

## 📁 Struktur File yang Dipindahkan

### 🗂️ Frontend Components (React/JS)

-   `Edit.jsx.new` - Versi backup komponen edit produk
-   `Index.backup.jsx` - Versi backup halaman index untuk Units dan Products
-   `CartTable.jsx.new` - Versi backup komponen cart table
-   `ComponentTransaction/` - Folder komponen transaksi yang tidak digunakan oleh controller
-   `StockRequests/` - Folder permintaan stok yang tidak digunakan oleh controller
-   `Toko.jsx` - Komponen dashboard toko yang tidak pernah dirender

### 🗂️ Backend Controllers (PHP)

-   `CustomerController.php.backup` - Versi backup controller customer
-   `PurchaseController copy.php.bak` - Versi backup controller pembelian
-   `PurchaseController.php.bak` - Versi backup controller pembelian
-   `StockController copy.php.bak` - Versi backup controller stok
-   `StockController.php.bak` - Versi backup controller stok
-   `SubcategoryController.php.bak` - Versi backup controller subkategori
-   `SupplierController.php.backup` - Versi backup controller supplier
-   `TransactionController.php.bak` - Versi backup controller transaksi
-   `TransactionHistoryController_backup.php` - Versi backup controller riwayat transaksi
-   `TransactionHistoryController_with_permissions.php` - Controller dengan permission yang tidak digunakan
-   `Stock.php.bak` - Versi backup model Stock

### 🗂️ Test Scripts & Temporary Files

-   `test_*.php` - Semua file testing dan debugging (50+ files)
-   `final_*.php` - File testing sistem final
-   `tmp_*.php` - File temporary sementara
-   `analyze_*.php` - File analisis sistem
-   `clean_*.php` - File pembersihan data
-   `fix_*.php` - File perbaikan sistem
-   `fresh_*.php` - File testing fresh installation
-   `implement_*.php` - File implementasi fitur baru
-   `create_units.php` - Script pembuatan unit
-   `*.sh` - Script shell untuk automation
-   `*.md` - File dokumentasi development (bukan README utama)
-   `*.sql` - File SQL backup/testing
-   `dump_deliveries.json` - Backup data delivery
-   `migration_cleanup_list.txt` - List pembersihan migrasi

## ✅ Status Verifikasi

Semua file dalam folder ini telah dikonfirmasi **TIDAK DIGUNAKAN** oleh:

1. ✅ **Routes** - Tidak ada route yang mengarah ke file-file ini
2. ✅ **Controllers** - Tidak ada controller yang merender komponen ini
3. ✅ **Imports** - Tidak ada import/require yang mereferensikan file ini
4. ✅ **Database** - File backup yang tidak digunakan dalam migrasi aktif

## 🚨 Cara Menghapus

Untuk menghapus semua file unused:

```bash
# Hapus seluruh folder UNUSED_FILES
rm -rf UNUSED_FILES/

# Atau hapus per kategori
rm -rf UNUSED_FILES/test_scripts/    # Hapus script testing
rm -rf UNUSED_FILES/app/             # Hapus controller backup
rm -rf UNUSED_FILES/*.jsx            # Hapus komponen backup
rm -rf UNUSED_FILES/ComponentTransaction/  # Hapus folder komponen unused
```

## 📊 Ringkasan Pembersihan

-   **Total File Dipindahkan**: 100+ files
-   **Space Saved**: ~10-20MB
-   **Kategori Dibersihkan**: Frontend Components, Backend Controllers, Test Scripts, Documentation
-   **Status**: Semua file aman untuk dihapus

---

**Catatan**: File-file konfigurasi penting seperti `package.json`, `composer.json`, `README.md` utama sudah dikembalikan ke root directory.
