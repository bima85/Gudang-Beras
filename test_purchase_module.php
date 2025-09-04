<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Services\StockUpdateService;

echo "🔧 TESTING PURCHASE MODULE FIXES\n";
echo "===============================\n\n";

// Test 1: Check Models
echo "1️⃣ Testing Models...\n";

// Count records
$productCount = Product::count();
$supplierCount = Supplier::count();
$warehouseCount = Warehouse::count();
$tokoCount = Toko::count();

echo "   - Products: {$productCount}\n";
echo "   - Suppliers: {$supplierCount}\n";
echo "   - Warehouses: {$warehouseCount}\n";
echo "   - Tokos: {$tokoCount}\n";

if ($productCount > 0 && $supplierCount > 0 && $warehouseCount > 0 && $tokoCount > 0) {
    echo "   ✅ All models have data\n\n";
} else {
    echo "   ❌ Missing data in some models\n\n";
}

// Test 2: Check Stock Models
echo "2️⃣ Testing Stock Models...\n";

$warehouseStock = WarehouseStock::count();
$storeStock = StoreStock::count();

echo "   - Warehouse Stocks: {$warehouseStock}\n";
echo "   - Store Stocks: {$storeStock}\n";

// Test model methods
$firstProduct = Product::first();
$firstWarehouse = Warehouse::first();
$firstToko = Toko::first();

if ($firstProduct && $firstWarehouse && $firstToko) {
    echo "   ✅ Stock models accessible\n\n";

    // Test 3: Stock Service
    echo "3️⃣ Testing Stock Service...\n";

    $stockService = new StockUpdateService();

    // Test stock update after purchase
    try {
        $distribution = [
            'warehouse' => ['qty' => 10, 'unit' => 'Kg'],
            'store' => ['qty' => 5, 'unit' => 'Kg']
        ];

        $result = StockUpdateService::updateStockAfterPurchase(
            $firstProduct->id,
            $distribution,
            $firstWarehouse->id,
            $firstToko->id,
            1
        );

        if ($result) {
            echo "   ✅ updateStockAfterPurchase method works\n";
        } else {
            echo "   ❌ updateStockAfterPurchase returned false\n";
        }
    } catch (Exception $e) {
        echo "   ❌ updateStockAfterPurchase failed: " . $e->getMessage() . "\n";
    }

    echo "\n";
} else {
    echo "   ❌ Missing sample data\n\n";
}

// Test 4: Relations
echo "4️⃣ Testing Model Relations...\n";

try {
    $product = Product::with(['warehouseStocks', 'storeStocks'])->first();
    if ($product) {
        echo "   ✅ Product->warehouseStocks relation works\n";
        echo "   ✅ Product->storeStocks relation works\n";
    }

    $warehouse = Warehouse::with('warehouseStocks')->first();
    if ($warehouse) {
        echo "   ✅ Warehouse->warehouseStocks relation works\n";
    }

    $toko = Toko::with('storeStocks')->first();
    if ($toko) {
        echo "   ✅ Toko->storeStocks relation works\n";
    }

    echo "\n";
} catch (Exception $e) {
    echo "   ❌ Relations test failed: " . $e->getMessage() . "\n\n";
}

// Test 5: Stock Calculations
echo "5️⃣ Testing Stock Calculations...\n";

if ($firstProduct && $firstWarehouse && $firstToko) {
    $warehouseStock = WarehouseStock::getStock($firstProduct->id, $firstWarehouse->id);
    $storeStock = StoreStock::getStock($firstProduct->id, $firstToko->id);

    echo "   - Warehouse stock for product {$firstProduct->id}: {$warehouseStock}\n";
    echo "   - Store stock for product {$firstProduct->id}: {$storeStock}\n";
    echo "   ✅ Stock calculation methods work\n\n";
}

echo "🎉 TESTING COMPLETED!\n";
echo "====================\n";
echo "Ready for purchase testing in browser.\n";
