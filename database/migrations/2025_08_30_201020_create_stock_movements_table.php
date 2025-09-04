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
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_id');
            $table->unsignedBigInteger('warehouse_id');
            $table->enum('type', ['purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment']);
            $table->decimal('quantity_in_kg', 15, 2); // positif untuk masuk, negatif untuk keluar
            $table->decimal('balance_after', 15, 2); // saldo stok setelah movement
            $table->string('reference_type')->nullable(); // misal: 'purchase', 'sale', 'transfer'
            $table->unsignedBigInteger('reference_id')->nullable(); // ID transaksi yang terkait
            $table->text('description')->nullable(); // keterangan tambahan
            $table->unsignedBigInteger('user_id'); // user yang melakukan transaksi
            $table->timestamps();

            // Foreign keys
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
            $table->foreign('warehouse_id')->references('id')->on('warehouses')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            // Index untuk performa query
            $table->index(['product_id', 'warehouse_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
