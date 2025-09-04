<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::table('carts', function (Blueprint $table) {
            if (!Schema::hasColumn('carts', 'stok_toko_id')) {
                $table->unsignedBigInteger('stok_toko_id')->nullable()->after('toko_consumed');
            }
        });
    }

    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
            if (Schema::hasColumn('carts', 'stok_toko_id')) {
                $table->dropColumn('stok_toko_id');
            }
        });
    }
};
