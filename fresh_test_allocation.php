<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Apps\PurchaseController;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Unit;
use App\Models\User;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Toko;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🚀 FRESH TEST: Sistem Alokasi 50-50% dari Awal" . PHP_EOL;
echo "================================================" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
if (!$adminUser) {
    echo "❌ Admin user tidak ditemukan" . PHP_EOL;
    exit(1);
}
Auth::login($adminUser);

// Get required data
$supplier = Supplier::first();
$warehouse = Warehouse::first();
$product = Product::first();
$category = Category::first();
$subcategory = Subcategory::first();
$unit = Unit::first();

// Pastikan ada toko untuk foreign key
$toko = Toko::first();
if (!$toko) {
    echo "Membuat Toko untuk testing..." . PHP_EOL;
    $toko = Toko::create([
        'name' => 'Toko Test',
        'address' => 'Alamat Test',
        'phone' => '08123456789'
    ]);
    echo "✅ Toko dibuat: {$toko->name}" . PHP_EOL;
}

echo "✅ Setup data berhasil" . PHP_EOL;

// Verifikasi kondisi awal
echo PHP_EOL . "=== KONDISI AWAL ===" . PHP_EOL;
echo "Warehouse Stocks: " . WarehouseStock::count() . PHP_EOL;
echo "Store Stocks: " . StoreStock::count() . PHP_EOL;
echo "Purchases: " . Purchase::count() . PHP_EOL;

$controller = new PurchaseController();

// Test Cases sesuai permintaan user
$testCases = [
    [
        'description' => 'CONTOH USER: 200 Unit Sak → 100 Gudang + 100 Toko',
        'qty' => 200,
        'expected_gudang' => 100,
        'expected_toko' => 100
    ],
    [
        'description' => 'Test: 100 Unit → 50 Gudang + 50 Toko',
        'qty' => 100,
        'expected_gudang' => 50,
        'expected_toko' => 50
    ],
    [
        'description' => 'Test: 50 Unit → 25 Gudang + 25 Toko',
        'qty' => 50,
        'expected_gudang' => 25,
        'expected_toko' => 25
    ]
];

$successCount = 0;
$totalTests = count($testCases);

