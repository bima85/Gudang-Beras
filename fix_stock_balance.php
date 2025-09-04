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

echo "=== STOCK BALANCE CORRECTION TOOL ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

// Calculate expected stocks from purchase items
$expectedWarehouseStock = [];
$expectedStoreStock = [];

$purchaseItems = PurchaseItem::all();
foreach ($purchaseItems as $item) {
    $productId = $item->product_id;

    if (!isset($expectedWarehouseStock[$productId])) {
        $expectedWarehouseStock[$productId] = 0;
        $expectedStoreStock[$productId] = 0;
    }

    $expectedWarehouseStock[$productId] += $item->qty_gudang;
    $expectedStoreStock[$productId] += $item->qty_toko;
}

echo PHP_EOL . "=== CORRECTING STOCK BALANCES ===" . PHP_EOL;

foreach ($expectedWarehouseStock as $productId => $expectedWarehouseQty) {
    $expectedStoreQty = $expectedStoreStock[$productId];

    echo "Product {$productId}:" . PHP_EOL;
    echo "  Expected: Warehouse={$expectedWarehouseQty}, Store={$expectedStoreQty}" . PHP_EOL;

    // Update or create warehouse stock
    $warehouseStock = WarehouseStock::where('product_id', $productId)->first();
    if ($warehouseStock) {
        $oldQty = $warehouseStock->qty_in_kg;
        $warehouseStock->update([
            'qty_in_kg' => $expectedWarehouseQty,
            'updated_by' => Auth::id()
        ]);
        echo "  ✅ Updated WarehouseStock: {$oldQty} → {$expectedWarehouseQty}" . PHP_EOL;
    } else {
        WarehouseStock::create([
            'product_id' => $productId,
            'warehouse_id' => 1, // Default warehouse
            'qty_in_kg' => $expectedWarehouseQty,
            'updated_by' => Auth::id()
        ]);
        echo "  ✅ Created WarehouseStock: {$expectedWarehouseQty}" . PHP_EOL;
    }

    // Update or create store stock
    $storeStock = StoreStock::where('product_id', $productId)->first();
    if ($storeStock) {
        $oldQty = $storeStock->qty_in_kg;
        $storeStock->update([
            'qty_in_kg' => $expectedStoreQty,
            'updated_by' => Auth::id()
        ]);
        echo "  ✅ Updated StoreStock: {$oldQty} → {$expectedStoreQty}" . PHP_EOL;
    } else {
        StoreStock::create([
            'product_id' => $productId,
            'toko_id' => 1, // Default toko
            'qty_in_kg' => $expectedStoreQty,
            'updated_by' => Auth::id()
        ]);
        echo "  ✅ Created StoreStock: {$expectedStoreQty}" . PHP_EOL;
    }

    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICATION AFTER CORRECTION ===" . PHP_EOL;

foreach ($expectedWarehouseStock as $productId => $expectedWarehouseQty) {
    $actualWarehouseStock = WarehouseStock::where('product_id', $productId)->sum('qty_in_kg');
    $actualStoreStock = StoreStock::where('product_id', $productId)->sum('qty_in_kg');
    $expectedStoreQty = $expectedStoreStock[$productId];

    echo "Product {$productId}:" . PHP_EOL;
    echo "  Warehouse: Expected={$expectedWarehouseQty}, Actual={$actualWarehouseStock} " . ($actualWarehouseStock == $expectedWarehouseQty ? "✅" : "❌") . PHP_EOL;
    echo "  Store: Expected={$expectedStoreQty}, Actual={$actualStoreStock} " . ($actualStoreStock == $expectedStoreQty ? "✅" : "❌") . PHP_EOL;

    $totalExpected = $expectedWarehouseQty + $expectedStoreQty;
    $totalActual = $actualWarehouseStock + $actualStoreStock;
    echo "  Total: Expected={$totalExpected}, Actual={$totalActual} " . ($totalActual == $totalExpected ? "✅" : "❌") . PHP_EOL;
    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "✅ STOCK BALANCE CORRECTION COMPLETED!" . PHP_EOL;
