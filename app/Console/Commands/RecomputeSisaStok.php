<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class RecomputeSisaStok extends Command
{
    protected $signature = 'stocks:recompute-sisa {--dry-run}';
    protected $description = 'Recompute sisa_stok for stocks and stok_tokos from raw qty history (safe, optional --dry-run)';

    public function handle()
    {
        $dry = $this->option('dry-run');
        $this->info('Starting recompute of sisa_stok' . ($dry ? ' (dry-run)' : ''));

        // Stocks (warehouse)
        $this->info('Recomputing stocks.sisa_stok grouped by product,warehouse,unit...');
        $stockGroups = DB::table('stocks')
            ->select('product_id', 'warehouse_id', 'unit_id', DB::raw('MIN(id) as min_id'))
            ->groupBy('product_id', 'warehouse_id', 'unit_id')
            ->get();

        foreach ($stockGroups as $g) {
            $rows = DB::table('stocks')
                ->where('product_id', $g->product_id)
                ->where('warehouse_id', $g->warehouse_id)
                ->where('unit_id', $g->unit_id)
                ->orderBy('id', 'asc')
                ->get();
            $running = 0.0;
            foreach ($rows as $r) {
                $running += (float) $r->qty;
                $new = $running;
                if ($dry) {
                    $this->line("stocks id={$r->id} => sisa_stok should be={$new}");
                } else {
                    DB::table('stocks')->where('id', $r->id)->update(['sisa_stok' => $new]);
                }
            }
        }

        $this->info('Recomputing stok_tokos.sisa_stok grouped by product,toko,unit...');
        $tokoGroups = DB::table('stok_tokos')
            ->select('product_id', 'toko_id', 'unit_id', DB::raw('MIN(id) as min_id'))
            ->groupBy('product_id', 'toko_id', 'unit_id')
            ->get();

        foreach ($tokoGroups as $g) {
            $rows = DB::table('stok_tokos')
                ->where('product_id', $g->product_id)
                ->where('toko_id', $g->toko_id)
                ->where('unit_id', $g->unit_id)
                ->orderBy('id', 'asc')
                ->get();
            $running = 0.0;
            foreach ($rows as $r) {
                $running += (float) $r->qty;
                $new = $running;
                if ($dry) {
                    $this->line("stok_tokos id={$r->id} => sisa_stok should be={$new}");
                } else {
                    DB::table('stok_tokos')->where('id', $r->id)->update(['sisa_stok' => $new]);
                }
            }
        }

        $this->info('Recompute completed.');
        return 0;
    }
}
