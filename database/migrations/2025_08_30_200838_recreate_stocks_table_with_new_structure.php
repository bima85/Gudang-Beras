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
        // Drop existing stocks table
        Schema::dropIfExists('stocks');

        // Create new stocks table with simplified structure
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->decimal('qty_in_kg', 15, 2)->default(0); // jumlah stok dalam kg
            $table->timestamps();

            // Foreign keys
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('cascade');

            // Unique index untuk mencegah duplikasi
            $table->unique(['product_id', 'warehouse_id'], 'stocks_product_warehouse_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stocks');

        // Recreate old stocks table structure (jika diperlukan rollback)
        Schema::create('stocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('warehouse_id')->nullable();
            $table->integer('stok_gudang')->default(0);
            $table->string('type')->nullable();
            $table->text('note')->nullable();
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->date('purchase_date')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->decimal('sisa_stok', 12, 2)->nullable();
            $table->timestamps();

            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('warehouse_id')->references('id')->on('warehouses');
            $table->foreign('unit_id')->references('id')->on('units');
            $table->foreign('user_id')->references('id')->on('users');
        });
    }
};
