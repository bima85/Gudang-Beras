<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        if (! Schema::hasTable('carts')) {
            Schema::create('carts', function (Blueprint $table) {
                $table->bigIncrements('id');
                $table->unsignedBigInteger('cashier_id');
                $table->unsignedBigInteger('product_id');
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('subcategory_id')->nullable();
                $table->unsignedBigInteger('unit_id')->nullable();
                $table->integer('qty');
                $table->bigInteger('price');
                // optional toko-related columns
                $table->unsignedBigInteger('toko_id')->nullable();
                $table->boolean('pakai_stok_toko')->default(false);
                $table->boolean('toko_consumed')->default(false);
                $table->unsignedBigInteger('stok_toko_id')->nullable();
                $table->timestamps();

                // foreign keys (best-effort)
                if (Schema::hasTable('users')) {
                    $table->foreign('cashier_id')->references('id')->on('users');
                }
                if (Schema::hasTable('products')) {
                    $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
                }
                if (Schema::hasTable('categories')) {
                    $table->foreign('category_id')->references('id')->on('categories')->onDelete('set null');
                }
                if (Schema::hasTable('subcategories')) {
                    $table->foreign('subcategory_id')->references('id')->on('subcategories')->onDelete('set null');
                }
                if (Schema::hasTable('units')) {
                    $table->foreign('unit_id')->references('id')->on('units');
                }
                if (Schema::hasTable('tokos')) {
                    $table->foreign('toko_id')->references('id')->on('tokos')->onDelete('set null');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('carts')) {
            Schema::dropIfExists('carts');
        }
    }
};
