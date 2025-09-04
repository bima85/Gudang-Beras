<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Config;

echo "APP_ENV=" . env('APP_ENV') . PHP_EOL;
echo "DB_CONNECTION (default): " . Config::get('database.default') . PHP_EOL;
$connection = Config::get('database.default');
$database = Config::get("database.connections.$connection.database");
$host = Config::get("database.connections.$connection.host");
echo "DB database: $database\n";
echo "DB host: $host\n\n";

try {
    $tables = DB::select("SHOW TABLES");
    echo "Tables count: " . count($tables) . "\n";
    $preview = array_slice($tables, 0, 20);
    foreach ($preview as $t) {
        // each row is an object with key like 'Tables_in_databasename'
        $cols = (array)$t;
        echo implode(', ', $cols) . PHP_EOL;
    }
    echo "\n";
    $res = DB::select("SELECT migration, batch FROM migrations WHERE migration LIKE '%transaction_histories%'");
    echo "Migrations rows matching 'transaction_histories': " . count($res) . "\n";
    foreach ($res as $r) {
        echo $r->migration . " => batch " . $r->batch . PHP_EOL;
    }

    $exists = DB::select("SHOW TABLES LIKE 'transaction_histories'");
    echo "SHOW TABLES LIKE 'transaction_histories' => " . count($exists) . " rows\n";
} catch (Exception $e) {
    echo "Exception: " . $e->getMessage() . PHP_EOL;
}

echo "Done\n";
