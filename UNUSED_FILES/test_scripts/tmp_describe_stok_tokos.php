<?php
$e = @file_get_contents('.env');
preg_match('/DB_HOST=(.*)/', $e, $m);
$host = trim($m[1] ?? '127.0.0.1');
preg_match('/DB_PORT=(.*)/', $e, $m);
$port = trim($m[1] ?? '3306');
preg_match('/DB_DATABASE=(.*)/', $e, $m);
$db = trim($m[1] ?? '');
preg_match('/DB_USERNAME=(.*)/', $e, $m);
$user = trim($m[1] ?? 'root');
preg_match('/DB_PASSWORD=(.*)/', $e, $m);
$pass = trim($m[1] ?? '');
$pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

echo "COLUMNS:\n";
foreach ($pdo->query('SHOW FULL COLUMNS FROM stok_tokos') as $r) {
    echo json_encode($r) . "\n";
}

echo "\nSHOW CREATE TABLE:\n";
foreach ($pdo->query('SHOW CREATE TABLE stok_tokos') as $r) {
    echo $r['Create Table'] . "\n";
}

echo "\nSAMPLE ROWS (last 5):\n";
foreach ($pdo->query('SELECT * FROM stok_tokos ORDER BY id DESC LIMIT 5') as $r) {
    echo json_encode($r) . "\n";
}
