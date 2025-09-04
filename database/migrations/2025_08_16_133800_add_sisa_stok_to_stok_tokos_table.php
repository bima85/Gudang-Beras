<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class AddSisaStokToStokTokosTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        if (!Schema::hasColumn('stok_tokos', 'sisa_stok')) {
            Schema::table('stok_tokos', function (Blueprint $table) {
                // decimal with two decimals, nullable to avoid issues on existing rows
                $table->decimal('sisa_stok', 15, 2)->nullable()->after('qty');
            });

            // Initialize existing rows: copy current qty into sisa_stok where null
            try {
                DB::table('stok_tokos')->whereNull('sisa_stok')->update(['sisa_stok' => DB::raw('qty')]);
            } catch (\Throwable $e) {
                // swallow — if update fails (e.g. DB restrictions) migration still created column
            }
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        if (Schema::hasColumn('stok_tokos', 'sisa_stok')) {
            Schema::table('stok_tokos', function (Blueprint $table) {
                $table->dropColumn('sisa_stok');
            });
        }
    }
}
