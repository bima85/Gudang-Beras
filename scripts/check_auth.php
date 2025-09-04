<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

echo "Running auth check...\n";

// Clean users table
// Note: Using Eloquent directly
User::query()->delete();

$user = User::create([
    'name' => 'Test User',
    'email' => 'test@example.com',
    'email_verified_at' => now(),
    'password' => Hash::make('password'),
]);

echo "User created: id={$user->id}, email={$user->email}\n";

$credentials = ['email' => 'test@example.com', 'password' => 'password'];
$attempt = Auth::attempt($credentials);

echo "Auth::attempt returned: ";
var_export($attempt);
echo "\n";

// Check Hash::check
$check = Hash::check('password', $user->password);
echo "Hash::check returned: ";
var_export($check);
echo "\n";

// Dump user from DB
$u = User::where('email', 'test@example.com')->first();
var_export($u->toArray());

echo "\nDone.\n";
