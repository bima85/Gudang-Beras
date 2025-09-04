<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Unit;
use App\Models\User;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use Illuminate\Support\Facades\Auth;

echo "=== PRODUCT MODULE TESTING - Phase 1: Basic Model ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

// Check database table structure
echo PHP_EOL . "=== PRODUCT TABLE STRUCTURE ===" . PHP_EOL;
try {
    $products = Product::all();
    echo "✅ Product table accessible" . PHP_EOL;
    echo "Current product count: " . $products->count() . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error accessing product table: " . $e->getMessage() . PHP_EOL;
    exit;
}

// Test Model properties
echo PHP_EOL . "=== MODEL STRUCTURE TEST ===" . PHP_EOL;
$productModel = new Product();
$fillable = $productModel->getFillable();
echo "Fillable fields: " . implode(', ', $fillable) . PHP_EOL;

$expectedFields = [
    'name',
    'description',
    'category',
    'category_id',
    'subcategory_id',
    'unit_id',
    'barcode',
    'location',
    'purchase_price',
    'sell_price',
    'min_stock'
];
$missingFields = array_diff($expectedFields, $fillable);
if (empty($missingFields)) {
    echo "✅ All expected fillable fields present" . PHP_EOL;
} else {
    echo "❌ Missing fillable fields: " . implode(', ', $missingFields) . PHP_EOL;
}

// Check for stock field (should NOT be there)
if (in_array('stock', $fillable)) {
    echo "❌ CRITICAL: 'stock' field found in fillable - should be removed" . PHP_EOL;
} else {
    echo "✅ GOOD: 'stock' field not in fillable (using separate stock tables)" . PHP_EOL;
}

// Test relationships
echo PHP_EOL . "=== RELATIONSHIP TESTING ===" . PHP_EOL;

// Check available dependencies
$categories = Category::all();
$subcategories = Subcategory::all();
$units = Unit::all();

echo "Available dependencies:" . PHP_EOL;
echo "- Categories: " . $categories->count() . PHP_EOL;
echo "- Subcategories: " . $subcategories->count() . PHP_EOL;
echo "- Units: " . $units->count() . PHP_EOL;

if ($categories->count() == 0 || $subcategories->count() == 0 || $units->count() == 0) {
    echo "❌ Missing required dependencies for product creation" . PHP_EOL;
    exit;
}

// Test relationships
try {
    $testProduct = new Product();

    $categoryRelation = $testProduct->category();
    echo "✅ Category relationship (belongsTo) available" . PHP_EOL;

    $subcategoryRelation = $testProduct->subcategory();
    echo "✅ Subcategory relationship (belongsTo) available" . PHP_EOL;

    $unitRelation = $testProduct->unit();
    echo "✅ Unit relationship (belongsTo) available" . PHP_EOL;

    $warehouseStocksRelation = $testProduct->warehouseStocks();
    echo "✅ WarehouseStocks relationship (hasMany) available" . PHP_EOL;

    $storeStocksRelation = $testProduct->storeStocks();
    echo "✅ StoreStocks relationship (hasMany) available" . PHP_EOL;

    $warehouseStockRelation = $testProduct->warehouseStock();
    echo "✅ WarehouseStock relationship (hasOne) available" . PHP_EOL;

    $storeStockRelation = $testProduct->storeStock();
    echo "✅ StoreStock relationship (hasOne) available" . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Relationship error: " . $e->getMessage() . PHP_EOL;
}

// Check existing products with relationships
echo PHP_EOL . "=== EXISTING PRODUCTS ===" . PHP_EOL;
$existingProducts = Product::with(['category', 'subcategory', 'unit'])->get();

if ($existingProducts->count() > 0) {
    foreach ($existingProducts->take(5) as $product) {
        echo "- {$product->name} (Barcode: {$product->barcode})" . PHP_EOL;
        echo "  Category: " . ($product->category ? $product->category->name : 'N/A') . PHP_EOL;
        echo "  Subcategory: " . ($product->subcategory ? $product->subcategory->name : 'N/A') . PHP_EOL;
        echo "  Unit: " . ($product->unit ? $product->unit->name : 'N/A') . PHP_EOL;
        echo "  Min Stock: {$product->min_stock}" . PHP_EOL;
        echo "  ---" . PHP_EOL;
    }

    if ($existingProducts->count() > 5) {
        echo "... and " . ($existingProducts->count() - 5) . " more products" . PHP_EOL;
    }
} else {
    echo "No existing products found" . PHP_EOL;
}

// Check stock tables (should be separate)
echo PHP_EOL . "=== STOCK SEPARATION CHECK ===" . PHP_EOL;
try {
    $warehouseStockCount = WarehouseStock::count();
    $storeStockCount = StoreStock::count();

    echo "WarehouseStock records: " . $warehouseStockCount . PHP_EOL;
    echo "StoreStock records: " . $storeStockCount . PHP_EOL;
    echo "✅ Stock data stored in separate tables (not in products table)" . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error accessing stock tables: " . $e->getMessage() . PHP_EOL;
}

// Permission check
echo PHP_EOL . "=== PERMISSION CHECK ===" . PHP_EOL;
$permissions = $adminUser->getAllPermissions();
$productPermissions = $permissions->filter(function ($permission) {
    return str_contains($permission->name, 'product');
});

if ($productPermissions->count() > 0) {
    echo "Product-related permissions:" . PHP_EOL;
    foreach ($productPermissions as $permission) {
        echo "- " . $permission->name . PHP_EOL;
    }
} else {
    echo "⚠️ No specific product permissions found - checking super-admin status" . PHP_EOL;
    $isSuperAdmin = $adminUser->hasRole('super-admin');
    echo "Super-admin role: " . ($isSuperAdmin ? "✅ Yes" : "❌ No") . PHP_EOL;
}

echo PHP_EOL . "✅ PRODUCT MODEL TESTING COMPLETED" . PHP_EOL;
