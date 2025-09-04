<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Product;

$product = Product::first();
if (! $product) {
    echo "No product found\n";
    exit(1);
}
$productId = $product->id;
// show stok_tokos rows
$rows = DB::table('stok_tokos')
    ->select('id', 'product_id', 'toko_id', 'unit_id', 'qty')
    ->where('product_id', $productId)
    ->get();

echo "Product id={$productId}\n";
echo "stok_tokos rows:\n";
foreach ($rows as $r) {
    echo json_encode($r) . "\n";
}

$joined = DB::table('stok_tokos')
    ->join('units', 'units.id', '=', 'stok_tokos.unit_id')
    ->where('stok_tokos.product_id', $productId)
    ->selectRaw('SUM(stok_tokos.qty * units.conversion_to_kg) as totalKg')
    ->value('totalKg');

echo "totalKg across toko rows: " . ($joined === null ? 'NULL' : $joined) . "\n";

// by toko
$tokoSums = DB::table('stok_tokos')
    ->join('units', 'units.id', '=', 'stok_tokos.unit_id')
    ->select('stok_tokos.toko_id', DB::raw('SUM(stok_tokos.qty * units.conversion_to_kg) as totalKg'))
    ->where('stok_tokos.product_id', $productId)
    ->groupBy('stok_tokos.toko_id')
    ->get();

echo "per-toko sums:\n";
foreach ($tokoSums as $s) {
    echo json_encode($s) . "\n";
}

return 0;
