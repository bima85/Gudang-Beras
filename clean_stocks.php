<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Purchase;
use App\Models\PurchaseItem;

echo "🧹 MEMBERSIHKAN DATA STOK DAN PURCHASE HASIL CREATE" . PHP_EOL;
echo "==================================================" . PHP_EOL;

// Hapus semua warehouse stocks
$warehouseStockCount = WarehouseStock::count();
echo "Warehouse Stocks yang akan dihapus: {$warehouseStockCount}" . PHP_EOL;
WarehouseStock::truncate();
echo "✅ Warehouse Stocks dihapus" . PHP_EOL;

// Hapus semua store stocks
$storeStockCount = StoreStock::count();
echo "Store Stocks yang akan dihapus: {$storeStockCount}" . PHP_EOL;
StoreStock::truncate();
echo "✅ Store Stocks dihapus" . PHP_EOL;

// Hapus purchase yang dibuat untuk testing (invoice mengandung TEST atau FINAL)
$testPurchases = Purchase::where('invoice_number', 'LIKE', '%TEST%')
    ->orWhere('invoice_number', 'LIKE', '%FINAL%')
    ->get();

echo "Test Purchases yang akan dihapus: {$testPurchases->count()}" . PHP_EOL;

foreach ($testPurchases as $purchase) {
    echo "  - Menghapus: {$purchase->invoice_number}" . PHP_EOL;
    // Hapus purchase items dulu
    $purchase->items()->delete();
    // Hapus purchase
    $purchase->delete();
}

echo "✅ Test Purchases dihapus" . PHP_EOL;

// Verifikasi pembersihan
echo PHP_EOL . "=== VERIFIKASI PEMBERSIHAN ===" . PHP_EOL;
echo "Warehouse Stocks tersisa: " . WarehouseStock::count() . PHP_EOL;
echo "Store Stocks tersisa: " . StoreStock::count() . PHP_EOL;
echo "Purchases tersisa: " . Purchase::count() . PHP_EOL;

echo PHP_EOL . "🎯 PEMBERSIHAN SELESAI!" . PHP_EOL;
echo "✅ Semua data stok dan purchase test telah dihapus" . PHP_EOL;
echo "✅ Siap untuk test fresh dari awal" . PHP_EOL;
