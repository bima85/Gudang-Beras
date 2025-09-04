<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $res = DB::select("SHOW TABLES LIKE '%transaction%'");
    echo "Found: " . count($res) . "\n";
    foreach ($res as $r) {
        $cols = (array)$r;
        echo implode(', ', $cols) . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'Exception: ' . $e->getMessage() . PHP_EOL;
}
