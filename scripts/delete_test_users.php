<?php
// Script to delete test/demo users from the app database
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;

$emails = [
    'admin_user@example.test',
    'admin_gudang@example.test',
    'kasir@gmail.com',
];

$existing = User::whereIn('email', $emails)->get();
$count = $existing->count();
if ($count === 0) {
    echo "No matching test users found.\n";
    exit(0);
}

foreach ($existing as $u) {
    echo "Deleting: {$u->email}\n";
    $u->delete();
}

echo "Deleted {$count} user(s).\n";
