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
        Schema::table('stok_tokos', function (Blueprint $table) {
            // some environments may not have `warehouse_id` column yet
            // so only use ->after('warehouse_id') when the column exists
            if (Schema::hasColumn('stok_tokos', 'warehouse_id')) {
                $table->unsignedBigInteger('toko_id')->nullable()->after('warehouse_id');
            } else {
                $table->unsignedBigInteger('toko_id')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stok_tokos', function (Blueprint $table) {
            $table->dropColumn('toko_id');
        });
    }
};
