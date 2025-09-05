<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

echo "=== CATEGORY TESTING - Permission Setup ===" . PHP_EOL;

// Check permissions
$permissions = Permission::where('name', 'like', 'categories%')->get();
echo "Category Permissions:" . PHP_EOL;
foreach ($permissions as $perm) {
    echo "- " . $perm->name . PHP_EOL;
}

// Check roles
$adminRole = Role::where('name', 'super-admin')->first();
if ($adminRole) {
    echo "✅ Admin role exists" . PHP_EOL;
} else {
    echo "❌ No super-admin role found" . PHP_EOL;
}

// Check admin user
$adminUser = User::where('email', 'admin@admin.com')->first();
if ($adminUser) {
    echo "✅ Admin user: " . $adminUser->name . PHP_EOL;
    echo "Roles: " . $adminUser->roles->pluck('name')->implode(', ') . PHP_EOL;

    // Check specific permission
    if ($adminUser->hasPermissionTo('categories-access')) {
        echo "✅ User has categories-access permission" . PHP_EOL;
    } else {
        echo "❌ User missing categories-access permission" . PHP_EOL;
    }
} else {
    echo "❌ No admin user found" . PHP_EOL;
}

echo PHP_EOL . "=== Testing Categories Model ===" . PHP_EOL;
$categories = \App\Models\Category::all();
echo "Total categories: " . $categories->count() . PHP_EOL;
foreach ($categories as $category) {
    echo "- " . $category->name . " (ID: " . $category->id . ")" . PHP_EOL;
}
