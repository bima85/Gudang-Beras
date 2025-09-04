<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Only migrate if there are transaction_histories with warehouse_id but no toko_id
        $count = DB::table('transaction_histories')
            ->whereNotNull('warehouse_id')
            ->whereNull('toko_id')
            ->count();

        if ($count > 0) {
            // Check if warehouses exist and create corresponding tokos if needed
            $warehouses = DB::table('warehouses')->get();

            foreach ($warehouses as $warehouse) {
                $existingToko = DB::table('tokos')->where('name', $warehouse->name)->first();
                if (!$existingToko) {
                    DB::table('tokos')->insert([
                        'name' => $warehouse->name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Now migrate the data
            DB::statement('
                UPDATE transaction_histories th
                JOIN tokos t ON t.name = (SELECT w.name FROM warehouses w WHERE w.id = th.warehouse_id)
                SET th.toko_id = t.id
                WHERE th.toko_id IS NULL AND th.warehouse_id IS NOT NULL
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse migration - set toko_id back to NULL
        DB::statement('
            UPDATE transaction_histories
            SET toko_id = NULL
            WHERE toko_id IS NOT NULL
        ');
    }
};
