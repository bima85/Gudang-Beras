<?php

require_once 'vendor/autoload.php';

use App\Models\Product;
use App\Models\PurchaseItem;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\StockCard;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ANALISIS SUMBER STOK DALAM SISTEM ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

echo PHP_EOL . "=== 1. DAFTAR PRODUK ===" . PHP_EOL;
$products = Product::all();
foreach ($products as $product) {
    echo "Product {$product->id}: {$product->name}" . PHP_EOL;
    echo "  - Stock di Products table: {$product->stock}" . PHP_EOL;

    // Cek warehouse stock
    $warehouseStock = WarehouseStock::where('product_id', $product->id)->sum('qty_in_kg');
    echo "  - Total Warehouse Stock: {$warehouseStock} kg" . PHP_EOL;

    // Cek store stock  
    $storeStock = StoreStock::where('product_id', $product->id)->sum('qty_in_kg');
    echo "  - Total Store Stock: {$storeStock} kg" . PHP_EOL;

    // Cek purchase items
    $purchaseQty = PurchaseItem::where('product_id', $product->id)->sum('qty');
    $purchaseGudang = PurchaseItem::where('product_id', $product->id)->sum('qty_gudang');
    $purchaseToko = PurchaseItem::where('product_id', $product->id)->sum('qty_toko');
    echo "  - Total dari Purchase: {$purchaseQty} (Gudang: {$purchaseGudang}, Toko: {$purchaseToko})" . PHP_EOL;

    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "=== 2. ANALISIS STOCK CARDS ===" . PHP_EOL;
$stockCardExists = Schema::hasTable('stock_cards');
if ($stockCardExists) {
    $stockCards = StockCard::with('product')->get();
    echo "Total Stock Cards: " . $stockCards->count() . PHP_EOL;

    if ($stockCards->count() > 0) {
        foreach ($stockCards->groupBy('product_id') as $productId => $cards) {
            $product = Product::find($productId);
            echo "Product {$productId} ({$product->name}):" . PHP_EOL;

            foreach ($cards as $card) {
                echo "  - Type: {$card->type}, Qty: {$card->qty}, Reference: {$card->reference_type}#{$card->reference_id}" . PHP_EOL;
            }
        }
    } else {
        echo "Tidak ada stock cards ditemukan." . PHP_EOL;
    }
} else {
    echo "Tabel stock_cards tidak ada." . PHP_EOL;
}

echo PHP_EOL . "=== 3. SUMBER STOK ANALYSIS ===" . PHP_EOL;

foreach ($products as $product) {
    echo "Product {$product->id} ({$product->name}):" . PHP_EOL;

    // Stock dari products table
    $productStock = $product->stock;

    // Stock dari warehouse + store
    $separateStock = WarehouseStock::where('product_id', $product->id)->sum('qty_in_kg') +
        StoreStock::where('product_id', $product->id)->sum('qty_in_kg');

    // Stock dari purchase items
    $purchaseTotal = PurchaseItem::where('product_id', $product->id)->sum('qty');

    echo "  - Stock di Products table: {$productStock}" . PHP_EOL;
    echo "  - Stock dari Warehouse+Store: {$separateStock}" . PHP_EOL;
    echo "  - Total Purchase Items: {$purchaseTotal}" . PHP_EOL;

    // Analisis konsistensi
    if ($productStock == 0 && $separateStock > 0) {
        echo "  ✅ SISTEM TERPISAH: Stock tidak disimpan di products table, menggunakan warehouse/store tables" . PHP_EOL;
    } elseif ($productStock > 0 && $separateStock == 0) {
        echo "  ⚠️ SISTEM LAMA: Stock hanya di products table" . PHP_EOL;
    } elseif ($productStock > 0 && $separateStock > 0) {
        echo "  ❌ DUPLIKASI: Stock ada di kedua tempat (inconsistent)" . PHP_EOL;
    } else {
        echo "  ❓ TIDAK ADA STOCK: Belum ada stock di manapun" . PHP_EOL;
    }

    // Cek apakah purchase = actual stock
    if ($purchaseTotal == $separateStock) {
        echo "  ✅ BALANCE: Purchase items = Actual stock" . PHP_EOL;
    } else {
        echo "  ⚠️ IMBALANCE: Purchase items ({$purchaseTotal}) ≠ Actual stock ({$separateStock})" . PHP_EOL;
    }

    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "=== 4. KESIMPULAN SUMBER STOK ===" . PHP_EOL;

$totalProductsStock = Product::sum('stock');
$totalWarehouseStock = WarehouseStock::sum('qty_in_kg');
$totalStoreStock = StoreStock::sum('qty_in_kg');
$totalPurchaseItems = PurchaseItem::sum('qty');

echo "SUMMARY:" . PHP_EOL;
echo "- Total Stock di Products table: {$totalProductsStock}" . PHP_EOL;
echo "- Total Stock di Warehouse: {$totalWarehouseStock}" . PHP_EOL;
echo "- Total Stock di Store: {$totalStoreStock}" . PHP_EOL;
echo "- Total dari Purchase Items: {$totalPurchaseItems}" . PHP_EOL;
echo "- Total Separate Stock (Warehouse+Store): " . ($totalWarehouseStock + $totalStoreStock) . PHP_EOL;

if ($totalProductsStock == 0 && ($totalWarehouseStock + $totalStoreStock) > 0) {
    echo PHP_EOL . "✅ KONFIRMASI: Sistem menggunakan STOCK TERPISAH (warehouse_stocks + store_stocks)" . PHP_EOL;
    echo "✅ Stock TIDAK disimpan di products table" . PHP_EOL;
    echo "✅ Semua stock berasal dari Purchase Items yang dialokasikan ke warehouse dan store" . PHP_EOL;
} else {
    echo PHP_EOL . "⚠️ Ada kemungkinan duplikasi atau sistem campuran" . PHP_EOL;
}

echo PHP_EOL . "=== ANALISIS COMPLETED ===" . PHP_EOL;
