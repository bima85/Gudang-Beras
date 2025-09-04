<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$status = $kernel->handle(
    new Symfony\Component\Console\Input\ArgvInput,
    new Symfony\Component\Console\Output\ConsoleOutput
);

// Boot the framework
$kernel->bootstrap();

use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

function p($v)
{
    echo json_encode($v) . PHP_EOL;
}

$perm = Permission::where('name', 'stocks.view.gudang')->first();
if ($perm) {
    p(['permission' => 'found', 'id' => $perm->id, 'guard' => $perm->guard_name]);
} else {
    p(['permission' => 'not_found']);
    $perm = Permission::create(['name' => 'stocks.view.gudang', 'guard_name' => 'web']);
    p(['permission' => 'created', 'id' => $perm->id]);
}

// Assign to role 'gudang'
$role = Role::firstOrCreate(['name' => 'gudang']);
$role->givePermissionTo($perm->name);
p(['role_assigned' => 'gudang', 'permission' => $perm->name]);

// Assign to user admintoko@toko.com if exists
$user = User::where('email', 'admintoko@toko.com')->first();
if ($user) {
    $user->givePermissionTo($perm->name);
    p(['user_assigned' => $user->email, 'permission' => $perm->name]);
} else {
    p(['user_assigned' => 'not_found']);
}

// Also ensure stocks.view.toko exists
$perm2 = Permission::firstOrCreate(['name' => 'stocks.view.toko', 'guard_name' => 'web']);
$role->givePermissionTo($perm2->name);
if ($user) $user->givePermissionTo($perm2->name);
p(['ensured' => 'stocks.view.toko']);

$kernel->terminate(null, 0);
