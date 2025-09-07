<?php

require_once 'vendor/autoload.php';

use App\Models\Transaction;
use App\Models\User;
use App\Http\Controllers\Apps\TransactionController;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING DYNAMIC STORE INFO FOR PRINT ===\n\n";

// Test different users and their associated store info
$users = [
    'admin@admin.com' => 'Super Admin',
    'admin_user@example.test' => 'Toko User',
    'kasir@gmail.com' => 'Kasir (Toko)'
];

$transaction = Transaction::first();
if (!$transaction) {
    echo "No transactions found for testing\n";
    exit;
}

echo "Testing with Transaction ID: {$transaction->id}\n";
echo "Transaction Invoice: {$transaction->invoice}\n\n";

foreach ($users as $email => $description) {
    $user = User::where('email', $email)->first();
    if (!$user) {
        echo "User {$email} not found\n";
        continue;
    }

    echo "--- Testing with {$description} ({$email}) ---\n";
    echo "User Roles: " . $user->roles->pluck('name')->join(', ') . "\n";
    echo "Associated Warehouse ID: " . ($user->warehouse_id ?? 'null') . "\n";
    echo "Associated Toko ID: " . ($user->toko_id ?? 'null') . "\n";

    // Check role methods
    echo "hasRole('Toko'): " . ($user->hasRole('Toko') ? 'true' : 'false') . "\n";
    echo "hasRole('Gudang'): " . ($user->hasRole('Gudang') ? 'true' : 'false') . "\n";
    echo "hasRole('super-admin'): " . ($user->hasRole('super-admin') ? 'true' : 'false') . "\n";

    // Simulate request with this user
    app('auth')->login($user);

    // Test the getStoreInfo method
    $controller = new TransactionController();
    $method = new ReflectionMethod($controller, 'getStoreInfo');
    $method->setAccessible(true);
    $storeInfo = $method->invoke($controller, $transaction);

    echo "Generated Store Info:\n";
    echo "  Name: {$storeInfo['name']}\n";
    echo "  Code: " . ($storeInfo['code'] ?: 'N/A') . "\n";
    echo "  Phone: " . ($storeInfo['phone'] ?: 'N/A') . "\n";
    echo "  Address: " . ($storeInfo['address'] ?: 'N/A') . "\n";
    echo "  Location: " . ($storeInfo['location'] ?: 'N/A') . "\n";
    echo "\n";
}
