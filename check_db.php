<?php
$host = '127.0.0.1';
$db = 'point_of_sales';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query('SHOW TABLES');
    echo "Tables in database '$db':\n";
    $tables = [];
    while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
        echo $row[0] . "\n";
        $tables[] = $row[0];
    }

    // Check for stock_movements table specifically
    echo "\nChecking for stock_movements table:\n";
    if (in_array('stock_movements', $tables)) {
        echo "✅ stock_movements table exists!\n";

        // Check table structure
        echo "\nTable structure:\n";
        $stmt3 = $pdo->query("DESCRIBE stock_movements");
        while ($row = $stmt3->fetch(PDO::FETCH_ASSOC)) {
            echo $row['Field'] . " - " . $row['Type'] . " - " . $row['Null'] . " - " . $row['Key'] . " - " . $row['Default'] . " - " . $row['Extra'] . "\n";
        }

        // Check data count
        echo "\nData count:\n";
        $stmt4 = $pdo->query("SELECT COUNT(*) as count FROM stock_movements");
        $count = $stmt4->fetch(PDO::FETCH_ASSOC);
        echo "Total records: " . $count['count'] . "\n";

        if ($count['count'] > 0) {
            echo "\nSample data (first 5 records):\n";
            $stmt5 = $pdo->query("SELECT id, product_id, warehouse_id, toko_id, type, quantity_in_kg, balance_after, created_at FROM stock_movements ORDER BY created_at DESC LIMIT 5");
            while ($row = $stmt5->fetch(PDO::FETCH_ASSOC)) {
                echo "ID: {$row['id']}, Product: {$row['product_id']}, Warehouse: {$row['warehouse_id']}, Toko: {$row['toko_id']}, Type: {$row['type']}, Qty: {$row['quantity_in_kg']}, Balance: {$row['balance_after']}, Date: {$row['created_at']}\n";
            }
        } else {
            echo "❌ No data in stock_movements table!\n";
        }
    } else {
        echo "❌ stock_movements table does not exist!\n";
        echo "Available tables: " . implode(', ', $tables) . "\n";
    }
} catch (Exception $e) {
    echo '❌ Error: ' . $e->getMessage() . "\n";
}
