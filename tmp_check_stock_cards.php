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
echo 'stock_cards: ' . ($pdo->query('SELECT COUNT(*) FROM stock_cards')->fetchColumn()) . "\n";
foreach ($pdo->query('SELECT id,product_id,toko_id,qty,saldo,date,note FROM stock_cards ORDER BY id DESC LIMIT 5') as $r) echo json_encode($r) . "\n";
