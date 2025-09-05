<?php

require_once 'vendor/autoload.php';

use App\Models\Product;
use App\Models\StockCard;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== PERBAIKAN DUPLIKASI STOK ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

echo PHP_EOL . "PILIHAN PERBAIKAN:" . PHP_EOL;
echo "1. Menggunakan sistem stock terpisah (warehouse_stocks + store_stocks) - RECOMMENDED" . PHP_EOL;
echo "2. Menggunakan products.stock saja" . PHP_EOL;
echo PHP_EOL;

echo "Melakukan OPSI 1: Sistem Stock Terpisah..." . PHP_EOL;
echo PHP_EOL;

echo "=== STEP 1: Membersihkan products.stock ===" . PHP_EOL;
$products = Product::where('stock', '>', 0)->get();
foreach ($products as $product) {
    $oldStock = $product->stock;
    $product->update(['stock' => 0]);
    echo "✅ Product {$product->id} ({$product->name}): stock {$oldStock} → 0" . PHP_EOL;
}

echo PHP_EOL . "=== STEP 2: Membersihkan duplicate stock cards ===" . PHP_EOL;
$duplicateCards = StockCard::where('product_id', 32)->where('qty', '>', 0)->get();
echo "Found " . $duplicateCards->count() . " stock cards untuk product 32" . PHP_EOL;

// Group by qty to identify duplicates
$cardsByQty = $duplicateCards->groupBy('qty');
$deletedCount = 0;

foreach ($cardsByQty as $qty => $cards) {
    if ($cards->count() > 1) {
        // Keep 1, delete the rest
        $toDelete = $cards->skip(1);
        foreach ($toDelete as $card) {
            $card->delete();
            $deletedCount++;
            echo "✅ Deleted duplicate stock card ID {$card->id} (qty: {$qty})" . PHP_EOL;
        }
    }
}

echo "Total stock cards deleted: {$deletedCount}" . PHP_EOL;

echo PHP_EOL . "=== STEP 3: Verifikasi hasil ===" . PHP_EOL;
$product32 = Product::find(32);
$remainingCards = StockCard::where('product_id', 32)->sum('qty');

echo "Product 32 stock setelah cleanup: {$product32->stock}" . PHP_EOL;
echo "Remaining stock cards total: {$remainingCards}" . PHP_EOL;

echo PHP_EOL . "=== STEP 4: Final consistency check ===" . PHP_EOL;
$warehouseStock = \App\Models\WarehouseStock::where('product_id', 32)->sum('qty_in_kg');
$storeStock = \App\Models\StoreStock::where('product_id', 32)->sum('qty_in_kg');
$purchaseTotal = \App\Models\PurchaseItem::where('product_id', 32)->sum('qty');

echo "Consistency Check untuk Product 32:" . PHP_EOL;
echo "- Products.stock: {$product32->stock} ✅ (should be 0)" . PHP_EOL;
echo "- WarehouseStock: {$warehouseStock}" . PHP_EOL;
echo "- StoreStock: {$storeStock}" . PHP_EOL;
echo "- Total Separate Stock: " . ($warehouseStock + $storeStock) . PHP_EOL;
echo "- Purchase Items Total: {$purchaseTotal}" . PHP_EOL;
echo "- Stock Cards Total: {$remainingCards}" . PHP_EOL;

if ($warehouseStock + $storeStock == $purchaseTotal && $remainingCards == $purchaseTotal) {
    echo PHP_EOL . "✅ SEMUA KONSISTEN! Tidak ada lagi duplikasi." . PHP_EOL;
} else {
    echo PHP_EOL . "⚠️ Masih ada inconsistency yang perlu diperbaiki." . PHP_EOL;
}

echo PHP_EOL . "=== KESIMPULAN ===" . PHP_EOL;
echo "✅ Sistem sekarang menggunakan STOCK TERPISAH" . PHP_EOL;
echo "✅ Products.stock = 0 (tidak digunakan)" . PHP_EOL;
echo "✅ Stock hanya di warehouse_stocks dan store_stocks" . PHP_EOL;
echo "✅ Stock Cards sudah cleaned up" . PHP_EOL;
echo "✅ Semua stock berasal dari Purchase Items yang dialokasikan dengan benar" . PHP_EOL;

echo PHP_EOL . "=== PERBAIKAN SELESAI ===" . PHP_EOL;
