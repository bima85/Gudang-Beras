<?php
// One-off script: populate stock_cards for stok_tokos entries that don't have a corresponding StockCard
// Usage: php scripts/populate_toko_stock_cards.php [--apply]
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

$sql = "SELECT st.id, st.product_id, st.toko_id, st.unit_id, st.qty, st.created_at, u.conversion_to_kg
    FROM stok_tokos st
    LEFT JOIN units u ON u.id = st.unit_id
    WHERE st.toko_id IS NOT NULL
    ORDER BY st.created_at ASC, st.id ASC";
$stmt = $pdo->query($sql);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (!$rows) {
    echo "No stok_tokos for toko found.\n";
    exit(0);
}

$inserts = [];
foreach ($rows as $r) {
    $noteTag = "From stok_toko #" . $r['id'];
    // skip if stock_card with this note already exists
    $check = $pdo->prepare('SELECT COUNT(*) FROM stock_cards WHERE note = ?');
    $check->execute([$noteTag]);
    $exists = $check->fetchColumn();
    if ($exists) continue;

    $conv = $r['conversion_to_kg'] ?? 1;
    $qty_kg = (float)$r['qty'] * (float)$conv;
    // stok_tokos tidak menyimpan kolom type; anggap sebagai 'in' (penambahan stok toko)
    $type = 'in';
    $signed = $qty_kg; // since type is 'in'

    // get last saldo for product+toko
    $ps = $pdo->prepare('SELECT saldo FROM stock_cards WHERE product_id = ? AND toko_id = ? ORDER BY date DESC, id DESC LIMIT 1');
    $ps->execute([$r['product_id'], $r['toko_id']]);
    $lastSaldo = (float)($ps->fetchColumn() ?: 0);
    $newSaldo = $lastSaldo + $signed;

    $inserts[] = [
        'product_id' => $r['product_id'],
        'warehouse_id' => null,
        'toko_id' => $r['toko_id'],
        'unit_id' => $r['unit_id'],
        'date' => date('Y-m-d', strtotime($r['created_at'])),
        'type' => $type,
        'qty' => $qty_kg,
        'saldo' => $newSaldo,
        'note' => $noteTag,
        'user_id' => null,
        'created_at' => $r['created_at'],
        'updated_at' => $r['created_at'],
    ];
}

if (empty($inserts)) {
    echo "No new StockCard entries to create (all stok_tokos already have StockCard notes).\n";
    exit(0);
}

echo "Found " . count($inserts) . " StockCard(s) to create.\n";
foreach ($inserts as $i => $ins) {
    echo sprintf(
        "%d) product_id=%s toko_id=%s date=%s type=%s qty=%.3f saldo=%.3f note=%s\n",
        $i + 1,
        $ins['product_id'],
        $ins['toko_id'],
        $ins['date'],
        $ins['type'],
        $ins['qty'],
        $ins['saldo'],
        $ins['note']
    );
}

if ($apply) {
    echo "\nApplying inserts...\n";
    $pdo->beginTransaction();
    try {
        $q = $pdo->prepare('INSERT INTO stock_cards (product_id, warehouse_id, toko_id, unit_id, date, type, qty, saldo, note, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        foreach ($inserts as $ins) {
            $q->execute([
                $ins['product_id'],
                $ins['warehouse_id'],
                $ins['toko_id'],
                $ins['unit_id'],
                $ins['date'],
                $ins['type'],
                $ins['qty'],
                $ins['saldo'],
                $ins['note'],
                $ins['user_id'],
                $ins['created_at'],
                $ins['updated_at']
            ]);
        }
        $pdo->commit();
        echo "Inserted " . count($inserts) . " stock_cards.\n";
    } catch (Exception $ex) {
        $pdo->rollBack();
        echo "Failed to insert: " . $ex->getMessage() . "\n";
    }
} else {
    echo "\nRun with --apply to insert these rows.\n";
}
