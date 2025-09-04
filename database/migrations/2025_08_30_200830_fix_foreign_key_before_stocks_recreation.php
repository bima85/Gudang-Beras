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
        // Check if foreign key constraint exists before trying to drop it
        if (Schema::hasTable('transaction_details') && Schema::hasColumn('transaction_details', 'stock_id')) {

            // Check if foreign key constraint exists
            $foreignKeys = DB::select("
                SELECT CONSTRAINT_NAME 
                FROM information_schema.KEY_COLUMN_USAGE 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'transaction_details' 
                AND COLUMN_NAME = 'stock_id' 
                AND REFERENCED_TABLE_NAME IS NOT NULL
            ");

            if (!empty($foreignKeys)) {
                Schema::table('transaction_details', function (Blueprint $table) {
                    $table->dropForeign(['stock_id']);
                });
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't recreate the foreign key in down method
        // as this was a fix migration
    }
};
