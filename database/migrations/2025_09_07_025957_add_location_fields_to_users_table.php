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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('warehouse_id')->nullable()->after('force_gudang_view');
            $table->unsignedBigInteger('toko_id')->nullable()->after('warehouse_id');

            // Add foreign key constraints if tables exist
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('set null');
            $table->foreign('toko_id')->references('id')->on('tokos')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['warehouse_id']);
            $table->dropForeign(['toko_id']);
            $table->dropColumn(['warehouse_id', 'toko_id']);
        });
    }
};
