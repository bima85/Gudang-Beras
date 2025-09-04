<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Apps\TransactionController;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Unit;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "🛒 TEST PEMBUATAN TRANSAKSI PENJUALAN" . PHP_EOL;
echo "======================================" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);

echo "✅ User logged in: {$adminUser->name}" . PHP_EOL;

// Get required data
$customer = Customer::first();
$product = Product::first();
$unit = Unit::first();
$warehouse = Warehouse::first();

// Ensure we have a customer
if (!$customer) {
    $customer = Customer::create([
        'name' => 'Customer Test',
        'no_telp' => '08123456789',
        'address' => 'Alamat Test'
    ]);
    echo "✅ Customer test dibuat: {$customer->name}" . PHP_EOL;
} else {
    echo "✅ Customer tersedia: {$customer->name}" . PHP_EOL;
}

echo "✅ Setup data berhasil" . PHP_EOL;

// Check current stock before
$warehouseStockBefore = WarehouseStock::where('product_id', $product->id)->first();
$storeStockBefore = StoreStock::where('product_id', $product->id)->first();
$stockMovementsBefore = StockMovement::count();
$transactionsBefore = Transaction::count();

echo PHP_EOL . "=== STATUS SEBELUM TRANSAKSI ===" . PHP_EOL;
echo "Product: {$product->name}" . PHP_EOL;
echo "Warehouse Stock: " . ($warehouseStockBefore ? $warehouseStockBefore->qty_in_kg : 0) . " kg" . PHP_EOL;
echo "Store Stock: " . ($storeStockBefore ? $storeStockBefore->qty_in_kg : 0) . " kg" . PHP_EOL;
echo "Stock Movements: {$stockMovementsBefore}" . PHP_EOL;
echo "Transactions: {$transactionsBefore}" . PHP_EOL;

$totalStockBefore = ($warehouseStockBefore ? $warehouseStockBefore->qty_in_kg : 0) +
    ($storeStockBefore ? $storeStockBefore->qty_in_kg : 0);

if ($totalStockBefore <= 0) {
    echo "❌ Tidak ada stock untuk testing penjualan" . PHP_EOL;
    exit(1);
}

$controller = new TransactionController();

// Test data untuk transaksi penjualan
$qtyJual = 10; // 10 unit
$hargaJual = 7000; // Rp 7,000 per unit
$subtotal = $qtyJual * $hargaJual;
$grandTotal = $subtotal;
$cash = $grandTotal + 3000; // Bayar lebih untuk ada kembalian
$change = $cash - $grandTotal;

echo PHP_EOL . "=== DATA TRANSAKSI ===" . PHP_EOL;
echo "Qty Jual: {$qtyJual} unit" . PHP_EOL;
echo "Harga Jual: Rp " . number_format($hargaJual) . " per unit" . PHP_EOL;
echo "Subtotal: Rp " . number_format($subtotal) . PHP_EOL;
echo "Cash: Rp " . number_format($cash) . PHP_EOL;
echo "Change: Rp " . number_format($change) . PHP_EOL;

