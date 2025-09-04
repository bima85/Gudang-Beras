<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Log;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop old stock tables that have been replaced by new system

        // 1. Drop stocks table (replaced by warehouse_stocks)
        Schema::dropIfExists('stocks');

        // 2. Drop stok_tokos table (replaced by store_stocks)  
        Schema::dropIfExists('stok_tokos');

        // 3. Drop stock_cards table if not needed (replaced by stock_movements)
        // Schema::dropIfExists('stock_cards'); // Uncomment if you want to drop this too

        Log::info('Old stock tables (stocks, stok_tokos) have been dropped successfully');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We don't recreate the old tables in rollback for safety
        // The migration files still exist if you need to recreate them
        Log::info('Rollback: Old stock tables were not recreated for safety');
    }
};
