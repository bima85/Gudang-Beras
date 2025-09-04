<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('surat_jalans', function (Blueprint $table) {
            $table->timestamp('picked_at')->nullable()->after('status');
        });
    }

    public function down()
    {
        Schema::table('surat_jalans', function (Blueprint $table) {
            $table->dropColumn('picked_at');
        });
    }
};
