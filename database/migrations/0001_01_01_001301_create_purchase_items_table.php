<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('purchase_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('purchase_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('subcategory_id')->nullable();
            $table->unsignedBigInteger('unit_id');
            $table->unsignedBigInteger('warehouse_id')->nullable();
            $table->integer('qty');
            $table->bigInteger('harga_pembelian')->default(0);
            $table->bigInteger('subtotal');
            $table->timestamps();
            $table->bigInteger('kuli_fee')->default(0); // Tambah field kuli_fee
            $table->foreign('purchase_id')->references('id')->on('purchases');
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('subcategory_id')->references('id')->on('subcategories')->onDelete('set null');
            $table->foreign('unit_id')->references('id')->on('units');
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('set null');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('purchase_items');
    }
};
