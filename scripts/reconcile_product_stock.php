<?php

/**
 * Usage:
 * php scripts/reconcile_product_stock.php [--apply]
 * --apply -> actually update products.stock, otherwise dry-run
 */
$apply = in_array('--apply', $argv);
$e = @file_get_contents(__DIR__ . '/../.env');
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

// Compute expected stock per product from stok_tokos
$stmt = $pdo->query("SELECT stok_tokos.product_id, SUM(stok_tokos.qty * COALESCE(units.conversion_to_kg,1)) as expected_stock_kg FROM stok_tokos JOIN units ON units.id = stok_tokos.unit_id GROUP BY stok_tokos.product_id");
$expected = [];
while ($r = $stmt->fetch(PDO::FETCH_ASSOC)) {
    $expected[$r['product_id']] = (float)$r['expected_stock_kg'];
}

// Get current products
$prodStmt = $pdo->query('SELECT id, stock FROM products');
$products = [];
while ($p = $prodStmt->fetch(PDO::FETCH_ASSOC)) {
    $products[$p['id']] = (float)$p['stock'];
}

echo "Reconciliation report\n";
$toUpdate = [];
foreach ($expected as $pid => $exp) {
    $cur = $products[$pid] ?? 0.0;
    $diff = $exp - $cur;
    if (abs($diff) > 0.0001) {
        echo "Product $pid: current=$cur expected=$exp diff={$diff}\n";
        $toUpdate[$pid] = $exp;
    }
}

if (empty($toUpdate)) {
    echo "All products consistent.\n";
    exit(0);
}

if ($apply) {
    echo "Applying updates...\n";
    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare('UPDATE products SET stock = :stock WHERE id = :id');
        foreach ($toUpdate as $pid => $val) {
            $update->execute([':stock' => $val, ':id' => $pid]);
            echo "Updated product $pid -> $val\n";
        }
        $pdo->commit();
        echo "Applied changes.\n";
    } catch (Exception $ex) {
        $pdo->rollBack();
        echo "Error applying changes: " . $ex->getMessage() . "\n";
    }
} else {
    echo "Dry-run only. Run with --apply to apply changes.\n";
}
