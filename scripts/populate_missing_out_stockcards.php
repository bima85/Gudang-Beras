<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Models\Transaction;
use App\Models\StockCard;
use App\Services\StockCardService;
use Carbon\Carbon;

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$since = Carbon::now()->subDays(7);
$txns = Transaction::where('created_at', '>=', $since)->orderBy('id', 'desc')->get();
$processed = 0;
foreach ($txns as $t) {
    $exists = StockCard::where('note', 'like', '%Penjualan #' . $t->id . '%')->exists();
    if ($exists) {
        echo "txn:{$t->id} already has StockCard\n";
        continue;
    }
    echo "txn:{$t->id} missing, attempting to record...\n";
    try {
        StockCardService::recordOutFromTransaction($t);
        echo "txn:{$t->id} processed\n";
        $processed++;
    } catch (\Exception $e) {
        echo "txn:{$t->id} failed: " . $e->getMessage() . "\n";
    }
}

echo "Done. Processed: {$processed}\n";
