<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->unsignedBigInteger('subcategory_id')->nullable();
            $table->string('barcode')->unique();
            $table->decimal('purchase_price', 12, 2)->default(0.00);
            $table->decimal('sell_price', 12, 2)->default(0.00);
            $table->decimal('min_stock', 12, 2)->default(0.00);
            $table->double('stock')->default(0);
            $table->timestamps();
            $table->softDeletes();
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('unit_id')->references('id')->on('units')->onDelete('restrict');
            $table->foreign('subcategory_id')->references('id')->on('subcategories')->onDelete('set null');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
