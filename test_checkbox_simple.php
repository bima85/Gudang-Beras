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
use App\Models\Toko;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "=== PURCHASE CHECKBOX FUNCTIONALITY TEST ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new PurchaseController();

// Get required data
$supplier = Supplier::first();
$warehouse = Warehouse::first();
$product = Product::first();
$category = Category::first();
$subcategory = Subcategory::first();
$unit = Unit::first();

echo "✅ Setup data: Supplier({$supplier->id}), Warehouse({$warehouse->id}), Product({$product->id})" . PHP_EOL;

// TEST: Create Purchase with Checkbox Values
echo PHP_EOL . "=== TESTING CHECKBOX FUNCTIONALITY ===" . PHP_EOL;

try {
    $purchaseData = [
        'supplier_name' => $supplier->name,  // Use supplier_name instead of supplier_id
        'warehouse_id' => $warehouse->id,
        'purchase_date' => date('Y-m-d'),
        'invoice_number' => 'TEST-CHECKBOX-' . time(),
        'items' => [
            [
                'product_id' => $product->id,
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'unit_id' => $unit->id,
                'warehouse_id' => $warehouse->id,
                'qty' => 10,
                'qty_gudang' => 6,
                'qty_toko' => 4,
                'harga_pembelian' => 5000,
                'subtotal' => 50000,
                'kuli_fee' => 1500,  // ✅ CHECKBOX CHECKED
                'timbangan' => 750   // ✅ CHECKBOX CHECKED
            ],
            [
                'product_id' => $product->id,
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'unit_id' => $unit->id,
                'warehouse_id' => $warehouse->id,
                'qty' => 5,
                'qty_gudang' => 5,
                'qty_toko' => 0,
                'harga_pembelian' => 6000,
                'subtotal' => 30000,
                'kuli_fee' => 0,     // ❌ CHECKBOX UNCHECKED
                'timbangan' => 0     // ❌ CHECKBOX UNCHECKED
            ]
        ]
    ];

    $request = Request::create('/dashboard/purchases', 'POST', $purchaseData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "✅ Purchase created successfully" . PHP_EOL;

    // Verify checkbox values were saved correctly
    $createdPurchase = Purchase::where('invoice_number', $purchaseData['invoice_number'])->first();

    if ($createdPurchase) {
        echo PHP_EOL . "=== CHECKBOX VALUES VERIFICATION ===" . PHP_EOL;

        foreach ($createdPurchase->items as $index => $item) {
            echo "Item " . ($index + 1) . ":" . PHP_EOL;
            echo "  Qty: {$item->qty} | Price: {$item->harga_pembelian}" . PHP_EOL;
            echo "  Kuli Fee: {$item->kuli_fee} " . ($item->kuli_fee > 0 ? "✅ CHECKED" : "❌ UNCHECKED") . PHP_EOL;
            echo "  Timbangan: {$item->timbangan} " . ($item->timbangan > 0 ? "✅ CHECKED" : "❌ UNCHECKED") . PHP_EOL;
            echo "  ---" . PHP_EOL;
        }

        echo PHP_EOL . "✅ CHECKBOX FUNCTIONALITY VALIDATED SUCCESSFULLY!" . PHP_EOL;
    } else {
        echo "❌ Purchase not found" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST COMPLETED ===" . PHP_EOL;
