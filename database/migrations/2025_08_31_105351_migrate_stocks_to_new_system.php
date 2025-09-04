<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Log::info('Starting migration from old stock system to new system');

        // 1. Migrate data from 'stocks' table to 'warehouse_stocks'
        $this->migrateWarehouseStocks();

        // 2. Migrate data from 'stok_tokos' table to 'store_stocks'
        $this->migrateStoreStocks();

        Log::info('Migration from old stock system completed successfully');
    }

    /**
     * Migrate data from stocks table to warehouse_stocks
     */
    private function migrateWarehouseStocks()
    {
        Log::info('Migrating data from stocks to warehouse_stocks');

        // Get all stock records with valid warehouse_id
        $stocks = DB::table('stocks')
            ->whereNotNull('warehouse_id')
            ->where('qty_in_kg', '>', 0)
            ->get();

        foreach ($stocks as $stock) {
            try {
                // Check if warehouse_stock already exists
                $existingStock = DB::table('warehouse_stocks')
                    ->where('product_id', $stock->product_id)
                    ->where('warehouse_id', $stock->warehouse_id)
                    ->first();

                if ($existingStock) {
                    // Update existing record by adding quantities
                    DB::table('warehouse_stocks')
                        ->where('product_id', $stock->product_id)
                        ->where('warehouse_id', $stock->warehouse_id)
                        ->update([
                            'qty_in_kg' => DB::raw('qty_in_kg + ' . $stock->qty_in_kg),
                            'updated_at' => now()
                        ]);
                } else {
                    // Create new warehouse_stock record
                    DB::table('warehouse_stocks')->insert([
                        'product_id' => $stock->product_id,
                        'warehouse_id' => $stock->warehouse_id,
                        'qty_in_kg' => $stock->qty_in_kg,
                        'created_at' => $stock->created_at ?? now(),
                        'updated_at' => $stock->updated_at ?? now()
                    ]);
                }

                Log::info("Migrated stock record ID: {$stock->id} to warehouse_stocks");
            } catch (\Exception $e) {
                Log::error("Failed to migrate stock record ID: {$stock->id}", ['error' => $e->getMessage()]);
            }
        }

        Log::info('Warehouse stocks migration completed');
    }

    /**
     * Migrate data from stok_tokos table to store_stocks
     */
    private function migrateStoreStocks()
    {
        Log::info('Migrating data from stok_tokos to store_stocks');

        // Get all stok_toko records with valid toko_id
        $stokTokos = DB::table('stok_tokos')
            ->whereNotNull('toko_id')
            ->whereNotNull('product_id')
            ->get();

        foreach ($stokTokos as $stokToko) {
            try {
                // Convert to kg if needed
                $qtyInKg = $this->convertToKg($stokToko);

                if ($qtyInKg <= 0) {
                    continue; // Skip zero or negative quantities
                }

                // Check if store_stock already exists
                $existingStock = DB::table('store_stocks')
                    ->where('product_id', $stokToko->product_id)
                    ->where('toko_id', $stokToko->toko_id)
                    ->first();

                if ($existingStock) {
                    // Update existing record by adding quantities
                    DB::table('store_stocks')
                        ->where('product_id', $stokToko->product_id)
                        ->where('toko_id', $stokToko->toko_id)
                        ->update([
                            'qty_in_kg' => DB::raw('qty_in_kg + ' . $qtyInKg),
                            'updated_at' => now()
                        ]);
                } else {
                    // Create new store_stock record
                    DB::table('store_stocks')->insert([
                        'product_id' => $stokToko->product_id,
                        'toko_id' => $stokToko->toko_id,
                        'qty_in_kg' => $qtyInKg,
                        'created_at' => $stokToko->created_at ?? now(),
                        'updated_at' => $stokToko->updated_at ?? now()
                    ]);
                }

                Log::info("Migrated stok_toko record ID: {$stokToko->id} to store_stocks");
            } catch (\Exception $e) {
                Log::error("Failed to migrate stok_toko record ID: {$stokToko->id}", ['error' => $e->getMessage()]);
            }
        }

        Log::info('Store stocks migration completed');
    }

    /**
     * Convert stok_toko quantity to kg
     */
    private function convertToKg($stokToko)
    {
        // Use sisa_stok if available, otherwise use qty
        $qty = $stokToko->sisa_stok ?? $stokToko->qty ?? 0;

        // Get unit conversion rate
        if ($stokToko->unit_id) {
            $unit = DB::table('units')->where('id', $stokToko->unit_id)->first();
            if ($unit && $unit->conversion_to_kg) {
                return $qty * $unit->conversion_to_kg;
            }
        }

        // Default: assume already in kg
        return $qty;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Log::info('Reversing migration - this will not restore old data');
        // We don't reverse data migration for safety
        // The old tables still exist if rollback is needed
    }
};
