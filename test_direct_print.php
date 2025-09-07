<?php

require_once 'vendor/autoload.php';

use App\Models\Transaction;
use App\Models\User;

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TESTING DYNAMIC STORE INFO DIRECTLY ===\n\n";

$transaction = Transaction::first();
$user = User::where('email', 'admin_user@example.test')->first(); // Toko user

// Login the user
app('auth')->login($user);

echo "User: {$user->name} ({$user->email})\n";
echo "Roles: " . $user->roles->pluck('name')->join(', ') . "\n";
echo "Toko ID: " . ($user->toko_id ?? 'null') . "\n";

// Create controller instance manually
$controller = new \App\Http\Controllers\Apps\TransactionController();

// Manually set request user (simulate web request)
app('request')->setUserResolver(function () use ($user) {
    return $user;
});

// Get store info using reflection
$reflection = new ReflectionClass($controller);
$method = $reflection->getMethod('getStoreInfo');
$method->setAccessible(true);

$storeInfo = $method->invoke($controller, $transaction);

echo "\nGenerated Store Info:\n";
foreach ($storeInfo as $key => $value) {
    echo "  {$key}: " . ($value ?: 'N/A') . "\n";
}

// Check if toko exists
echo "\nToko Check:\n";
$toko = \App\Models\Toko::find($user->toko_id);
if ($toko) {
    echo "Toko found: {$toko->name}\n";
    echo "Address: {$toko->address}\n";
    echo "Phone: {$toko->phone}\n";
} else {
    echo "No toko found for user\n";
}
