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
        Schema::create('delivery_notes', function (Blueprint $table) {
            $table->id();
            $table->string('delivery_number', 20)->unique()->comment('Nomor surat jalan unik');
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->onDelete('cascade')
                ->comment('ID transaksi penjualan (opsional untuk manual delivery)');
            $table->foreignId('product_id')->constrained()->onDelete('cascade')
                ->comment('ID produk yang dipindahkan');
            $table->foreignId('warehouse_id')->constrained()->onDelete('cascade')
                ->comment('ID gudang asal');
            $table->foreignId('toko_id')->constrained('tokos')->onDelete('cascade')
                ->comment('ID toko tujuan');
            $table->decimal('qty_transferred', 15, 2)->comment('Jumlah yang ditransfer (unit asli)');
            $table->string('unit', 10)->comment('Unit satuan (kg, sak, ton)');
            $table->decimal('qty_kg', 15, 2)->comment('Jumlah dalam kg untuk konsistensi');
            $table->enum('status', ['pending', 'in_transit', 'delivered', 'cancelled'])
                ->default('pending')->comment('Status pengiriman');
            $table->text('notes')->nullable()->comment('Catatan tambahan');
            $table->timestamp('delivered_at')->nullable()->comment('Tanggal pengiriman');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade')
                ->comment('User yang membuat');
            $table->softDeletes();
            $table->timestamps();

            // Index untuk performance
            $table->index(['transaction_id', 'product_id']);
            $table->index(['warehouse_id', 'toko_id']);
            $table->index(['status', 'created_at']);
            $table->index('delivery_number');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('delivery_notes');
    }
};
