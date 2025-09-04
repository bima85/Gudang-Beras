<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$rows = DB::table('store_stocks')
    ->leftJoin('products', 'products.id', '=', 'stok_tokos.product_id')
    ->leftJoin('units', 'units.id', '=', 'stok_tokos.unit_id')
    ->leftJoin('tokos', 'tokos.id', '=', 'stok_tokos.toko_id')
    ->select('stok_tokos.id', 'stok_tokos.product_id', 'products.name as product_name', 'stok_tokos.toko_id', 'tokos.name as toko_name', 'stok_tokos.unit_id', 'units.name as unit_name', 'stok_tokos.qty', 'stok_tokos.sisa_stok', 'stok_tokos.created_at')
    ->orderByDesc('stok_tokos.id')
    ->limit(50)
    ->get();

if (count($rows) === 0) {
    echo "No stok_tokos rows found.\n";
    exit(0);
}

foreach ($rows as $r) {
    echo json_encode($r) . "\n";
}

return 0;