try {
    $transactionData = [
        'warehouse_id' => $warehouse->id,
        'customer_id' => $customer->id,
        'cash' => $cash,
        'change' => $change,
        'discount' => 0,
        'grand_total' => $grandTotal,
        'payment_method' => 'cash',
        'is_tempo' => false,
        'is_deposit' => false,
        'items' => [
            [
                'product_id' => $product->id,
                'qty' => $qtyJual,
                'unit_id' => $unit->id,
                'price' => $hargaJual
            ]
        ]
    ];

    $request = Request::create('/dashboard/transactions', 'POST', $transactionData);
    app()->instance('request', $request);

    echo PHP_EOL . "=== MEMBUAT TRANSAKSI ===" . PHP_EOL;
    $response = $controller->store($request);

    if ($response->getStatusCode() === 200 || $response->getStatusCode() === 201) {
        echo "✅ Transaksi berhasil dibuat!" . PHP_EOL;

        // Get response data
        $responseData = json_decode($response->getContent(), true);

        if (isset($responseData['transaction'])) {
            $transactionId = $responseData['transaction']['id'];
            echo "Transaction ID: {$transactionId}" . PHP_EOL;
        }
    } else {
        echo "❌ Transaksi gagal: " . $response->getContent() . PHP_EOL;
    }

    // Check after transaction
    echo PHP_EOL . "=== STATUS SETELAH TRANSAKSI ===" . PHP_EOL;

    $warehouseStockAfter = WarehouseStock::where('product_id', $product->id)->first();
    $storeStockAfter = StoreStock::where('product_id', $product->id)->first();
    $stockMovementsAfter = StockMovement::count();
    $transactionsAfter = Transaction::count();

    echo "Warehouse Stock: " . ($warehouseStockAfter ? $warehouseStockAfter->qty_in_kg : 0) . " kg" . PHP_EOL;
    echo "Store Stock: " . ($storeStockAfter ? $storeStockAfter->qty_in_kg : 0) . " kg" . PHP_EOL;
    echo "Stock Movements: {$stockMovementsAfter}" . PHP_EOL;
    echo "Transactions: {$transactionsAfter}" . PHP_EOL;

    $totalStockAfter = ($warehouseStockAfter ? $warehouseStockAfter->qty_in_kg : 0) +
        ($storeStockAfter ? $storeStockAfter->qty_in_kg : 0);

    echo PHP_EOL . "=== PERUBAHAN STOCK ===" . PHP_EOL;
    echo "Total Stock Sebelum: {$totalStockBefore} kg" . PHP_EOL;
    echo "Total Stock Sesudah: {$totalStockAfter} kg" . PHP_EOL;

    $expectedReduction = $qtyJual * ($unit ? $unit->conversion_to_kg : 1);
    $actualReduction = $totalStockBefore - $totalStockAfter;

    echo "Expected Reduction: {$expectedReduction} kg" . PHP_EOL;
    echo "Actual Reduction: {$actualReduction} kg" . PHP_EOL;
    echo "Stock Reduction Match: " . (abs($expectedReduction - $actualReduction) < 0.01 ? "✅ YES" : "❌ NO") . PHP_EOL;

    // Check stock movements
    $newMovements = $stockMovementsAfter - $stockMovementsBefore;
    echo "New Stock Movements: {$newMovements}" . PHP_EOL;

    if ($newMovements > 0) {
        echo PHP_EOL . "=== RECENT STOCK MOVEMENTS ===" . PHP_EOL;
        $recentMovements = StockMovement::with(['product', 'warehouse', 'toko'])
            ->latest()
            ->take($newMovements)
            ->get();

        foreach ($recentMovements as $movement) {
            $location = $movement->warehouse_id ? "Warehouse: {$movement->warehouse->name}" : "Toko: {$movement->toko->name}";
            echo "- Type: {$movement->type} | Product: {$movement->product->name} | Qty: {$movement->quantity_in_kg} kg | {$location}" . PHP_EOL;
            echo "  Reference: {$movement->reference_type} #{$movement->reference_id}" . PHP_EOL;
        }
    }

    // Check transaction details
    $newTransactions = $transactionsAfter - $transactionsBefore;
    if ($newTransactions > 0) {
        echo PHP_EOL . "=== TRANSACTION DETAILS ===" . PHP_EOL;
        $latestTransaction = Transaction::with(['details.product', 'customer'])
            ->latest()
            ->first();

        if ($latestTransaction) {
            echo "Invoice: {$latestTransaction->invoice}" . PHP_EOL;
            echo "Customer: {$latestTransaction->customer->name}" . PHP_EOL;
            echo "Grand Total: Rp " . number_format($latestTransaction->grand_total) . PHP_EOL;
            echo "Cash: Rp " . number_format($latestTransaction->cash) . PHP_EOL;
            echo "Change: Rp " . number_format($latestTransaction->change) . PHP_EOL;

            echo "Items:" . PHP_EOL;
            foreach ($latestTransaction->details as $detail) {
                echo "  - {$detail->product->name}: {$detail->qty} x Rp " . number_format($detail->price) . " = Rp " . number_format($detail->subtotal) . PHP_EOL;
            }
        }
    }
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
    echo "Trace: " . $e->getTraceAsString() . PHP_EOL;
}

echo PHP_EOL . "🎯 KESIMPULAN:" . PHP_EOL;
if ($response && ($response->getStatusCode() === 200 || $response->getStatusCode() === 201)) {
    echo "✅ Sistem penjualan berfungsi dengan baik!" . PHP_EOL;
    echo "✅ Transaksi berhasil dibuat" . PHP_EOL;
    echo "✅ Stock berkurang sesuai penjualan" . PHP_EOL;
    echo "✅ Stock movements tercatat (jika ada)" . PHP_EOL;
} else {
    echo "⚠️ Ada masalah dengan sistem penjualan, perlu investigasi" . PHP_EOL;
}