foreach ($testCases as $index => $testCase) {
    echo PHP_EOL . "=== TEST " . ($index + 1) . ": {$testCase['description']} ===" . PHP_EOL;

    try {
        $purchaseData = [
            'supplier_name' => $supplier->name,
            'warehouse_id' => $warehouse->id,
            'toko_id' => $toko->id,
            'purchase_date' => date('Y-m-d'),
            'invoice_number' => 'FRESH-TEST-' . ($index + 1) . '-' . time(),
            'items' => [
                [
                    'product_id' => $product->id,
                    'category_id' => $category->id,
                    'subcategory_id' => $subcategory->id,
                    'unit_id' => $unit->id,
                    'warehouse_id' => $warehouse->id,
                    'qty' => $testCase['qty'],
                    // TIDAK ADA qty_gudang dan qty_toko - biarkan auto alokasi 50-50%
                    'harga_pembelian' => 5000,
                    'subtotal' => $testCase['qty'] * 5000,
                    'kuli_fee' => 0,
                    'timbangan' => 0
                ]
            ]
        ];

        $request = Request::create('/dashboard/purchases', 'POST', $purchaseData);
        app()->instance('request', $request);

        $response = $controller->store($request);

        // Verify hasil alokasi
        $createdPurchase = Purchase::where('invoice_number', $purchaseData['invoice_number'])->first();

        if ($createdPurchase && $createdPurchase->items->count() > 0) {
            $item = $createdPurchase->items->first();

            echo "Input Qty: {$item->qty}" . PHP_EOL;
            echo "Hasil Alokasi:" . PHP_EOL;
            echo "  → Qty Gudang: {$item->qty_gudang} (Expected: {$testCase['expected_gudang']})" . PHP_EOL;
            echo "  → Qty Toko: {$item->qty_toko} (Expected: {$testCase['expected_toko']})" . PHP_EOL;

            // Verifikasi hasil
            $gudangMatch = abs($item->qty_gudang - $testCase['expected_gudang']) < 0.01;
            $tokoMatch = abs($item->qty_toko - $testCase['expected_toko']) < 0.01;
            $totalMatch = abs(($item->qty_gudang + $item->qty_toko) - $item->qty) < 0.01;

            $gudangPercent = round(($item->qty_gudang / $item->qty) * 100, 1);
            $tokoPercent = round(($item->qty_toko / $item->qty) * 100, 1);

            echo "Percentage: Gudang {$gudangPercent}%, Toko {$tokoPercent}%" . PHP_EOL;

            if ($gudangMatch && $tokoMatch && $totalMatch && $gudangPercent == 50.0 && $tokoPercent == 50.0) {
                echo "🎉 RESULT: ✅ SUCCESS - PERFECT 50-50%!" . PHP_EOL;
                $successCount++;
            } else {
                echo "❌ RESULT: FAILED!" . PHP_EOL;
                echo "  - Gudang Match: " . ($gudangMatch ? "✅" : "❌") . PHP_EOL;
                echo "  - Toko Match: " . ($tokoMatch ? "✅" : "❌") . PHP_EOL;
                echo "  - Total Match: " . ($totalMatch ? "✅" : "❌") . PHP_EOL;
                echo "  - 50-50%: " . ($gudangPercent == 50.0 && $tokoPercent == 50.0 ? "✅" : "❌") . PHP_EOL;
            }
        } else {
            echo "❌ Purchase item tidak ditemukan" . PHP_EOL;
        }
    } catch (\Exception $e) {
        echo "❌ Error: " . $e->getMessage() . PHP_EOL;
        echo "❌ RESULT: FAILED!" . PHP_EOL;
    }
}

echo PHP_EOL . "=== KONDISI AKHIR ===" . PHP_EOL;
echo "Warehouse Stocks: " . WarehouseStock::count() . PHP_EOL;
echo "Store Stocks: " . StoreStock::count() . PHP_EOL;
echo "Fresh Test Purchases: " . Purchase::where('invoice_number', 'LIKE', 'FRESH-TEST-%')->count() . PHP_EOL;

// Cek stock balance
$totalWarehouseStock = WarehouseStock::sum('qty_in_kg');
$totalStoreStock = StoreStock::sum('qty_in_kg');
$totalStock = $totalWarehouseStock + $totalStoreStock;

if ($totalStock > 0) {
    $warehousePercent = round(($totalWarehouseStock / $totalStock) * 100, 1);
    $storePercent = round(($totalStoreStock / $totalStock) * 100, 1);

    echo PHP_EOL . "=== STOCK BALANCE ===" . PHP_EOL;
    echo "Total Warehouse Stock: {$totalWarehouseStock} kg ({$warehousePercent}%)" . PHP_EOL;
    echo "Total Store Stock: {$totalStoreStock} kg ({$storePercent}%)" . PHP_EOL;
    echo "Balance Status: " . (abs($warehousePercent - 50) < 1 && abs($storePercent - 50) < 1 ? "✅ PERFECT 50-50%" : "⚠️ NOT BALANCED") . PHP_EOL;
}

echo PHP_EOL . "🎯 HASIL AKHIR:" . PHP_EOL;
echo "Tests Passed: {$successCount}/{$totalTests}" . PHP_EOL;

if ($successCount == $totalTests) {
    echo "🎉 SEMUA TEST BERHASIL!" . PHP_EOL;
    echo "✅ Sistem alokasi 50-50% bekerja sempurna dari awal" . PHP_EOL;
    echo "✅ Sesuai permintaan: Qty input → 50% Gudang + 50% Toko" . PHP_EOL;
    echo "✅ Auto allocation berfungsi dengan baik" . PHP_EOL;
} else {
    echo "⚠️ Ada test yang gagal, perlu investigasi lebih lanjut" . PHP_EOL;
}
