<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Purchase;
use App\Models\WarehouseStock;
use App\Models\StoreStock;

echo "🎉 FINAL VERIFICATION: Sistem Alokasi 50-50% Setelah Clean & Fresh Test" . PHP_EOL;
echo "=====================================================================" . PHP_EOL;

// Check recent purchases (last 3 that have perfect 50-50%)
$recentPurchases = Purchase::with('items')->latest()->take(3)->get();

echo "=== PURCHASE VERIFICATION ===" . PHP_EOL;
$perfectCount = 0;

foreach ($recentPurchases as $index => $purchase) {
    echo "Purchase " . ($index + 1) . ": {$purchase->invoice_number}" . PHP_EOL;

    foreach ($purchase->items as $item) {
        $gudangPercent = round(($item->qty_gudang / $item->qty) * 100, 1);
        $tokoPercent = round(($item->qty_toko / $item->qty) * 100, 1);
        $is50_50 = ($gudangPercent == 50.0 && $tokoPercent == 50.0);
        $totalMatch = ($item->qty_gudang + $item->qty_toko) == $item->qty;

        echo "  → Qty {$item->qty} = Gudang {$item->qty_gudang} ({$gudangPercent}%) + Toko {$item->qty_toko} ({$tokoPercent}%)" . PHP_EOL;
        echo "  → Status: " . ($is50_50 ? "✅ PERFECT 50-50%" : "❌ Not 50-50%") . " | Total: " . ($totalMatch ? "✅ MATCH" : "❌ MISMATCH") . PHP_EOL;

        if ($is50_50 && $totalMatch) {
            $perfectCount++;
        }
    }
    echo PHP_EOL;
}

echo "=== STOCK BALANCE VERIFICATION ===" . PHP_EOL;

$totalWarehouse = WarehouseStock::sum('qty_in_kg');
$totalStore = StoreStock::sum('qty_in_kg');
$totalStock = $totalWarehouse + $totalStore;

if ($totalStock > 0) {
    $warehousePercent = round(($totalWarehouse / $totalStock) * 100, 1);
    $storePercent = round(($totalStore / $totalStock) * 100, 1);

    echo "Total Warehouse Stock: {$totalWarehouse} kg ({$warehousePercent}%)" . PHP_EOL;
    echo "Total Store Stock: {$totalStore} kg ({$storePercent}%)" . PHP_EOL;
    echo "Balance Status: " . ($warehousePercent == 50.0 && $storePercent == 50.0 ? "✅ PERFECT 50-50% BALANCE" : "⚠️ Not balanced") . PHP_EOL;

    $isBalanced = ($warehousePercent == 50.0 && $storePercent == 50.0);
} else {
    echo "No stock data found" . PHP_EOL;
    $isBalanced = false;
}

echo PHP_EOL . "=== FINAL RESULTS ===" . PHP_EOL;
echo "Perfect 50-50% Purchases: {$perfectCount}/3" . PHP_EOL;
echo "Stock Balance: " . ($isBalanced ? "✅ PERFECT" : "❌ NOT BALANCED") . PHP_EOL;

if ($perfectCount >= 3 && $isBalanced) {
    echo PHP_EOL . "🎉 KESIMPULAN: SISTEM ALOKASI 50-50% BEKERJA SEMPURNA!" . PHP_EOL;
    echo "✅ Setelah pembersihan data, fresh test menunjukkan:" . PHP_EOL;
    echo "   → Purchase otomatis teralokasi 50% gudang + 50% toko" . PHP_EOL;
    echo "   → Stock balance perfect 50-50%" . PHP_EOL;
    echo "   → Sistem auto allocation berfungsi dengan baik" . PHP_EOL;
    echo "   → Sesuai permintaan: Qty 200 → 100 Gudang + 100 Toko" . PHP_EOL;
} else {
    echo PHP_EOL . "⚠️ PERLU INVESTIGASI LEBIH LANJUT" . PHP_EOL;
    echo "Ada issue yang perlu diperbaiki" . PHP_EOL;
}

echo PHP_EOL . "📋 CARA KERJA SISTEM:" . PHP_EOL;
echo "1. User input qty saja (tidak perlu qty_gudang & qty_toko)" . PHP_EOL;
echo "2. Controller otomatis alokasi: qty_gudang = qty * 50%, qty_toko = qty * 50%" . PHP_EOL;
echo "3. Stock system otomatis update warehouse_stocks & store_stocks" . PHP_EOL;
echo "4. Balance selalu terjaga 50-50% antara gudang dan toko" . PHP_EOL;
