<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Transaction;
use App\Models\SuratJalan;

$transactions = Transaction::with(['cashier', 'customer'])->latest()->limit(20)->get();
if ($transactions->isEmpty()) {
    echo "No transactions found.\n";
    exit;
}

foreach ($transactions as $t) {
    $paidAmount = ($t->cash ?? 0) + ($t->deposit_amount ?? 0);
    $isPaid = ($t->payment_method !== 'tempo' && ($t->grand_total <= 0 || $paidAmount >= $t->grand_total));
    $surat = SuratJalan::where('transaction_id', $t->id)->first();
    echo "Transaction ID: {$t->id}\n";
    echo "  Invoice: " . ($t->invoice ?? '-') . "\n";
    echo "  Payment method: " . ($t->payment_method ?? '-') . "\n";
    echo "  Grand total: " . ($t->grand_total ?? 0) . "\n";
    echo "  Paid amount (cash + deposit): " . $paidAmount . "\n";
    echo "  Considered paid (per rule): " . ($isPaid ? 'YES' : 'NO') . "\n";
    echo "  SuratJalan exists: " . ($surat ? 'YES (id=' . $surat->id . ')' : 'NO') . "\n";
    echo "  Created at: " . $t->created_at . "\n";
    echo "----------------------------------------\n";
}
