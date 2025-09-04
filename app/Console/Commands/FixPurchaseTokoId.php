<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Purchase;
use App\Models\Toko;

class FixPurchaseTokoId extends Command
{
    protected $signature = 'fix:purchase-toko';
    protected $description = 'Fix toko_id in purchases table';

    public function handle()
    {
        $this->info('Fixing purchase toko_id...');

        // Get first available toko
        $toko = Toko::first();
        if (!$toko) {
            $this->error('No toko found in database');
            return;
        }

        // Update all purchases to use existing toko
        $updated = Purchase::where('toko_id', 1)->update([
            'toko_id' => $toko->id
        ]);

        $this->info("Updated {$updated} purchases to use toko_id: {$toko->id} ({$toko->name})");

        // Verify
        $purchase = Purchase::with('toko')->first();
        if ($purchase && $purchase->toko) {
            $this->info("Verification: Purchase now has toko: " . $purchase->toko->name);
        } else {
            $this->error("Verification failed");
        }
    }
}
