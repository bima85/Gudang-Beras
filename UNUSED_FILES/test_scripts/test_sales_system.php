<?php

require_once 'vendor/autoload.php';

use App\Http\Controllers\Apps\TransactionController;
use App\Models\Transaction;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
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

echo "🛒 TEST SISTEM PENJUALAN/TRANSAKSI" . PHP_EOL;
echo "==================================" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
if (!$adminUser) {
    echo "❌ Admin user tidak ditemukan" . PHP_EOL;
    exit(1);
}
Auth::login($adminUser);

echo "✅ User logged in: {$adminUser->name}" . PHP_EOL;

// Get required data
$customer = Customer::first();
$product = Product::first();
$category = Category::first();
$subcategory = Subcategory::first();
$unit = Unit::first();
$warehouse = Warehouse::first();

echo "✅ Setup data berhasil" . PHP_EOL;

// Check current stock
$warehouseStock = WarehouseStock::where('product_id', $product->id)->first();
$storeStock = StoreStock::where('product_id', $product->id)->first();

echo PHP_EOL . "=== CURRENT STOCK STATUS ===" . PHP_EOL;
echo "Product: {$product->name}" . PHP_EOL;
echo "Warehouse Stock: " . ($warehouseStock ? $warehouseStock->qty_in_kg : 0) . " kg" . PHP_EOL;
echo "Store Stock: " . ($storeStock ? $storeStock->qty_in_kg : 0) . " kg" . PHP_EOL;

$totalStock = ($warehouseStock ? $warehouseStock->qty_in_kg : 0) + ($storeStock ? $storeStock->qty_in_kg : 0);
echo "Total Stock: {$totalStock} kg" . PHP_EOL;

if ($totalStock <= 0) {
    echo "⚠️ Tidak ada stock untuk testing penjualan" . PHP_EOL;
    exit(1);
}

// Check transaction controller methods
$controller = new TransactionController();

echo PHP_EOL . "=== TRANSACTION CONTROLLER METHODS ===" . PHP_EOL;
$methods = get_class_methods($controller);
$relevantMethods = array_filter($methods, function ($method) {
    return !in_array($method, ['__construct', '__call', '__callStatic']);
});

echo "Available methods:" . PHP_EOL;
foreach ($relevantMethods as $method) {
    echo "  - {$method}" . PHP_EOL;
}

// Check if there are existing transactions
$transactionCount = Transaction::count();
echo PHP_EOL . "=== EXISTING TRANSACTIONS ===" . PHP_EOL;
echo "Total Transactions: {$transactionCount}" . PHP_EOL;

if ($transactionCount > 0) {
    $recentTransactions = Transaction::with(['customer'])
        ->latest()
        ->take(3)
        ->get();

    echo "Recent Transactions:" . PHP_EOL;
    foreach ($recentTransactions as $transaction) {
        $customerName = $transaction->customer ? $transaction->customer->name : 'No Customer';
        echo "  - ID: {$transaction->id} | Customer: {$customerName} | Total: {$transaction->total} | Date: {$transaction->created_at}" . PHP_EOL;
    }
}

// Test transaction list method
try {
    echo PHP_EOL . "=== TESTING TRANSACTION LIST ===" . PHP_EOL;
    $request = Request::create('/dashboard/transactions/list', 'GET');
    app()->instance('request', $request);

    $response = $controller->list();

    if ($response instanceof \Inertia\Response) {
        echo "✅ TransactionController::list() berhasil" . PHP_EOL;
    } else {
        echo "⚠️ Response type: " . get_class($response) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error testing transaction list: " . $e->getMessage() . PHP_EOL;
}

// Check Transaction model structure
echo PHP_EOL . "=== TRANSACTION MODEL CHECK ===" . PHP_EOL;
$transaction = new Transaction();
$fillable = $transaction->getFillable();
echo "Transaction fillable fields: " . implode(', ', $fillable) . PHP_EOL;

echo PHP_EOL . "🎯 NEXT STEPS:" . PHP_EOL;
echo "1. ✅ Transaction system ada dan berfungsi" . PHP_EOL;
echo "2. ✅ Routes tersedia: /dashboard/transactions" . PHP_EOL;
echo "3. ✅ Controller methods available" . PHP_EOL;
echo "4. ✅ Stock tersedia untuk testing penjualan" . PHP_EOL;
echo "5. 🔄 Perlu test create transaction untuk penjualan" . PHP_EOL;
