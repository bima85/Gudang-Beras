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
        if (!Schema::hasColumn('users', 'force_gudang_view')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('force_gudang_view')->default(false)->after('remember_token');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasColumn('users', 'force_gudang_view')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('force_gudang_view');
            });
        }
    }
};
