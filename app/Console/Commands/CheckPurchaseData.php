<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Purchase;
use App\Models\Toko;

class CheckPurchaseData extends Command
{
    protected $signature = 'check:purchase-data';
    protected $description = 'Check purchase data and toko relation';

    public function handle()
    {
        $this->info('=== CHECKING PURCHASE DATA ===');

        // Check tokos
        $tokos = Toko::all();
        $this->info('Tokos in database: ' . $tokos->count());
        foreach ($tokos as $toko) {
            $this->info("- ID: {$toko->id}, Name: {$toko->name}");
        }

        // Check purchases
        $purchases = Purchase::with('toko')->get();
        $this->info('Purchases in database: ' . $purchases->count());

        foreach ($purchases as $purchase) {
            $this->info("Purchase ID: {$purchase->id}, Invoice: {$purchase->invoice_number}");
            $this->info("  - toko_id: {$purchase->toko_id}");
            $this->info("  - toko relation: " . ($purchase->toko ? $purchase->toko->name : 'NULL'));
        }

        // Check specific purchase data like in controller
        $query = Purchase::with([
            'supplier',
            'warehouse',
            'toko',
            'items.product',
            'items.category',
            'items.subcategory',
            'items.unit',
        ]);

        $firstPurchase = $query->first();
        if ($firstPurchase) {
            $this->info('=== FIRST PURCHASE WITH RELATIONS ===');
            $this->info("ID: {$firstPurchase->id}");
            $this->info("Supplier: " . ($firstPurchase->supplier ? $firstPurchase->supplier->name : 'NULL'));
            $this->info("Warehouse: " . ($firstPurchase->warehouse ? $firstPurchase->warehouse->name : 'NULL'));
            $this->info("Toko: " . ($firstPurchase->toko ? $firstPurchase->toko->name : 'NULL'));
            $this->info("Items count: " . $firstPurchase->items->count());
        }
    }
}
