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
$stmt = $pdo->query("SELECT MAX(stok_tokos.id) as id, stok_tokos.product_id, stok_tokos.toko_id, SUM(stok_tokos.qty * COALESCE(units.conversion_to_kg,1)) as total_kg, MAX(stok_tokos.created_at) as last_update FROM stok_tokos JOIN units on units.id=stok_tokos.unit_id GROUP BY stok_tokos.product_id, stok_tokos.toko_id");
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    echo json_encode($r) . "\n";
}
