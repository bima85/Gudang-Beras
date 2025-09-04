<?php
require __DIR__ . '/../vendor/autoload.php';

use App\Models\Transaction;
use App\Models\StockCard;
use Carbon\Carbon;

$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$txns = Transaction::where('created_at', '>=', Carbon::now()->subDay())->orderBy('id', 'desc')->get();
foreach ($txns as $t) {
    $has = StockCard::where('note', 'like', '%Penjualan #' . $t->id . '%')->exists();
    echo 'txn:' . $t->id . ' ' . ($has ? 'has' : 'miss') . "\n";
}
