# Fix: Invoice Number Per Supplier

## Masalah

Nomor invoice tidak terpisah per supplier. Ketika supplier A sudah memiliki invoice `PB-2025/10/03-001`, supplier B seharusnya juga mendapat `PB-2025/10/03-001`, bukan `PB-2025/10/03-002`.

## Solusi

Sistem sudah dirancang untuk membuat invoice number dengan format **per supplier**:

### Format Invoice

-   **Supplier A (misal "Budi Jaya")**: `PB-BUD-2025/10/03-001`
-   **Supplier B (misal "Sinar Abadi")**: `PB-SIN-2025/10/03-001`

Setiap supplier memiliki penomoran urut sendiri yang dimulai dari 001.

### Komponen Format

-   `PB` = Prefix Purchase/Pembelian
-   `BUD/SIN` = Kode supplier (3 huruf pertama nama supplier, uppercase)
-   `2025/10/03` = Tanggal pembelian
-   `001` = Nomor urut (per supplier per tanggal)

## Perubahan Yang Dilakukan

### 1. File: `resources/js/Pages/Dashboard/Purchases/Create.jsx`

#### a. Menambahkan `supplier_id` ke Form Data

```javascript
const { data, setData, post, processing, errors, reset } = useForm({
    invoice_number: "",
    supplier_id: "", // ← DITAMBAHKAN
    supplier_name: "",
    // ... fields lainnya
});
```

#### b. Set `supplier_id` Saat Supplier Dipilih

```javascript
const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "supplier_name") {
        setData("supplier_name", value);
        const selected = suppliersState.find((s) => s.name === value);
        setData("supplier_id", selected?.id || ""); // ← DITAMBAHKAN
        setData("phone", selected?.phone || "");
        setData("address", selected?.address || "");
        // ...
    }
};
```

#### c. Set `supplier_id` Saat Supplier Manual Ditambahkan

```javascript
const newSupplier = await response.json();
setSuppliersState((prev) => [...prev, newSupplier]);
setData("supplier_id", newSupplier.id); // ← DITAMBAHKAN
setData("supplier_name", newSupplier.name);
setData("phone", newSupplier.phone);
setData("address", newSupplier.address);
```

### 2. File: `resources/js/Pages/Dashboard/Purchases/PurchaseFormInfo.jsx`

Menambahkan console.log untuk debugging:

```javascript
console.log("Fetching invoice with supplier_id:", data.supplier_id);
// ...
console.log("Received invoice number:", json);
```

**Catatan**: File ini sudah benar sebelumnya - sudah mengirim `supplier_id` ke backend dan sudah ada dependency di useEffect.

### 3. Backend (Sudah Benar)

File `app/Http/Controllers/Apps/PurchaseController.php` method `nextInvoice()` sudah mengimplementasikan logika yang benar:

1. Menerima `supplier_id` sebagai parameter
2. Generate kode supplier dari 3 huruf pertama nama
3. Mencari invoice number berdasarkan pattern `PB-{KODE_SUPPLIER}-{TANGGAL}-%`
4. Menghitung nomor urut berikutnya per supplier

## Cara Kerja

### Scenario 1: Supplier A - Budi Jaya

1. User pilih tanggal: `2025-10-03`
2. User pilih supplier: `Budi Jaya` (id: 1)
3. Frontend kirim request: `/purchases/next-invoice?date=2025-10-03&supplier_id=1`
4. Backend generate kode: `BUD` (dari "Budi Jaya")
5. Backend cari invoice dengan pattern: `PB-BUD-2025/10/03-%`
6. Jika belum ada, return: `PB-BUD-2025/10/03-001`

### Scenario 2: Supplier B - Sinar Abadi

1. User pilih tanggal: `2025-10-03` (tanggal yang sama)
2. User pilih supplier: `Sinar Abadi` (id: 2)
3. Frontend kirim request: `/purchases/next-invoice?date=2025-10-03&supplier_id=2`
4. Backend generate kode: `SIN` (dari "Sinar Abadi")
5. Backend cari invoice dengan pattern: `PB-SIN-2025/10/03-%`
6. Jika belum ada, return: `PB-SIN-2025/10/03-001` ← **Mulai dari 001 lagi!**

### Scenario 3: Supplier A Lagi

1. User pilih tanggal: `2025-10-03` (masih tanggal yang sama)
2. User pilih supplier: `Budi Jaya` (id: 1)
3. Frontend kirim request: `/purchases/next-invoice?date=2025-10-03&supplier_id=1`
4. Backend generate kode: `BUD`
5. Backend cari invoice dengan pattern: `PB-BUD-2025/10/03-%`
6. Sudah ada `PB-BUD-2025/10/03-001`, return: `PB-BUD-2025/10/03-002`

## Testing

### Langkah Testing

1. Buka halaman Create Purchase
2. Pilih tanggal
3. Pilih Supplier A
4. Lihat console browser (F12):
    ```
    Fetching invoice with supplier_id: 1
    Received invoice number: {invoice_number: "PB-XXX-2025/10/03-001", ...}
    ```
5. Periksa nomor invoice yang ditampilkan: `PB-XXX-2025/10/03-001`
6. **Tanpa save**, ganti ke Supplier B
7. Lihat console browser:
    ```
    Fetching invoice with supplier_id: 2
    Received invoice number: {invoice_number: "PB-YYY-2025/10/03-001", ...}
    ```
8. Nomor urut harus kembali ke `001` untuk supplier berbeda

### Expected Result

-   ✅ Setiap supplier memiliki penomoran urut sendiri
-   ✅ Kode supplier muncul di invoice number
-   ✅ Nomor urut reset ke 001 untuk supplier baru
-   ✅ Nomor urut increment untuk supplier yang sama

## File Yang Diubah

1. ✅ `resources/js/Pages/Dashboard/Purchases/Create.jsx`
2. ✅ `resources/js/Pages/Dashboard/Purchases/PurchaseFormInfo.jsx`

## Referensi

Lihat dokumentasi lengkap di: `docs/INVOICE_NUMBER_BY_SUPPLIER.md`
