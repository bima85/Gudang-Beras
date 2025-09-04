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
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->unsignedBigInteger('toko_id')->nullable()->after('warehouse_id');
            $table->foreign('toko_id')->references('id')->on('tokos')->onDelete('cascade');

            // Make warehouse_id nullable since we now support both warehouse and toko
            $table->unsignedBigInteger('warehouse_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stock_movements', function (Blueprint $table) {
            $table->dropForeign(['toko_id']);
            $table->dropColumn('toko_id');
        });
    }
};
