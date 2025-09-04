<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('cashier_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('category_id')->nullable();
            $table->unsignedBigInteger('subcategory_id')->nullable();
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->integer('qty');
            $table->bigInteger('price');
            $table->timestamps();
            $table->foreign('cashier_id')->references('id')->on('users');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
            $table->foreign('subcategory_id')->references('id')->on('subcategories')->onDelete('set null');
            $table->foreign('unit_id')->references('id')->on('units');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
