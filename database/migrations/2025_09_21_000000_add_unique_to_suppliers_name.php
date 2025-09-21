<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        if (Schema::hasTable('suppliers')) {
            Schema::table('suppliers', function (Blueprint $table) {
                // add unique index only if not exists (MySQL/SQL compatible check)
                $connection = Schema::getConnection();
                $dbName = $connection->getDatabaseName();
                $exists = DB::select(
                    "SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND INDEX_NAME = ?",
                    [$dbName, 'suppliers', 'suppliers_name_unique']
                );

                if (empty($exists)) {
                    $table->unique('name');
                }
            });
        }
    }

    public function down()
    {
        if (Schema::hasTable('suppliers')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropUnique('suppliers_name_unique');
            });
        }
    }
};
