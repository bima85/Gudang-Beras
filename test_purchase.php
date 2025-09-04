<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "=== PURCHASE MODULE TESTING - Phase 1: Basic Structure ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

// Check database table structure
echo PHP_EOL . "=== PURCHASE TABLE STRUCTURE ===" . PHP_EOL;
try {
    $purchases = Purchase::all();
    echo "✅ Purchase table accessible" . PHP_EOL;
    echo "Current purchase count: " . $purchases->count() . PHP_EOL;

    $purchaseItems = PurchaseItem::all();
    echo "✅ PurchaseItem table accessible" . PHP_EOL;
    echo "Current purchase item count: " . $purchaseItems->count() . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error accessing purchase tables: " . $e->getMessage() . PHP_EOL;
    exit;
}

// Test Model properties
echo PHP_EOL . "=== PURCHASE MODEL STRUCTURE TEST ===" . PHP_EOL;
$purchaseModel = new Purchase();
$fillable = $purchaseModel->getFillable();
echo "Purchase fillable fields: " . implode(', ', $fillable) . PHP_EOL;

$purchaseItemModel = new PurchaseItem();
$itemFillable = $purchaseItemModel->getFillable();
echo "PurchaseItem fillable fields: " . implode(', ', $itemFillable) . PHP_EOL;

// Check for kuli_fee field (important for checkbox functionality)
if (in_array('kuli_fee', $itemFillable)) {
    echo "✅ 'kuli_fee' field found in PurchaseItem fillable (needed for checkbox)" . PHP_EOL;
} else {
    echo "❌ 'kuli_fee' field NOT found in PurchaseItem fillable" . PHP_EOL;
}

// Check for timbangan field
if (in_array('timbangan', $itemFillable)) {
    echo "✅ 'timbangan' field found in PurchaseItem fillable" . PHP_EOL;
} else {
    echo "⚠️ 'timbangan' field not in PurchaseItem fillable (may be in Purchase table)" . PHP_EOL;
}

// Check available dependencies
echo PHP_EOL . "=== DEPENDENCY CHECK ===" . PHP_EOL;
$suppliers = Supplier::all();
$warehouses = Warehouse::all();
$products = Product::all();
$categories = Category::all();
$subcategories = Subcategory::all();
$units = Unit::all();

echo "Available dependencies:" . PHP_EOL;
echo "- Suppliers: " . $suppliers->count() . PHP_EOL;
echo "- Warehouses: " . $warehouses->count() . PHP_EOL;
echo "- Products: " . $products->count() . PHP_EOL;
echo "- Categories: " . $categories->count() . PHP_EOL;
echo "- Subcategories: " . $subcategories->count() . PHP_EOL;
echo "- Units: " . $units->count() . PHP_EOL;

if ($suppliers->count() == 0) {
    echo "❌ No suppliers found - creating test supplier..." . PHP_EOL;
    $testSupplier = Supplier::create([
        'name' => 'Test Supplier',
        'phone' => '081234567890',
        'address' => 'Test Address'
    ]);
    echo "✅ Created test supplier: " . $testSupplier->name . PHP_EOL;
}

if ($warehouses->count() == 0) {
    echo "❌ No warehouses found - creating test warehouse..." . PHP_EOL;
    $testWarehouse = Warehouse::create([
        'name' => 'Test Warehouse'
    ]);
    echo "✅ Created test warehouse: " . $testWarehouse->name . PHP_EOL;
}

// Test relationships
echo PHP_EOL . "=== RELATIONSHIP TESTING ===" . PHP_EOL;

try {
    $testPurchase = new Purchase();

    $supplierRelation = $testPurchase->supplier();
    echo "✅ Purchase->Supplier relationship (belongsTo) available" . PHP_EOL;

    $warehouseRelation = $testPurchase->warehouse();
    echo "✅ Purchase->Warehouse relationship (belongsTo) available" . PHP_EOL;

    $itemsRelation = $testPurchase->items();
    echo "✅ Purchase->Items relationship (hasMany) available" . PHP_EOL;

    $testPurchaseItem = new PurchaseItem();

    $purchaseRelation = $testPurchaseItem->purchase();
    echo "✅ PurchaseItem->Purchase relationship (belongsTo) available" . PHP_EOL;

    $productRelation = $testPurchaseItem->product();
    echo "✅ PurchaseItem->Product relationship (belongsTo) available" . PHP_EOL;

    $unitRelation = $testPurchaseItem->unit();
    echo "✅ PurchaseItem->Unit relationship (belongsTo) available" . PHP_EOL;

    $categoryRelation = $testPurchaseItem->category();
    echo "✅ PurchaseItem->Category relationship (belongsTo) available" . PHP_EOL;

    $subcategoryRelation = $testPurchaseItem->subcategory();
    echo "✅ PurchaseItem->Subcategory relationship (belongsTo) available" . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Relationship error: " . $e->getMessage() . PHP_EOL;
}

// Check existing purchases
echo PHP_EOL . "=== EXISTING PURCHASES ===" . PHP_EOL;
$existingPurchases = Purchase::with(['supplier', 'warehouse', 'items'])->get();

if ($existingPurchases->count() > 0) {
    foreach ($existingPurchases->take(3) as $purchase) {
        echo "- Purchase ID: {$purchase->id}" . PHP_EOL;
        echo "  Supplier: " . ($purchase->supplier ? $purchase->supplier->name : 'N/A') . PHP_EOL;
        echo "  Warehouse: " . ($purchase->warehouse ? $purchase->warehouse->name : 'N/A') . PHP_EOL;
        echo "  Items count: " . $purchase->items->count() . PHP_EOL;
        echo "  Date: {$purchase->purchase_date}" . PHP_EOL;
        echo "  ---" . PHP_EOL;
    }

    if ($existingPurchases->count() > 3) {
        echo "... and " . ($existingPurchases->count() - 3) . " more purchases" . PHP_EOL;
    }
} else {
    echo "No existing purchases found" . PHP_EOL;
}

// Permission check
echo PHP_EOL . "=== PERMISSION CHECK ===" . PHP_EOL;
$permissions = $adminUser->getAllPermissions();
$purchasePermissions = $permissions->filter(function ($permission) {
    return str_contains($permission->name, 'purchase');
});

if ($purchasePermissions->count() > 0) {
    echo "Purchase-related permissions:" . PHP_EOL;
    foreach ($purchasePermissions as $permission) {
        echo "- " . $permission->name . PHP_EOL;
    }
} else {
    echo "⚠️ No specific purchase permissions found - checking super-admin status" . PHP_EOL;
    $isSuperAdmin = $adminUser->hasRole('super-admin');
    echo "Super-admin role: " . ($isSuperAdmin ? "✅ Yes" : "❌ No") . PHP_EOL;
}

// Test Kuli Fee functionality simulation
echo PHP_EOL . "=== KULI FEE FIELD TEST ===" . PHP_EOL;
if ($existingPurchases->count() > 0) {
    $testPurchase = $existingPurchases->first();
    if ($testPurchase->items->count() > 0) {
        foreach ($testPurchase->items as $item) {
            echo "Item: {$item->id} - Kuli Fee: " . ($item->kuli_fee ?? 'NULL') . PHP_EOL;
        }
    }
} else {
    echo "No purchase items to test kuli_fee field" . PHP_EOL;
}

echo PHP_EOL . "✅ PURCHASE MODULE BASIC TESTING COMPLETED" . PHP_EOL;
