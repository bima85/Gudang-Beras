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
        Schema::table('transaction_histories', function (Blueprint $table) {
            // Kolom untuk purchase details
            $table->decimal('kuli_fee', 14, 3)->nullable()->after('subtotal');
            $table->decimal('timbangan', 16, 3)->nullable()->after('kuli_fee');

            // Kolom untuk sale details
            $table->decimal('discount', 14, 3)->nullable()->after('timbangan');
            $table->decimal('deposit_amount', 14, 3)->nullable()->after('discount');

            // Note: warehouse_id sudah dihapus oleh migration sebelumnya (2025_09_04_144307)
            // Lokasi sekarang menggunakan toko_id yang sudah ada
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_histories', function (Blueprint $table) {
            // Hanya drop kolom yang ditambahkan di migration ini
            $table->dropColumn(['kuli_fee', 'timbangan', 'discount', 'deposit_amount']);
        });
    }
};
