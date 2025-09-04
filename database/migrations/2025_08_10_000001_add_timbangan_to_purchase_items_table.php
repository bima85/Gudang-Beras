<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            if (!Schema::hasColumn('purchase_items', 'timbangan')) {
                $table->decimal('timbangan', 15, 2)->nullable()->after('kuli_fee');
            }
        });
    }
    public function down(): void
    {
        Schema::table('purchase_items', function (Blueprint $table) {
            if (Schema::hasColumn('purchase_items', 'timbangan')) {
                $table->dropColumn('timbangan');
            }
        });
    }
};
