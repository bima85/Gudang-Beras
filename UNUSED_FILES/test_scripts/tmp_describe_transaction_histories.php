<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    $tables = DB::select("SHOW TABLES LIKE 'transaction_histories'");
    echo "tables found: " . count($tables) . PHP_EOL;
    foreach ($tables as $t) {
        $cols = (array)$t;
        echo implode(', ', $cols) . PHP_EOL;
    }

    if (count($tables) > 0) {
        $cols = DB::select("DESCRIBE transaction_histories");
        echo "\nDESCRIBE transaction_histories:\n";
        foreach ($cols as $c) {
            $row = (array)$c;
            echo $row['Field'] . " | " . $row['Type'] . " | " . $row['Null'] . " | " . $row['Key'] . " | " . $row['Default'] . PHP_EOL;
        }
    }
} catch (Exception $e) {
    echo 'Exception: ' . $e->getMessage() . PHP_EOL;
}
