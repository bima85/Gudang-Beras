<?php

require_once 'vendor/autoload.php';

use App\Models\User;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Product;
use App\Http\Controllers\Apps\PurchaseController;
use Illuminate\Support\Facades\Auth;

echo "=== SIMPLE PURCHASE TEST - Debug ===" . PHP_EOL;

try {
    $app = require_once 'bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    echo "✅ Laravel bootstrapped" . PHP_EOL;

    $adminUser = User::where('email', 'admin@admin.com')->first();
    if ($adminUser) {
        Auth::login($adminUser);
        echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;
    } else {
        echo "❌ Admin user not found" . PHP_EOL;
        exit(1);
    }

    $supplier = Supplier::first();
    if ($supplier) {
        echo "✅ Supplier found: " . $supplier->name . " (ID: {$supplier->id})" . PHP_EOL;
    } else {
        echo "❌ No suppliers found" . PHP_EOL;
    }

    $warehouse = Warehouse::first();
    if ($warehouse) {
        echo "✅ Warehouse found: " . $warehouse->name . " (ID: {$warehouse->id})" . PHP_EOL;
    } else {
        echo "❌ No warehouses found" . PHP_EOL;
    }

    $product = Product::first();
    if ($product) {
        echo "✅ Product found: " . $product->nama . " (ID: {$product->id})" . PHP_EOL;
    } else {
        echo "❌ No products found" . PHP_EOL;
    }

    // Test the controller exists
    $controller = new PurchaseController();
    echo "✅ PurchaseController instantiated" . PHP_EOL;

    echo PHP_EOL . "All basic components are working!" . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error: " . $e->getMessage() . PHP_EOL;
    echo "File: " . $e->getFile() . PHP_EOL;
    echo "Line: " . $e->getLine() . PHP_EOL;
}
