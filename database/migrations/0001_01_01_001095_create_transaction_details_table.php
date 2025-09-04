<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transaction_details', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transaction_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->unsignedBigInteger('stock_id')->nullable();
            $table->integer('qty');
            $table->bigInteger('price');
            $table->bigInteger('subtotal');
            $table->timestamps();
            $table->foreign('transaction_id')->references('id')->on('transactions')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('unit_id')->references('id')->on('units');
            $table->foreign('stock_id')->references('id')->on('stocks')->onDelete('set null');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('transaction_details');
    }
};
