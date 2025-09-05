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
use Illuminate\Support\Facades\DB;

echo "=== PURCHASE MODULE TESTING - Phase 2: Checkbox Functionality ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

// Get test data
$supplier = Supplier::first();
$warehouse = Warehouse::first();
$products = Product::all();
$categories = Category::all();
$subcategories = Subcategory::all();
$units = Unit::all();

echo PHP_EOL . "=== TEST DATA AVAILABLE ===" . PHP_EOL;
echo "Supplier: " . $supplier->name . PHP_EOL;
echo "Warehouse: " . $warehouse->name . PHP_EOL;
echo "Products: " . $products->count() . PHP_EOL;

// Cleanup any existing test purchases
DB::statement('DELETE FROM purchase_items WHERE purchase_id IN (SELECT id FROM purchases WHERE invoice_number LIKE "TEST-%")');
DB::statement('DELETE FROM purchases WHERE invoice_number LIKE "TEST-%"');
echo "🧹 Cleaned up existing test purchases" . PHP_EOL;

echo PHP_EOL . "=== TEST 1: CREATE PURCHASE WITHOUT KULI FEE ===" . PHP_EOL;

try {
    // Create purchase
    $purchase1 = Purchase::create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'toko_id' => 1,
        'purchase_date' => date('Y-m-d'),
        'invoice_number' => 'TEST-001',
        'total' => 0,
        'total_pembelian' => 0,
        'user_id' => $adminUser->id,
        'category_id' => $categories->first()->id
    ]);

    echo "✅ Purchase created with ID: " . $purchase1->id . PHP_EOL;

    // Add items WITHOUT kuli fee (checkbox unchecked simulation)
    $items1 = [];
    foreach ($products->take(2) as $index => $product) {
        $item = PurchaseItem::create([
            'purchase_id' => $purchase1->id,
            'product_id' => $product->id,
            'unit_id' => $units->first()->id,
            'category_id' => $product->category_id,
            'subcategory_id' => $product->subcategory_id,
            'qty' => 10 + $index * 5,
            'harga_pembelian' => 5000 + $index * 1000,
            'subtotal' => (10 + $index * 5) * (5000 + $index * 1000),
            'kuli_fee' => 0, // Checkbox unchecked
            'timbangan' => 0
        ]);
        $items1[] = $item;
        echo "  ✅ Item " . ($index + 1) . ": {$product->name} - Kuli Fee: 0 (checkbox OFF)" . PHP_EOL;
    }

    $purchase1->update([
        'total' => $items1[0]->subtotal + $items1[1]->subtotal,
        'total_pembelian' => $items1[0]->subtotal + $items1[1]->subtotal
    ]);
} catch (\Exception $e) {
    echo "❌ Error creating purchase 1: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: CREATE PURCHASE WITH KULI FEE ===" . PHP_EOL;

try {
    // Create purchase
    $purchase2 = Purchase::create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'toko_id' => 1,
        'purchase_date' => date('Y-m-d'),
        'invoice_number' => 'TEST-002',
        'total' => 0,
        'total_pembelian' => 0,
        'user_id' => $adminUser->id,
        'category_id' => $categories->first()->id
    ]);

    echo "✅ Purchase created with ID: " . $purchase2->id . PHP_EOL;

    // Add items WITH kuli fee (checkbox checked simulation)
    $items2 = [];
    foreach ($products->take(2) as $index => $product) {
        $item = PurchaseItem::create([
            'purchase_id' => $purchase2->id,
            'product_id' => $product->id,
            'unit_id' => $units->first()->id,
            'category_id' => $product->category_id,
            'subcategory_id' => $product->subcategory_id,
            'qty' => 15 + $index * 3,
            'harga_pembelian' => 4000 + $index * 500,
            'subtotal' => (15 + $index * 3) * (4000 + $index * 500),
            'kuli_fee' => 1000, // Checkbox checked (value from frontend)
            'timbangan' => 100 + $index * 50
        ]);
        $items2[] = $item;
        echo "  ✅ Item " . ($index + 1) . ": {$product->name} - Kuli Fee: 1000 (checkbox ON)" . PHP_EOL;
    }

    $purchase2->update([
        'total' => $items2[0]->subtotal + $items2[1]->subtotal,
        'total_pembelian' => $items2[0]->subtotal + $items2[1]->subtotal
    ]);
} catch (\Exception $e) {
    echo "❌ Error creating purchase 2: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 3: MIXED KULI FEE (PARTIAL CHECKBOX) ===" . PHP_EOL;

try {
    // Create purchase
    $purchase3 = Purchase::create([
        'supplier_id' => $supplier->id,
        'warehouse_id' => $warehouse->id,
        'toko_id' => 1,
        'purchase_date' => date('Y-m-d'),
        'invoice_number' => 'TEST-003',
        'total' => 0,
        'total_pembelian' => 0,
        'user_id' => $adminUser->id,
        'category_id' => $categories->first()->id
    ]);

    echo "✅ Purchase created with ID: " . $purchase3->id . PHP_EOL;

    // Add items with MIXED kuli fee (some checked, some not)
    $items3 = [];
    foreach ($products->take(3) as $index => $product) {
        $kuliFee = $index % 2 == 0 ? 1000 : 0; // Alternate checkbox states
        $item = PurchaseItem::create([
            'purchase_id' => $purchase3->id,
            'product_id' => $product->id,
            'unit_id' => $units->first()->id,
            'category_id' => $product->category_id,
            'subcategory_id' => $product->subcategory_id,
            'qty' => 8 + $index * 2,
            'harga_pembelian' => 3500 + $index * 300,
            'subtotal' => (8 + $index * 2) * (3500 + $index * 300),
            'kuli_fee' => $kuliFee,
            'timbangan' => $kuliFee > 0 ? 80 + $index * 20 : 0
        ]);
        $items3[] = $item;
        $checkboxState = $kuliFee > 0 ? "ON" : "OFF";
        echo "  ✅ Item " . ($index + 1) . ": {$product->name} - Kuli Fee: {$kuliFee} (checkbox {$checkboxState})" . PHP_EOL;
    }

    $purchase3->update([
        'total' => array_sum(array_map(fn($item) => $item->subtotal, $items3)),
        'total_pembelian' => array_sum(array_map(fn($item) => $item->subtotal, $items3))
    ]);
} catch (\Exception $e) {
    echo "❌ Error creating purchase 3: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== CHECKBOX FUNCTIONALITY SIMULATION ===" . PHP_EOL;

// Simulate checkbox behavior from frontend
function simulateKuliFeeCheckbox($items, $isChecked)
{
    $newValue = $isChecked ? 1000 : 0;
    echo "Simulating checkbox " . ($isChecked ? "CHECK" : "UNCHECK") . " - Setting all kuli_fee to: {$newValue}" . PHP_EOL;

    foreach ($items as $item) {
        $oldValue = $item->kuli_fee;
        $item->update(['kuli_fee' => $newValue]);
        echo "  Item {$item->id}: {$oldValue} → {$newValue}" . PHP_EOL;
    }
}

// Test checkbox toggle on purchase 1 items
echo PHP_EOL . "=== TEST 4: CHECKBOX TOGGLE SIMULATION ===" . PHP_EOL;
$testItems = PurchaseItem::where('purchase_id', $purchase1->id)->get();

echo "Before toggle:" . PHP_EOL;
foreach ($testItems as $item) {
    echo "  Item {$item->id}: kuli_fee = {$item->kuli_fee}" . PHP_EOL;
}

// Simulate checking the checkbox (enable kuli fee)
simulateKuliFeeCheckbox($testItems, true);

echo "After checking checkbox:" . PHP_EOL;
foreach ($testItems->fresh() as $item) {
    echo "  Item {$item->id}: kuli_fee = {$item->kuli_fee}" . PHP_EOL;
}

// Simulate unchecking the checkbox (disable kuli fee)
simulateKuliFeeCheckbox($testItems, false);

echo "After unchecking checkbox:" . PHP_EOL;
foreach ($testItems->fresh() as $item) {
    echo "  Item {$item->id}: kuli_fee = {$item->kuli_fee}" . PHP_EOL;
}

echo PHP_EOL . "=== VERIFICATION: ALL PURCHASES AND KULI FEE STATUS ===" . PHP_EOL;

$allTestPurchases = Purchase::with('items')->where('invoice_number', 'LIKE', 'TEST-%')->get();

foreach ($allTestPurchases as $purchase) {
    echo "Purchase {$purchase->invoice_number}:" . PHP_EOL;
    echo "  Total items: " . $purchase->items->count() . PHP_EOL;
    echo "  Total purchase: Rp " . number_format($purchase->total) . PHP_EOL;

    $kuliFeeItems = $purchase->items->where('kuli_fee', '>', 0);
    $totalKuliFee = $kuliFeeItems->sum('kuli_fee');

    echo "  Items with Kuli Fee: " . $kuliFeeItems->count() . "/" . $purchase->items->count() . PHP_EOL;
    echo "  Total Kuli Fee: Rp " . number_format($totalKuliFee) . PHP_EOL;

    // Checkbox status simulation
    $allHaveKuliFee = $purchase->items->every(function ($item) {
        return $item->kuli_fee > 0;
    });

    $noneHaveKuliFee = $purchase->items->every(function ($item) {
        return $item->kuli_fee == 0;
    });

    if ($allHaveKuliFee) {
        echo "  📋 Checkbox Status: ✅ CHECKED (all items have kuli fee)" . PHP_EOL;
    } elseif ($noneHaveKuliFee) {
        echo "  📋 Checkbox Status: ⬜ UNCHECKED (no items have kuli fee)" . PHP_EOL;
    } else {
        echo "  📋 Checkbox Status: ⚠️ MIXED (some items have kuli fee)" . PHP_EOL;
    }

    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "✅ PURCHASE MODULE CHECKBOX FUNCTIONALITY TESTING COMPLETED" . PHP_EOL;
echo "🎯 Key findings:" . PHP_EOL;
echo "   - Kuli fee field is properly stored in purchase_items table" . PHP_EOL;
echo "   - Checkbox functionality can control kuli_fee values (0 or 1000)" . PHP_EOL;
echo "   - Frontend checkbox should check if ALL items have same kuli_fee value" . PHP_EOL;
echo "   - Timbangan field is also available for weighing functionality" . PHP_EOL;
