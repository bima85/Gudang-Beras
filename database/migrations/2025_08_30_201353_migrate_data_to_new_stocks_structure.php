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
        // Migrasi data dari stok_tokos ke stocks (gabungkan dalam kg)
        DB::statement("
            INSERT INTO stocks (product_id, warehouse_id, qty_in_kg, created_at, updated_at)
            SELECT 
                st.product_id,
                1 as warehouse_id, -- Asumsi toko_id 1 sebagai warehouse_id 1
                COALESCE(
                    CASE 
                        WHEN st.sisa_stok IS NOT NULL AND st.sisa_stok >= 0 THEN st.sisa_stok
                        ELSE st.qty 
                    END * COALESCE(u.conversion_to_kg, 1.0), 
                    0
                ) as qty_in_kg,
                st.created_at,
                st.updated_at
            FROM stok_tokos st
            LEFT JOIN units u ON u.id = st.unit_id
            WHERE st.product_id IS NOT NULL
            ON DUPLICATE KEY UPDATE 
                qty_in_kg = qty_in_kg + VALUES(qty_in_kg),
                updated_at = VALUES(updated_at)
        ");

        Log::info('Migrated stok_tokos data to new stocks structure');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Kosongkan table stocks (rollback)
        DB::table('stocks')->truncate();
        Log::info('Rolled back: cleared stocks table');
    }
};
