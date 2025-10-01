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
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('owner_id')->nullable()->after('subcategory_id');
            $table->unsignedBigInteger('supplier_id')->nullable()->after('owner_id');
            $table->foreign('owner_id')->references('id')->on('owners')->onDelete('set null');
            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['owner_id']);
            $table->dropForeign(['supplier_id']);
            $table->dropColumn(['owner_id', 'supplier_id']);
        });
    }
};
