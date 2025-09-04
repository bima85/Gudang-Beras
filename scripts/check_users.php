<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

function showUser($email)
{
    $u = App\Models\User::where('email', $email)->first();
    if (!$u) {
        echo "USER: $email NOT FOUND\n";
        return;
    }
    echo "USER: {$u->email}\n";
    echo "ROLES: " . implode(',', $u->getRoleNames()->toArray()) . "\n";
    echo "PERMS: " . implode(',', $u->getPermissionNames()->toArray()) . "\n";
}

showUser('admin_user@example.test');
echo "---\n";
showUser('admin_gudang@example.test');
