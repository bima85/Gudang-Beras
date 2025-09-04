<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\ProductController;
use App\Models\User;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Unit;
use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

echo "=== PRODUCT CONTROLLER TESTING - Phase 2 ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new ProductController();

echo PHP_EOL . "=== TEST 1: Index Method ===" . PHP_EOL;

try {
    $request = Request::create('/dashboard/products', 'GET');
    app()->instance('request', $request);

    $response = $controller->index();
    echo "✅ Index method executed successfully" . PHP_EOL;
    echo "Response type: " . get_class($response) . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Index method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: Create Method ===" . PHP_EOL;

try {
    $response = $controller->create();
    echo "✅ Create method executed successfully" . PHP_EOL;
    echo "Response type: " . get_class($response) . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Create method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 3: Store Method - NO STOCK CREATION TEST ===" . PHP_EOL;

try {
    // Get required dependencies
    $category = Category::first();
    $subcategory = Subcategory::first();
    $unit = Unit::first();

    if (!$category || !$subcategory || !$unit) {
        echo "❌ Missing dependencies for product creation" . PHP_EOL;
    } else {
        // Count stock tables before creation
        $warehouseStockBefore = WarehouseStock::count();
        $storeStockBefore = StoreStock::count();

        echo "Stock counts BEFORE product creation:" . PHP_EOL;
        echo "- WarehouseStock: {$warehouseStockBefore}" . PHP_EOL;
        echo "- StoreStock: {$storeStockBefore}" . PHP_EOL;

        $storeData = [
            'name' => 'Test Product No Auto Stock',
            'barcode' => 'TEST-NO-STOCK-' . time(),
            'description' => 'Test product to ensure no automatic stock creation',
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'unit_id' => $unit->id,
            'min_stock' => 10,
            'purchase_price' => 5000,
            'sell_price' => 7000,
            'location' => 'TEST-LOC'
        ];

        $request = Request::create('/dashboard/products', 'POST', $storeData);
        app()->instance('request', $request);

        $response = $controller->store($request);
        echo "✅ Store method executed successfully" . PHP_EOL;
        echo "Response type: " . get_class($response) . PHP_EOL;

        // Verify the product was created
        $createdProduct = Product::where('barcode', $storeData['barcode'])->first();
        if ($createdProduct) {
            echo "✅ Product created in database: " . $createdProduct->name . PHP_EOL;
            echo "Product details:" . PHP_EOL;
            echo "- ID: {$createdProduct->id}" . PHP_EOL;
            echo "- Category: " . $createdProduct->category->name . PHP_EOL;
            echo "- Subcategory: " . $createdProduct->subcategory->name . PHP_EOL;
            echo "- Unit: " . $createdProduct->unit->name . PHP_EOL;
            echo "- Min Stock: {$createdProduct->min_stock}" . PHP_EOL;
            echo "- Purchase Price: {$createdProduct->purchase_price}" . PHP_EOL;
            echo "- Sell Price: {$createdProduct->sell_price}" . PHP_EOL;

            // Count stock tables after creation - CRITICAL TEST
            $warehouseStockAfter = WarehouseStock::count();
            $storeStockAfter = StoreStock::count();

            echo PHP_EOL . "Stock counts AFTER product creation:" . PHP_EOL;
            echo "- WarehouseStock: {$warehouseStockAfter}" . PHP_EOL;
            echo "- StoreStock: {$storeStockAfter}" . PHP_EOL;

            if ($warehouseStockAfter == $warehouseStockBefore && $storeStockAfter == $storeStockBefore) {
                echo "✅ EXCELLENT: NO automatic stock records created" . PHP_EOL;
                echo "✅ Product creation does NOT auto-create stock entries" . PHP_EOL;
            } else {
                echo "❌ CRITICAL ISSUE: Automatic stock records were created!" . PHP_EOL;
                echo "❌ Warehouse stock change: " . ($warehouseStockAfter - $warehouseStockBefore) . PHP_EOL;
                echo "❌ Store stock change: " . ($storeStockAfter - $storeStockBefore) . PHP_EOL;

                // Show what was created
                if ($warehouseStockAfter > $warehouseStockBefore) {
                    $newWarehouseStocks = WarehouseStock::where('product_id', $createdProduct->id)->get();
                    foreach ($newWarehouseStocks as $stock) {
                        echo "❌ Auto-created WarehouseStock: Product {$stock->product_id}, Qty {$stock->qty_in_kg}" . PHP_EOL;
                    }
                }

                if ($storeStockAfter > $storeStockBefore) {
                    $newStoreStocks = StoreStock::where('product_id', $createdProduct->id)->get();
                    foreach ($newStoreStocks as $stock) {
                        echo "❌ Auto-created StoreStock: Product {$stock->product_id}, Qty {$stock->qty_in_kg}" . PHP_EOL;
                    }
                }
            }
        }
    }
} catch (\Exception $e) {
    echo "❌ Store method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 4: Multiple Product Creation Test ===" . PHP_EOL;

try {
    $category = Category::first();
    $subcategory = Subcategory::first();
    $unit = Unit::first();

    $stockCountBefore = WarehouseStock::count() + StoreStock::count();

    // Create 3 more products
    for ($i = 1; $i <= 3; $i++) {
        $storeData = [
            'name' => "Test Product Batch {$i}",
            'barcode' => 'BATCH-' . $i . '-' . time(),
            'description' => "Batch test product {$i}",
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'unit_id' => $unit->id,
            'min_stock' => 5,
        ];

        $request = Request::create('/dashboard/products', 'POST', $storeData);
        app()->instance('request', $request);

        $controller->store($request);
        echo "✅ Created batch product {$i}" . PHP_EOL;
    }

    $stockCountAfter = WarehouseStock::count() + StoreStock::count();
    $stockIncrease = $stockCountAfter - $stockCountBefore;

    if ($stockIncrease == 0) {
        echo "✅ PERFECT: No stock records created for 3 products" . PHP_EOL;
    } else {
        echo "❌ WARNING: {$stockIncrease} stock records were auto-created" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Batch creation error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== FINAL SUMMARY ===" . PHP_EOL;
$finalProducts = Product::with(['category', 'subcategory', 'unit'])->get();
$finalWarehouseStock = WarehouseStock::count();
$finalStoreStock = StoreStock::count();

echo "Final counts:" . PHP_EOL;
echo "- Products: " . $finalProducts->count() . PHP_EOL;
echo "- WarehouseStock records: " . $finalWarehouseStock . PHP_EOL;
echo "- StoreStock records: " . $finalStoreStock . PHP_EOL;

echo PHP_EOL . "Created products:" . PHP_EOL;
foreach ($finalProducts as $product) {
    echo "- {$product->name} (Barcode: {$product->barcode})" . PHP_EOL;
}

if ($finalWarehouseStock == 0 && $finalStoreStock == 0) {
    echo PHP_EOL . "🎉 SUCCESS: Product creation does NOT auto-create stock!" . PHP_EOL;
} else {
    echo PHP_EOL . "⚠️ WARNING: Some stock records exist - need investigation" . PHP_EOL;
}

echo PHP_EOL . "✅ PRODUCT CONTROLLER TESTING COMPLETED" . PHP_EOL;
