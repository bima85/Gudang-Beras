<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('is_deposit')->default(false)->after('payment_method');
            $table->decimal('deposit_amount', 16, 2)->default(0)->after('is_deposit');
        });
    }
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['is_deposit', 'deposit_amount']);
        });
    }
};
