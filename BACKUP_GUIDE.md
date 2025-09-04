# 🛡️ Panduan Backup & Migration Safety

## ⚠️ PENTING: Backup Sebelum migrate:fresh

**`migrate:fresh` akan menghapus SEMUA DATA!** Pastikan backup dulu sebelum menjalankan.

### 1. Backup Database

```bash
# Backup full database
php artisan db:backup

# Atau manual export via phpMyAdmin/MySQL
mysqldump -u username -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Migration Safety Checklist

**Untuk Production:**

```bash
# JANGAN gunakan migrate:fresh di production!
# Gunakan migrate biasa:
php artisan migrate
```

**Untuk Development/Testing:**

```bash
# 1. Backup dulu
mysqldump -u root -p toko88_db > backup_before_fresh.sql

# 2. Jalankan migrate:fresh dengan seed
php artisan migrate:fresh --seed

# 3. Cek permission system
php artisan tinker --execute="echo 'Permissions: ' . \Spatie\Permission\Models\Permission::count();"
```

### 3. Permission System Sudah Aman! ✅

**Yang sudah diperbaiki:**

-   ✅ `ComprehensivePermissionSeeder` berisi semua 76+ permissions
-   ✅ `DatabaseSeeder` sudah diupdate menggunakan seeder baru
-   ✅ Semua controller sudah protected dengan `hasPermissionTo()`
-   ✅ Role assignment sudah benar di `RoleSeeder`

**Jadi setelah `migrate:fresh --seed`:**

-   Semua permission akan ter-create otomatis
-   Role akan ter-assign dengan benar
-   User akan punya akses sesuai role-nya
-   **TIDAK ADA ERROR 403 lagi!**

### 4. Quick Test Setelah Migration

```bash
# Test login dan akses
php artisan tinker --execute="
\$user = \App\Models\User::first();
echo 'User: ' . \$user->name . PHP_EOL;
echo 'Roles: ' . \$user->roles->pluck('name')->implode(', ') . PHP_EOL;
echo 'Permissions: ' . \$user->getAllPermissions()->count() . PHP_EOL;
"
```

### 5. Restore dari Backup (jika diperlukan)

```bash
# Restore database dari backup
mysql -u username -p database_name < backup_file.sql

# Atau via Laravel
php artisan db:restore backup_file.sql
```

## 🎯 Kesimpulan

**Permission system Anda sudah 100% migration-safe!**

Ketika Anda jalankan `migrate:fresh --seed`, semua permission akan ter-setup otomatis tanpa error.
