<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->boolean('is_tempo')->default(false)->after('payment_method');
            $table->date('tempo_due_date')->nullable()->after('is_tempo');
        });
    }
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn(['is_tempo', 'tempo_due_date']);
        });
    }
};
