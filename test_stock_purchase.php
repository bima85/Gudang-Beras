<?php

require_once 'vendor/autoload.php';
require_once 'bootstrap/app.php';

use App\Models\Product;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Unit;

echo "=== Test Pembelian dengan Alokasi 50%-50% ===" . PHP_EOL;

$product = Product::first();
$unit = Unit::first();

if (!$product || !$unit) {
    echo 'Product atau Unit tidak ditemukan' . PHP_EOL;
    exit;
}

echo 'Product: ' . $product->name . PHP_EOL;
echo 'Unit: ' . $unit->name . ' (conversion: ' . $unit->conversion_to_kg . ')' . PHP_EOL;

// Simulasi pembelian 200 unit sak, 50%-50% split  
$qtyTotal = 200;
$qtyGudang = 100; // 50%
$qtyToko = 100; // 50%

// Convert ke kg
$qtyGudangKg = $qtyGudang * $unit->conversion_to_kg;
$qtyTokoKg = $qtyToko * $unit->conversion_to_kg;

echo 'Qty Gudang: ' . $qtyGudang . ' ' . $unit->name . ' = ' . $qtyGudangKg . ' kg' . PHP_EOL;
echo 'Qty Toko: ' . $qtyToko . ' ' . $unit->name . ' = ' . $qtyTokoKg . ' kg' . PHP_EOL;

// Check stok sebelumnya
$warehouseStockBefore = WarehouseStock::where('product_id', $product->id)->where('warehouse_id', 1)->first();
$storeStockBefore = StoreStock::where('product_id', $product->id)->where('toko_id', 1)->first();

echo 'Stok Gudang Sebelum: ' . ($warehouseStockBefore ? $warehouseStockBefore->qty_in_kg : 0) . ' kg' . PHP_EOL;
echo 'Stok Toko Sebelum: ' . ($storeStockBefore ? $storeStockBefore->qty_in_kg : 0) . ' kg' . PHP_EOL;

// Simpan ke WarehouseStock
$warehouseStock = WarehouseStock::firstOrCreate(
    ['product_id' => $product->id, 'warehouse_id' => 1],
    ['qty_in_kg' => 0]
);
$warehouseStock->qty_in_kg += $qtyGudangKg;
$warehouseStock->save();

// Simpan ke StoreStock
$storeStock = StoreStock::firstOrCreate(
    ['product_id' => $product->id, 'toko_id' => 1],
    ['qty_in_kg' => 0]
);
$storeStock->qty_in_kg += $qtyTokoKg;
$storeStock->save();

echo PHP_EOL . '=== HASIL SETELAH PEMBELIAN ===' . PHP_EOL;
echo 'Warehouse Stock: ' . $warehouseStock->qty_in_kg . ' kg' . PHP_EOL;
echo 'Store Stock: ' . $storeStock->qty_in_kg . ' kg' . PHP_EOL;
echo 'Total Stock: ' . ($warehouseStock->qty_in_kg + $storeStock->qty_in_kg) . ' kg' . PHP_EOL;

echo PHP_EOL . '✅ Stok berhasil ditambahkan!' . PHP_EOL;
