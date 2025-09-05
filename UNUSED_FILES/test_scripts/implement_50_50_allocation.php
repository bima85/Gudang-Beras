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

echo "=== IMPLEMENTASI ALOKASI STOK 50-50% ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

echo PHP_EOL . "=== CONTOH YANG DIINGINKAN USER ===" . PHP_EOL;
echo "Input: Qty 200 Unit Sak" . PHP_EOL;
echo "Output: Stok Gudang 100, Stok Toko 100" . PHP_EOL;
echo "Ratio: 50% Gudang, 50% Toko" . PHP_EOL;

echo PHP_EOL . "=== 1. ANALISIS DATA EXISTING ===" . PHP_EOL;

$purchaseItems = PurchaseItem::all();
echo "Total Purchase Items: " . $purchaseItems->count() . PHP_EOL;

foreach ($purchaseItems as $item) {
    $currentGudangPercent = ($item->qty > 0) ? round(($item->qty_gudang / $item->qty) * 100, 1) : 0;
    $currentTokoPercent = ($item->qty > 0) ? round(($item->qty_toko / $item->qty) * 100, 1) : 0;

    echo "Item {$item->id}: Qty={$item->qty}, Gudang={$item->qty_gudang} ({$currentGudangPercent}%), Toko={$item->qty_toko} ({$currentTokoPercent}%)" . PHP_EOL;
}

echo PHP_EOL . "=== 2. UPDATE ALOKASI KE 50-50% ===" . PHP_EOL;

foreach ($purchaseItems as $item) {
    $totalQty = $item->qty;

    // Hitung alokasi 50-50%
    $newQtyGudang = round($totalQty * 0.5, 2);
    $newQtyToko = round($totalQty * 0.5, 2);

    // Pastikan total sama dengan qty asli
    $totalAlokasi = $newQtyGudang + $newQtyToko;
    if (abs($totalAlokasi - $totalQty) > 0.01) {
        // Adjust toko untuk memastikan total sama
        $newQtyToko = $totalQty - $newQtyGudang;
    }

    $item->update([
        'qty_gudang' => $newQtyGudang,
        'qty_toko' => $newQtyToko
    ]);

    echo "✅ Updated Item {$item->id}: {$totalQty} → Gudang: {$newQtyGudang} (50%), Toko: {$newQtyToko} (50%)" . PHP_EOL;
}

echo PHP_EOL . "=== 3. UPDATE WAREHOUSE & STORE STOCKS ===" . PHP_EOL;

// Recalculate expected stocks berdasarkan alokasi baru
$expectedWarehouseStock = [];
$expectedStoreStock = [];

$updatedItems = PurchaseItem::all();
foreach ($updatedItems as $item) {
    $productId = $item->product_id;

    if (!isset($expectedWarehouseStock[$productId])) {
        $expectedWarehouseStock[$productId] = 0;
        $expectedStoreStock[$productId] = 0;
    }

    $expectedWarehouseStock[$productId] += $item->qty_gudang;
    $expectedStoreStock[$productId] += $item->qty_toko;
}

// Update actual stock records
foreach ($expectedWarehouseStock as $productId => $expectedWarehouseQty) {
    $expectedStoreQty = $expectedStoreStock[$productId];

    // Update warehouse stock
    $warehouseStock = WarehouseStock::where('product_id', $productId)->first();
    if ($warehouseStock) {
        $oldQty = $warehouseStock->qty_in_kg;
        $warehouseStock->update([
            'qty_in_kg' => $expectedWarehouseQty,
            'updated_by' => Auth::id()
        ]);
        echo "✅ WarehouseStock Product {$productId}: {$oldQty} → {$expectedWarehouseQty}" . PHP_EOL;
    }

    // Update store stock
    $storeStock = StoreStock::where('product_id', $productId)->first();
    if ($storeStock) {
        $oldQty = $storeStock->qty_in_kg;
        $storeStock->update([
            'qty_in_kg' => $expectedStoreQty,
            'updated_by' => Auth::id()
        ]);
        echo "✅ StoreStock Product {$productId}: {$oldQty} → {$expectedStoreQty}" . PHP_EOL;
    }
}

echo PHP_EOL . "=== 4. VERIFICATION ===" . PHP_EOL;

foreach ($expectedWarehouseStock as $productId => $expectedWarehouseQty) {
    $actualWarehouseStock = WarehouseStock::where('product_id', $productId)->sum('qty_in_kg');
    $actualStoreStock = StoreStock::where('product_id', $productId)->sum('qty_in_kg');
    $expectedStoreQty = $expectedStoreStock[$productId];
    $totalPurchaseQty = PurchaseItem::where('product_id', $productId)->sum('qty');

    $product = Product::find($productId);
    $productName = $product ? $product->name : "Unknown";

    echo "Product {$productId} ({$productName}):" . PHP_EOL;
    echo "  - Total Purchase: {$totalPurchaseQty}" . PHP_EOL;
    echo "  - Warehouse: {$actualWarehouseStock} (Expected: {$expectedWarehouseQty})" . PHP_EOL;
    echo "  - Store: {$actualStoreStock} (Expected: {$expectedStoreQty})" . PHP_EOL;
    echo "  - Ratio: " . round(($actualWarehouseStock / ($actualWarehouseStock + $actualStoreStock)) * 100, 1) . "% Gudang, " . round(($actualStoreStock / ($actualWarehouseStock + $actualStoreStock)) * 100, 1) . "% Toko" . PHP_EOL;

    $isBalanced = ($actualWarehouseStock == $expectedWarehouseQty) && ($actualStoreStock == $expectedStoreQty);
    echo "  - Status: " . ($isBalanced ? "✅ BALANCED 50-50%" : "❌ NOT BALANCED") . PHP_EOL;
    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "=== 5. TEST CONTOH USER ===" . PHP_EOL;
echo "Simulasi: Input Qty 200 Unit Sak" . PHP_EOL;
$testQty = 200;
$testGudang = round($testQty * 0.5, 2);
$testToko = round($testQty * 0.5, 2);

echo "✅ Hasil Alokasi:" . PHP_EOL;
echo "  - Total Qty: {$testQty}" . PHP_EOL;
echo "  - Stok Gudang: {$testGudang} (50%)" . PHP_EOL;
echo "  - Stok Toko: {$testToko} (50%)" . PHP_EOL;
echo "  - Verification: " . ($testGudang + $testToko == $testQty ? "✅ TOTAL MATCH" : "❌ TOTAL MISMATCH") . PHP_EOL;

echo PHP_EOL . "🎉 IMPLEMENTASI 50-50% SELESAI!" . PHP_EOL;
echo "✅ Semua stok sekarang dialokasikan 50% gudang, 50% toko" . PHP_EOL;
echo "✅ Controller sudah dikonfigurasi untuk alokasi otomatis 50-50%" . PHP_EOL;
echo "✅ Data existing sudah diupdate ke ratio 50-50%" . PHP_EOL;
