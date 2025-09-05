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
use Illuminate\Validation\ValidationException;

echo "=== PRODUCT VALIDATION & CRUD TESTING - Phase 3 ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new ProductController();

echo PHP_EOL . "=== TEST 1: Validation - Empty Fields ===" . PHP_EOL;

try {
    $emptyData = [
        'name' => '',
        'barcode' => '',
        'category_id' => '',
        'subcategory_id' => '',
        'unit_id' => '',
        'min_stock' => ''
    ];

    $request = Request::create('/dashboard/products', 'POST', $emptyData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "❌ Should have failed validation but didn't" . PHP_EOL;
} catch (ValidationException $e) {
    echo "✅ Validation working - Empty fields rejected" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Unexpected error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: Validation - Duplicate Barcode ===" . PHP_EOL;

try {
    $existingProduct = Product::first();
    if (!$existingProduct) {
        echo "❌ No existing products for duplicate test" . PHP_EOL;
    } else {
        $duplicateData = [
            'name' => 'Duplicate Barcode Test',
            'barcode' => $existingProduct->barcode, // Use existing barcode
            'description' => 'Testing duplicate barcode validation',
            'category_id' => Category::first()->id,
            'subcategory_id' => Subcategory::first()->id,
            'unit_id' => Unit::first()->id,
            'min_stock' => 5
        ];

        $request = Request::create('/dashboard/products', 'POST', $duplicateData);
        app()->instance('request', $request);

        $response = $controller->store($request);
        echo "❌ Should have failed duplicate validation but didn't" . PHP_EOL;
    }
} catch (ValidationException $e) {
    echo "✅ Duplicate barcode validation working" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Unexpected error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 3: Validation - Invalid Foreign Keys ===" . PHP_EOL;

try {
    $invalidData = [
        'name' => 'Invalid FK Test',
        'barcode' => 'INVALID-FK-' . time(),
        'description' => 'Testing invalid foreign key validation',
        'category_id' => 99999, // Non-existent category
        'subcategory_id' => 99999, // Non-existent subcategory
        'unit_id' => 99999, // Non-existent unit
        'min_stock' => 5
    ];

    $request = Request::create('/dashboard/products', 'POST', $invalidData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "❌ Should have failed FK validation but didn't" . PHP_EOL;
} catch (ValidationException $e) {
    echo "✅ Foreign key validation working" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Unexpected error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 4: Update Method Test ===" . PHP_EOL;

try {
    $product = Product::first();
    if (!$product) {
        echo "❌ No products available for update testing" . PHP_EOL;
    } else {
        $stockCountBefore = WarehouseStock::count() + StoreStock::count();

        $updateData = [
            'name' => $product->name . ' Updated',
            'barcode' => $product->barcode, // Same barcode should be allowed in update
            'description' => ($product->description ?? '') . ' - Updated via test',
            'category_id' => $product->category_id,
            'subcategory_id' => $product->subcategory_id,
            'unit_id' => $product->unit_id,
            'min_stock' => $product->min_stock + 5,
            'purchase_price' => 6000,
            'sell_price' => 8000
        ];

        $request = Request::create('/dashboard/products/' . $product->id, 'PUT', $updateData);
        app()->instance('request', $request);

        $response = $controller->update($request, $product);
        echo "✅ Update method executed successfully" . PHP_EOL;

        // Verify update
        $product->refresh();
        echo "Updated name: " . $product->name . PHP_EOL;
        echo "Updated min_stock: " . $product->min_stock . PHP_EOL;

        // Check no stock creation on update
        $stockCountAfter = WarehouseStock::count() + StoreStock::count();
        if ($stockCountAfter == $stockCountBefore) {
            echo "✅ No stock records created during update" . PHP_EOL;
        } else {
            echo "❌ Stock records created during update!" . PHP_EOL;
        }
    }
} catch (\Exception $e) {
    echo "❌ Update method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 5: Edit Method Test ===" . PHP_EOL;

try {
    $product = Product::first();
    if (!$product) {
        echo "❌ No products available for edit testing" . PHP_EOL;
    } else {
        $response = $controller->edit($product);
        echo "✅ Edit method executed successfully" . PHP_EOL;
        echo "Response type: " . get_class($response) . PHP_EOL;
        echo "Editing product: " . $product->name . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Edit method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 6: Destroy Method Test ===" . PHP_EOL;

try {
    // Create a test product for deletion
    $category = Category::first();
    $subcategory = Subcategory::first();
    $unit = Unit::first();

    $testProduct = Product::create([
        'name' => 'Test Delete Product',
        'barcode' => 'TEST-DEL-' . time(),
        'description' => 'Test product for deletion',
        'category_id' => $category->id,
        'subcategory_id' => $subcategory->id,
        'unit_id' => $unit->id,
        'min_stock' => 1
    ]);

    echo "Created test product for deletion: " . $testProduct->name . PHP_EOL;

    $stockCountBefore = WarehouseStock::count() + StoreStock::count();

    $response = $controller->destroy($testProduct);
    echo "✅ Destroy method executed successfully" . PHP_EOL;
    echo "Response type: " . get_class($response) . PHP_EOL;

    // Verify deletion (soft delete)
    $deletedProduct = Product::withTrashed()->find($testProduct->id);
    if ($deletedProduct && $deletedProduct->trashed()) {
        echo "✅ Product soft deleted successfully" . PHP_EOL;
    } else {
        echo "⚠️ Product deletion behavior unclear" . PHP_EOL;
    }

    // Check no stock impact on delete
    $stockCountAfter = WarehouseStock::count() + StoreStock::count();
    if ($stockCountAfter == $stockCountBefore) {
        echo "✅ No stock records affected by deletion" . PHP_EOL;
    } else {
        echo "❌ Stock records affected by deletion!" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Destroy method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 7: Stock Independence Verification ===" . PHP_EOL;

$totalProducts = Product::count();
$totalWarehouseStock = WarehouseStock::count();
$totalStoreStock = StoreStock::count();

echo "Stock independence check:" . PHP_EOL;
echo "- Total Products: {$totalProducts}" . PHP_EOL;
echo "- Total WarehouseStock: {$totalWarehouseStock}" . PHP_EOL;
echo "- Total StoreStock: {$totalStoreStock}" . PHP_EOL;

if ($totalWarehouseStock == 0 && $totalStoreStock == 0) {
    echo "✅ PERFECT: Products exist but NO automatic stock records" . PHP_EOL;
    echo "✅ Stock management is completely separated from product management" . PHP_EOL;
} else {
    echo "⚠️ Some stock records exist - may be from other processes" . PHP_EOL;
}

echo PHP_EOL . "=== FINAL PRODUCT SUMMARY ===" . PHP_EOL;
$finalProducts = Product::all();
echo "Total products in system: " . $finalProducts->count() . PHP_EOL;

foreach ($finalProducts as $product) {
    echo "- {$product->name} (Barcode: {$product->barcode}) - Min Stock: {$product->min_stock}" . PHP_EOL;
}

echo PHP_EOL . "✅ PRODUCT VALIDATION & CRUD TESTING COMPLETED" . PHP_EOL;
