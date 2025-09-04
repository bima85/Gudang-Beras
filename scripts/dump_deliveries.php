<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\SuratJalan;

use Illuminate\Support\Facades\Storage;

$surats = SuratJalan::with([
    'transaction',
    'transaction.customer',
    'transaction.details',
    'transaction.details.product',
    'transaction.details.unit',
])->latest()->limit(10)->get();
$out = json_encode($surats->map(function ($s) {
    return [
        'id' => $s->id,
        'no_surat' => $s->no_surat,
        'status' => $s->status,
        'transaction_id' => $s->transaction_id,
        'transaction' => $s->transaction ? [
            'id' => $s->transaction->id,
            'invoice' => $s->transaction->invoice,
            'grand_total' => $s->transaction->grand_total,
            'details' => $s->transaction->details->map(function ($d) {
                return [
                    'product_id' => $d->product_id,
                    'product_name' => $d->product ? $d->product->name : null,
                    'qty' => $d->qty,
                    'unit_id' => $d->unit_id,
                    'unit_name' => $d->unit ? $d->unit->name : null,
                    'price' => $d->price,
                ];
            }),
        ] : null,
    ];
}));

// write to storage logs so we can read it
$path = storage_path('logs/dump_deliveries.json');
file_put_contents($path, $out);
echo "Wrote JSON to: {$path}\n";
