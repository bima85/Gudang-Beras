<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaction_histories', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_number')->unique();
            $table->enum('transaction_type', ['purchase', 'sale', 'return', 'transfer', 'adjustment']);
            $table->dateTime('transaction_date');
            $table->string('related_party')->nullable();
            $table->foreignId('warehouse_id')->constrained('warehouses');
            $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
            $table->decimal('quantity', 16, 3);
            $table->string('unit');
            $table->decimal('price', 14, 3)->nullable();
            $table->decimal('subtotal', 18, 3)->nullable();
            $table->decimal('stock_before', 18, 3);
            $table->decimal('stock_after', 18, 3);
            $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->nullable();
            $table->text('notes')->nullable();
            // created_by -- storing who created the record. nullable to avoid migration problems when seeding/test users
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_histories');
    }
};
