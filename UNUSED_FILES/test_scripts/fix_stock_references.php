<?php

/**
 * Script untuk mengganti referensi Stock dan StokToko lama dengan sistem baru
 * WARNING: Backup file sebelum menjalankan script ini!
 */

require __DIR__ . '/vendor/autoload.php';

$filesToUpdate = [
    // Controllers yang perlu diupdate
    'app/Http/Controllers/Apps/PurchaseController.php',
    'app/Http/Controllers/Apps/StockRequestController.php',
    'app/Http/Controllers/Apps/StockReportController.php',
    'app/Http/Controllers/Apps/StockMovementController.php',

    // Services
    'app/Services/StockKgService.php',

    // Scripts yang masih menggunakan table lama
    'scripts/list_stok_tokos.php',
    'scripts/populate_toko_stock_cards.php',
    'tmp_sim_addtocart.php',
];

$replacements = [
    // Replace Stock model usage
    'use App\Models\Stock;' => 'use App\Models\WarehouseStock;',
    'Stock::getCurrentStock(' => 'WarehouseStock::getStock(',
    'Stock::updateStock(' => 'WarehouseStock::updateStock(',
    'Stock::where(' => 'WarehouseStock::where(',
    'Stock::create(' => 'WarehouseStock::create(',

    // Replace StokToko model usage  
    'use App\Models\StokToko;' => 'use App\Models\StoreStock;',
    'StokToko::where(' => 'StoreStock::where(',
    'StokToko::create(' => 'StoreStock::create(',
    '\App\Models\StokToko::' => '\App\Models\StoreStock::',

    // Replace table references
    "'stok_tokos'" => "'store_stocks'",
    '"stok_tokos"' => '"store_stocks"',
    '`stok_tokos`' => '`store_stocks`',
    "'stocks'" => "'warehouse_stocks'", // Be careful with this one
    '"stocks"' => '"warehouse_stocks"',
];

echo "🚀 Starting Stock System Migration Fix...\n\n";

foreach ($filesToUpdate as $file) {
    $fullPath = __DIR__ . '/' . $file;

    if (!file_exists($fullPath)) {
        echo "⚠️  File not found: $file\n";
        continue;
    }

    echo "📝 Processing: $file\n";

    // Backup original file
    $backupPath = $fullPath . '.backup-' . date('Y-m-d-H-i-s');
    copy($fullPath, $backupPath);
    echo "   💾 Backup created: " . basename($backupPath) . "\n";

    // Read file content
    $content = file_get_contents($fullPath);
    $originalContent = $content;

    // Apply replacements
    $changesCount = 0;
    foreach ($replacements as $search => $replace) {
        $newContent = str_replace($search, $replace, $content);
        if ($newContent !== $content) {
            $changesCount += substr_count($content, $search);
            $content = $newContent;
        }
    }

    // Write updated content if changes were made
    if ($content !== $originalContent) {
        file_put_contents($fullPath, $content);
        echo "   ✅ Updated with $changesCount changes\n";
    } else {
        echo "   ℹ️  No changes needed\n";
        // Remove backup if no changes
        unlink($backupPath);
    }

    echo "\n";
}

echo "🎉 Stock System Migration Fix completed!\n";
echo "\n📋 Next steps:\n";
echo "1. Test your application thoroughly\n";
echo "2. Run: php artisan migrate (to drop old tables)\n";
echo "3. Remove backup files if everything works: rm *.backup-*\n";
echo "4. Update any remaining manual references\n";
