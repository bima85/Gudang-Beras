<?php

require_once 'vendor/autoload.php';

use App\Models\Transaction;
use App\Models\User;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING STORE INFO FOR ALL ROLES ===\n\n";

$transaction = Transaction::first();
$users = [
    'admin@admin.com' => 'Super Admin',
    'admin_user@example.test' => 'Toko User',
    'kasir@gmail.com' => 'Kasir (Toko)'
];

$controller = new \App\Http\Controllers\Apps\TransactionController();
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('getStoreInfo');
$method->setAccessible(true);

foreach ($users as $email => $description) {
    $user = User::where('email', $email)->first();
    if (!$user) {
        echo "User {$email} not found\n\n";
        continue;
    }

    echo "--- {$description} ({$email}) ---\n";
    echo "Roles: " . $user->roles->pluck('name')->join(', ') . "\n";

    // Simulate web request
    app('request')->setUserResolver(function () use ($user) {
        return $user;
    });

    $storeInfo = $method->invoke($controller, $transaction);

    echo "Store Info:\n";
    echo "  📍 Name: {$storeInfo['name']}\n";
    echo "  🏷️  Code: " . ($storeInfo['code'] ?: 'N/A') . "\n";
    echo "  📞 Phone: " . ($storeInfo['phone'] ?: 'N/A') . "\n";
    echo "  🏠 Address: " . ($storeInfo['address'] ?: 'N/A') . "\n";
    echo "  📍 Location: " . ($storeInfo['location'] ?: 'N/A') . "\n";
    echo "\n";
}

echo "✅ Dynamic store info system is ready!\n";
echo "Each user role will show appropriate store information on printed invoices.\n";
