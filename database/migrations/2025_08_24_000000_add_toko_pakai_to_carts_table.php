<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (! Schema::hasColumn('carts', 'toko_id')) {
                $table->unsignedBigInteger('toko_id')->nullable()->after('price');
                // Add foreign key if tokos table exists
                if (Schema::hasTable('tokos')) {
                    $table->foreign('toko_id')->references('id')->on('tokos')->onDelete('set null');
                }
            }
            if (! Schema::hasColumn('carts', 'pakai_stok_toko')) {
                $table->boolean('pakai_stok_toko')->default(false)->after('toko_id');
            }
            if (! Schema::hasColumn('carts', 'toko_consumed')) {
                $table->boolean('toko_consumed')->default(false)->after('pakai_stok_toko');
            }
        });
    }

    public function down(): void
    {
        Schema::table('carts', function (Blueprint $table) {
            if (Schema::hasColumn('carts', 'pakai_stok_toko')) {
                $table->dropColumn('pakai_stok_toko');
            }
            if (Schema::hasColumn('carts', 'toko_id')) {
                // drop foreign if exists
                try {
                    $table->dropForeign(['toko_id']);
                } catch (\Throwable $e) {
                    // ignore if foreign doesn't exist
                }
                $table->dropColumn('toko_id');
            }
        });
    }
};
