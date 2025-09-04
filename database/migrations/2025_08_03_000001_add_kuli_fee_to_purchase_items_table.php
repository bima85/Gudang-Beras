<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_items', 'kuli_fee')) {
                $table->bigInteger('kuli_fee')->default(0)->after('subtotal');
            }
        });
    }
    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            if (Schema::hasColumn('purchase_items', 'kuli_fee')) {
                $table->dropColumn('kuli_fee');
            }
        });
    }
};
