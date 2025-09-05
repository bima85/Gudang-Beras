# Modul Toko - Updated dengan ShadCN UI

## Overview

Modul Toko telah diperbarui dengan menggunakan komponen ShadCN UI modern dan fitur-fitur tambahan.

## Fitur yang Telah Diimplementasikan

### 1. **Controller (TokoController.php)**

-   ✅ CRUD lengkap (Create, Read, Update, Delete)
-   ✅ Pagination dengan 10 item per halaman
-   ✅ Search functionality (nama, alamat, telepon)
-   ✅ Proper validation
-   ✅ Success/error messages dalam bahasa Indonesia

### 2. **Model (Toko.php)**

-   ✅ Soft Deletes enabled
-   ✅ Proper fillable attributes
-   ✅ Database migration untuk soft deletes

### 3. **Views dengan ShadCN UI**

#### **Index Page (Index.jsx)**

-   ✅ Modern table design dengan ShadCN Table component
-   ✅ Search bar dengan real-time filtering
-   ✅ Pagination controls
-   ✅ Action buttons (View, Edit, Delete)
-   ✅ Icons dari Lucide React
-   ✅ Responsive design
-   ✅ Empty state handling

#### **Create Page (Create.jsx)**

-   ✅ Form dengan ShadCN Card, Input, Textarea
-   ✅ Proper validation display
-   ✅ Icons untuk setiap field
-   ✅ Required field indicators (\*)
-   ✅ Loading states
-   ✅ Breadcrumb navigation

#### **Edit Page (Edit.jsx)**

-   ✅ Pre-filled form data
-   ✅ Same modern design sebagai Create
-   ✅ Proper form handling dengan Inertia.js
-   ✅ Success/error feedback

#### **Show Page (Show.jsx)**

-   ✅ Detail view dengan card layout
-   ✅ Information sections
-   ✅ Quick action buttons
-   ✅ Formatted date display
-   ✅ Empty data handling

### 4. **Database**

-   ✅ Migration untuk soft deletes telah dibuat dan dijalankan
-   ✅ Structure tabel tokos:
    -   id (primary key)
    -   name (required)
    -   address (nullable)
    -   phone (nullable)
    -   description (nullable)
    -   created_at, updated_at
    -   deleted_at (soft deletes)

## Komponen ShadCN UI yang Digunakan

-   `Button` - Untuk semua tombol aksi
-   `Input` - Form input fields
-   `Textarea` - Text area fields
-   `Card`, `CardContent`, `CardHeader`, `CardTitle` - Layout cards
-   `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` - Data tables
-   `Label` - Form labels dengan required indicators
-   `Badge` - Status badges

## Icons yang Digunakan (Lucide React)

-   `Building` - Toko/building icon
-   `MapPin` - Address icon
-   `Phone` - Phone icon
-   `FileText` - Description icon
-   `Plus` - Add new
-   `Search` - Search functionality
-   `Edit` - Edit action
-   `Trash2` - Delete action
-   `Eye` - View action
-   `ArrowLeft` - Back navigation
-   `Save` - Save action
-   `Calendar` - Date display

## Cara Menggunakan

### 1. Akses Modul

```
/tokos - Halaman index dengan daftar semua toko
/tokos/create - Form tambah toko baru
/tokos/{id} - Detail toko
/tokos/{id}/edit - Edit toko
```

### 2. Fitur Search

-   Ketik nama toko, alamat, atau nomor telepon
-   Search real-time tanpa perlu reload page
-   Reset filter dengan tombol Reset

### 3. Pagination

-   Navigasi dengan tombol Previous/Next
-   Direct page access
-   Showing X-Y of Z records info

## Teknologi yang Digunakan

-   **Backend**: Laravel 11
-   **Frontend**: React dengan Inertia.js
-   **UI Components**: ShadCN UI
-   **Icons**: Lucide React
-   **Styling**: Tailwind CSS
-   **Notifications**: React Toastify

## File yang Dimodifikasi/Dibuat

### Controller

-   `app/Http/Controllers/Apps/TokoController.php` (updated)

### Model

-   `app/Models/Toko.php` (updated with soft deletes)

### Views

-   `resources/js/Pages/Dashboard/Toko/Index.jsx` (completely rewritten)
-   `resources/js/Pages/Dashboard/Toko/Create.jsx` (completely rewritten)
-   `resources/js/Pages/Dashboard/Toko/Edit.jsx` (completely rewritten)
-   `resources/js/Pages/Dashboard/Toko/Show.jsx` (completely rewritten)

### Migration

-   `database/migrations/2025_08_31_025433_add_soft_deletes_to_tokos_table.php` (new)

### CSS

-   `resources/css/app.css` (added required field styling)

## Catatan Penting

1. Soft deletes sudah diaktifkan - data yang dihapus tidak hilang permanen
2. Semua form sudah dilengkapi validasi
3. Responsive design untuk mobile dan desktop
4. Notifications terintegrasi untuk feedback user
5. Search dan pagination menggunakan query string untuk bookmarkable URLs

## Testing

✅ Module telah di-build dan ready untuk production
✅ Development server berjalan di http://localhost:8000
✅ Semua komponen ShadCN UI terintegrasi dengan baik
