<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Apps\PurchaseController;
use App\Models\Purchase;
use App\Models\StockMovement;
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

echo "🔍 TEST: Stock Movements Recording" . PHP_EOL;
echo "==================================" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

// Get required data
$supplier = Supplier::first();
$warehouse = Warehouse::first();
$product = Product::first();
$category = Category::first();
$subcategory = Subcategory::first();
$unit = Unit::first();
$toko = Toko::first();

echo "✅ Setup data berhasil" . PHP_EOL;

// Check stock movements before
$movementsBefore = StockMovement::count();
echo "Stock Movements sebelum test: {$movementsBefore}" . PHP_EOL;

$controller = new PurchaseController();

try {
    $purchaseData = [
        'supplier_name' => $supplier->name,
        'warehouse_id' => $warehouse->id,
        'toko_id' => $toko->id,
        'purchase_date' => date('Y-m-d'),
        'invoice_number' => 'MOVEMENT-TEST-' . time(),
        'items' => [
            [
                'product_id' => $product->id,
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'unit_id' => $unit->id,
                'warehouse_id' => $warehouse->id,
                'qty' => 100,
                // Auto alokasi 50-50%
                'harga_pembelian' => 5000,
                'subtotal' => 100 * 5000,
                'kuli_fee' => 0,
                'timbangan' => 0
            ]
        ]
    ];

    $request = Request::create('/dashboard/purchases', 'POST', $purchaseData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "✅ Purchase berhasil dibuat" . PHP_EOL;

    // Check stock movements after
    $movementsAfter = StockMovement::count();
    $newMovements = $movementsAfter - $movementsBefore;

    echo PHP_EOL . "=== STOCK MOVEMENTS RESULT ===" . PHP_EOL;
    echo "Stock Movements sebelum: {$movementsBefore}" . PHP_EOL;
    echo "Stock Movements sesudah: {$movementsAfter}" . PHP_EOL;
    echo "New movements: {$newMovements}" . PHP_EOL;

    if ($newMovements > 0) {
        echo "✅ Stock movements tercatat!" . PHP_EOL;

        // Show recent movements
        echo PHP_EOL . "=== RECENT STOCK MOVEMENTS ===" . PHP_EOL;
        $recentMovements = StockMovement::with(['product', 'warehouse', 'toko'])
            ->latest()
            ->take($newMovements)
            ->get();

        foreach ($recentMovements as $movement) {
            $location = $movement->warehouse_id ? "Warehouse: {$movement->warehouse->name}" : "Toko: {$movement->toko->name}";
            echo "- Type: {$movement->type} | Product: {$movement->product->name} | Qty: {$movement->quantity_in_kg} kg | {$location}" . PHP_EOL;
            echo "  Reference: {$movement->reference_type} #{$movement->reference_id} | Description: {$movement->description}" . PHP_EOL;
        }
    } else {
        echo "❌ Stock movements tidak tercatat" . PHP_EOL;
    }

    // Verify purchase created
    $createdPurchase = Purchase::where('invoice_number', $purchaseData['invoice_number'])->first();
    if ($createdPurchase && $createdPurchase->items->count() > 0) {
        $item = $createdPurchase->items->first();
        echo PHP_EOL . "=== PURCHASE VERIFICATION ===" . PHP_EOL;
        echo "Purchase: {$createdPurchase->invoice_number}" . PHP_EOL;
        echo "Item: Qty {$item->qty} → Gudang {$item->qty_gudang} + Toko {$item->qty_toko}" . PHP_EOL;

        $gudangPercent = round(($item->qty_gudang / $item->qty) * 100, 1);
        $tokoPercent = round(($item->qty_toko / $item->qty) * 100, 1);
        echo "Allocation: {$gudangPercent}% Gudang + {$tokoPercent}% Toko" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "🎯 KESIMPULAN:" . PHP_EOL;
if ($newMovements >= 2) {
    echo "✅ Stock movements berfungsi dengan baik!" . PHP_EOL;
    echo "✅ Setiap purchase mencatat movement untuk gudang dan toko" . PHP_EOL;
} else {
    echo "⚠️ Stock movements perlu investigasi lebih lanjut" . PHP_EOL;
}
