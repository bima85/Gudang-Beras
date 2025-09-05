<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

echo "APP_ENV=" . env('APP_ENV') . PHP_EOL;
echo "DB_CONNECTION=" . Config::get('database.default') . PHP_EOL;
$connection = Config::get('database.default');
echo "DB_HOST=" . Config::get("database.connections.$connection.host") . PHP_EOL;
echo "DB_DATABASE=" . Config::get("database.connections.$connection.database") . PHP_EOL;
echo "DB_USERNAME=" . Config::get("database.connections.$connection.username") . PHP_EOL;

try {
    $tables = DB::select("SHOW TABLES LIKE 'transaction_histories'");
    echo "SHOW TABLES LIKE 'transaction_histories' => " . count($tables) . "\n";
    if (count($tables) > 0) {
        $cols = DB::select("DESCRIBE transaction_histories");
        echo "DESCRIBE transaction_histories:\n";
        foreach ($cols as $c) {
            $r = (array)$c;
            echo $r['Field'] . ' | ' . $r['Type'] . ' | ' . $r['Null'] . PHP_EOL;
        }
    }

    $m = DB::select("SELECT migration, batch FROM migrations WHERE migration LIKE '%transaction_histories%'");
    echo "migrations rows: " . count($m) . "\n";
    foreach ($m as $row) {
        echo $row->migration . ' => batch ' . $row->batch . PHP_EOL;
    }

    // Also show current database name from SQL
    $dbn = DB::select("SELECT DATABASE() AS db");
    echo "SQL DATABASE(): " . ($dbn[0]->db ?? 'NULL') . PHP_EOL;
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . PHP_EOL;
}
