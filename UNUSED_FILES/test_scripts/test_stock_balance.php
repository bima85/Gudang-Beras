<?php

require_once 'vendor/autoload.php';

use App\Models\PurchaseItem;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== ANALISIS STOK BALANCE TOKO DAN GUDANG ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

echo PHP_EOL . "=== 1. ANALISIS PURCHASE ITEMS ALLOCATION ===" . PHP_EOL;

$purchaseItems = PurchaseItem::with('product')->get();
$expectedWarehouseStock = [];
$expectedStoreStock = [];

foreach ($purchaseItems as $item) {
    $productId = $item->product_id;

    if (!isset($expectedWarehouseStock[$productId])) {
        $expectedWarehouseStock[$productId] = 0;
        $expectedStoreStock[$productId] = 0;
    }

    $expectedWarehouseStock[$productId] += $item->qty_gudang;
    $expectedStoreStock[$productId] += $item->qty_toko;

    echo "Purchase Item {$item->id}: Product {$productId} - Gudang: {$item->qty_gudang}, Toko: {$item->qty_toko}" . PHP_EOL;
}

echo PHP_EOL . "=== 2. EXPECTED STOCK SUMMARY ===" . PHP_EOL;
foreach ($expectedWarehouseStock as $productId => $expectedQty) {
    $product = Product::find($productId);
    $productName = $product ? $product->nama : "Unknown";

    echo "Product {$productId} ({$productName}):" . PHP_EOL;
    echo "  Expected Warehouse Stock: {$expectedQty}" . PHP_EOL;
    echo "  Expected Store Stock: {$expectedStoreStock[$productId]}" . PHP_EOL;
    echo "  Total Expected: " . ($expectedQty + $expectedStoreStock[$productId]) . PHP_EOL;
}

echo PHP_EOL . "=== 3. ACTUAL STOCK RECORDS ===" . PHP_EOL;

echo "Warehouse Stocks:" . PHP_EOL;
$warehouseStocks = WarehouseStock::with('product')->get();
foreach ($warehouseStocks as $stock) {
    $productName = $stock->product ? $stock->product->nama : "Unknown";
    echo "  Product {$stock->product_id} ({$productName}): {$stock->qty_in_kg} kg" . PHP_EOL;
}

echo PHP_EOL . "Store Stocks:" . PHP_EOL;
$storeStocks = StoreStock::with('product')->get();
foreach ($storeStocks as $stock) {
    $productName = $stock->product ? $stock->product->nama : "Unknown";
    echo "  Product {$stock->product_id} ({$productName}): {$stock->qty_in_kg} kg" . PHP_EOL;
}

echo PHP_EOL . "=== 4. BALANCE ANALYSIS ===" . PHP_EOL;

foreach ($expectedWarehouseStock as $productId => $expectedWarehouseQty) {
    $actualWarehouseStock = WarehouseStock::where('product_id', $productId)->sum('qty_in_kg');
    $actualStoreStock = StoreStock::where('product_id', $productId)->sum('qty_in_kg');

    $expectedStoreQty = $expectedStoreStock[$productId];
    $product = Product::find($productId);
    $productName = $product ? $product->nama : "Unknown";

    echo "Product {$productId} ({$productName}):" . PHP_EOL;
    echo "  Warehouse - Expected: {$expectedWarehouseQty}, Actual: {$actualWarehouseStock}, Difference: " . ($actualWarehouseStock - $expectedWarehouseQty) . PHP_EOL;
    echo "  Store - Expected: {$expectedStoreQty}, Actual: {$actualStoreStock}, Difference: " . ($actualStoreStock - $expectedStoreQty) . PHP_EOL;

    $isBalanced = ($actualWarehouseStock == $expectedWarehouseQty) && ($actualStoreStock == $expectedStoreQty);
    echo "  Status: " . ($isBalanced ? "✅ BALANCED" : "❌ NOT BALANCED") . PHP_EOL;
    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "=== 5. STOCK SYNCHRONIZATION RECOMMENDATION ===" . PHP_EOL;

$needsSync = false;
foreach ($expectedWarehouseStock as $productId => $expectedWarehouseQty) {
    $actualWarehouseStock = WarehouseStock::where('product_id', $productId)->sum('qty_in_kg');
    $actualStoreStock = StoreStock::where('product_id', $productId)->sum('qty_in_kg');
    $expectedStoreQty = $expectedStoreStock[$productId];

    if ($actualWarehouseStock != $expectedWarehouseQty || $actualStoreStock != $expectedStoreQty) {
        $needsSync = true;
        echo "Product {$productId} needs synchronization:" . PHP_EOL;

        if ($actualWarehouseStock != $expectedWarehouseQty) {
            echo "  - Update WarehouseStock to: {$expectedWarehouseQty}" . PHP_EOL;
        }

        if ($actualStoreStock != $expectedStoreQty) {
            echo "  - Update StoreStock to: {$expectedStoreQty}" . PHP_EOL;
        }
    }
}

if (!$needsSync) {
    echo "✅ All stocks are balanced!" . PHP_EOL;
} else {
    echo "❌ Stock synchronization required!" . PHP_EOL;
}

echo PHP_EOL . "=== ANALISIS COMPLETED ===" . PHP_EOL;
