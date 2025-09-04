<?php

require __DIR__ . '/../vendor/autoload.php';

// Bootstrap the framework
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Make kernel
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Http\Controllers\Apps\TransactionController;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Toko;

// pick a product, warehouse, toko sample
$product = Product::first();
$warehouse = Warehouse::first();
$toko = Toko::first();

if (! $product) {
    echo "No product found in database\n";
    exit(1);
}

$barcode = $product->barcode ?: $product->name;
$warehouseId = $warehouse ? $warehouse->id : null;
$tokoId = $toko ? $toko->id : null;

echo "Using product id={$product->id}, barcode={$barcode}, warehouse_id={$warehouseId}, toko_id={$tokoId}\n";

$controller = new TransactionController();
$request = Request::create('/dashboard/products/search', 'GET', [
    'barcode' => $barcode,
    'warehouse_id' => $warehouseId,
    'toko_id' => $tokoId,
]);

$response = $controller->searchProduct($request);

// $response is Illuminate\Http\JsonResponse
$content = $response->getContent();

echo "Response JSON:\n";
echo $content . "\n";

// Exit
return 0;
