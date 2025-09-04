<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Transaction;
use App\Models\SuratJalan;

$transactions = Transaction::with(['cashier', 'customer'])->latest()->get();
$created = 0;
foreach ($transactions as $t) {
    $paidAmount = ($t->cash ?? 0) + ($t->deposit_amount ?? 0);
    $isPaid = ($t->payment_method !== 'tempo' && ($t->grand_total <= 0 || $paidAmount >= $t->grand_total));
    $surat = SuratJalan::where('transaction_id', $t->id)->first();
    if ($isPaid && !$surat) {
        $surat = SuratJalan::create([
            'transaction_id' => $t->id,
            'warehouse_id' => $t->warehouse_id,
            'toko_id' => $t->toko_id,
            'user_id' => $t->cashier_id ?? 1,
            'no_surat' => 'AUTO-SJ-' . now()->format('YmdHis') . '-' . $t->id,
            'notes' => 'Auto-created by maintenance script',
            'status' => 'pending',
        ]);
        $created++;
        echo "Created surat jalan for transaction {$t->id} -> surat id {$surat->id}\n";
    }
}
if ($created === 0) echo "No missing surat jalans created.\n";
else echo "Total created: {$created}\n";
