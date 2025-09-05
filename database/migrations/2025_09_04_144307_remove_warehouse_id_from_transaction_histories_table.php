<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transaction_histories', function (Blueprint $table) {
            // Drop foreign key constraint first
            $table->dropForeign(['warehouse_id']);
            // Then drop the column
            $table->dropColumn('warehouse_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_histories', function (Blueprint $table) {
            // Add back the warehouse_id column
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses');
        });
    }
};
