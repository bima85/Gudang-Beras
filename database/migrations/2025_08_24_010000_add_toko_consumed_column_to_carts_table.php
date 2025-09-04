<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (! Schema::hasColumn('carts', 'toko_consumed')) {
                $table->boolean('toko_consumed')->default(false)->after('pakai_stok_toko');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (Schema::hasColumn('carts', 'toko_consumed')) {
                $table->dropColumn('toko_consumed');
            }
        });
    }
};
