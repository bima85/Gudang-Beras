<?php

require_once 'vendor/autoload.php';

use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\StockCard;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ANALISIS DUPLIKASI STOK ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

$product = Product::find(32); // Product yang ada stocknya
echo "Fokus pada Product 32: {$product->name}" . PHP_EOL;
echo PHP_EOL;

echo "=== DETAIL STOCK LOCATIONS ===" . PHP_EOL;
echo "1. Stock di Products table: {$product->stock}" . PHP_EOL;

$warehouseStock = WarehouseStock::where('product_id', 32)->first();
echo "2. WarehouseStock record:" . PHP_EOL;
if ($warehouseStock) {
    echo "   - ID: {$warehouseStock->id}" . PHP_EOL;
    echo "   - Warehouse ID: {$warehouseStock->warehouse_id}" . PHP_EOL;
    echo "   - Qty: {$warehouseStock->qty_in_kg} kg" . PHP_EOL;
    echo "   - Updated by: {$warehouseStock->updated_by}" . PHP_EOL;
    echo "   - Last updated: {$warehouseStock->updated_at}" . PHP_EOL;
} else {
    echo "   - Tidak ada record" . PHP_EOL;
}

$storeStock = StoreStock::where('product_id', 32)->first();
echo PHP_EOL . "3. StoreStock record:" . PHP_EOL;
if ($storeStock) {
    echo "   - ID: {$storeStock->id}" . PHP_EOL;
    echo "   - Toko ID: {$storeStock->toko_id}" . PHP_EOL;
    echo "   - Qty: {$storeStock->qty_in_kg} kg" . PHP_EOL;
    echo "   - Updated by: {$storeStock->updated_by}" . PHP_EOL;
    echo "   - Last updated: {$storeStock->updated_at}" . PHP_EOL;
} else {
    echo "   - Tidak ada record" . PHP_EOL;
}

echo PHP_EOL . "=== PURCHASE ITEMS BREAKDOWN ===" . PHP_EOL;
$purchaseItems = PurchaseItem::where('product_id', 32)->get();
$totalPurchaseQty = 0;
$totalPurchaseGudang = 0;
$totalPurchaseToko = 0;

foreach ($purchaseItems as $item) {
    echo "Purchase Item {$item->id}:" . PHP_EOL;
    echo "   - Purchase ID: {$item->purchase_id}" . PHP_EOL;
    echo "   - Qty Total: {$item->qty}" . PHP_EOL;
    echo "   - Qty Gudang: {$item->qty_gudang}" . PHP_EOL;
    echo "   - Qty Toko: {$item->qty_toko}" . PHP_EOL;
    echo "   - Created: {$item->created_at}" . PHP_EOL;

    $totalPurchaseQty += $item->qty;
    $totalPurchaseGudang += $item->qty_gudang;
    $totalPurchaseToko += $item->qty_toko;
}

echo PHP_EOL . "Total dari Purchase Items:" . PHP_EOL;
echo "   - Total Qty: {$totalPurchaseQty}" . PHP_EOL;
echo "   - Total Gudang: {$totalPurchaseGudang}" . PHP_EOL;
echo "   - Total Toko: {$totalPurchaseToko}" . PHP_EOL;

echo PHP_EOL . "=== STOCK CARDS ANALYSIS ===" . PHP_EOL;
$stockCards = StockCard::where('product_id', 32)->get();
$totalStockCardIn = 0;
$totalStockCardOut = 0;

foreach ($stockCards as $card) {
    echo "Stock Card {$card->id}:" . PHP_EOL;
    echo "   - Type: {$card->type}" . PHP_EOL;
    echo "   - Qty: {$card->qty}" . PHP_EOL;
    echo "   - Reference: {$card->reference_type}#{$card->reference_id}" . PHP_EOL;
    echo "   - Date: {$card->date}" . PHP_EOL;

    if ($card->type == 'in') {
        $totalStockCardIn += $card->qty;
    } else {
        $totalStockCardOut += $card->qty;
    }
}

$netStockCard = $totalStockCardIn - $totalStockCardOut;
echo PHP_EOL . "Stock Cards Summary:" . PHP_EOL;
echo "   - Total IN: {$totalStockCardIn}" . PHP_EOL;
echo "   - Total OUT: {$totalStockCardOut}" . PHP_EOL;
echo "   - Net Stock: {$netStockCard}" . PHP_EOL;

echo PHP_EOL . "=== KONSISTENSI ANALYSIS ===" . PHP_EOL;
echo "Perbandingan values:" . PHP_EOL;
echo "   - Products.stock: {$product->stock}" . PHP_EOL;
echo "   - WarehouseStock + StoreStock: " . ($warehouseStock->qty_in_kg + $storeStock->qty_in_kg) . PHP_EOL;
echo "   - Purchase Items total: {$totalPurchaseQty}" . PHP_EOL;
echo "   - Stock Cards net: {$netStockCard}" . PHP_EOL;

echo PHP_EOL . "=== MASALAH YANG TERIDENTIFIKASI ===" . PHP_EOL;

if ($product->stock > 0 && ($warehouseStock->qty_in_kg + $storeStock->qty_in_kg) > 0) {
    echo "❌ DUPLIKASI STOK: Stock tersimpan di 2 tempat (Products table + Separate tables)" . PHP_EOL;
    echo "   Ini bisa menyebabkan:" . PHP_EOL;
    echo "   - Double counting dalam laporan" . PHP_EOL;
    echo "   - Inconsistency saat update stock" . PHP_EOL;
    echo "   - Confusion dalam stock management" . PHP_EOL;
}

if ($netStockCard != $totalPurchaseQty) {
    echo "⚠️ STOCK CARDS MISMATCH: Stock cards ({$netStockCard}) ≠ Purchase items ({$totalPurchaseQty})" . PHP_EOL;
}

echo PHP_EOL . "=== REKOMENDASI PERBAIKAN ===" . PHP_EOL;
echo "1. Pilih satu sistem stock:" . PHP_EOL;
echo "   - OPSI A: Gunakan hanya warehouse_stocks + store_stocks (recommended)" . PHP_EOL;
echo "   - OPSI B: Gunakan hanya products.stock" . PHP_EOL;
echo PHP_EOL;
echo "2. Jika memilih OPSI A (sistem terpisah):" . PHP_EOL;
echo "   - Set products.stock = 0 untuk semua products" . PHP_EOL;
echo "   - Pastikan stock hanya di warehouse_stocks dan store_stocks" . PHP_EOL;
echo "   - Update aplikasi untuk tidak menggunakan products.stock" . PHP_EOL;
echo PHP_EOL;
echo "3. Sync stock cards dengan purchase data" . PHP_EOL;

echo PHP_EOL . "=== ANALISIS COMPLETED ===" . PHP_EOL;
