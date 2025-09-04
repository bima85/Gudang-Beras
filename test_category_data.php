<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "=== CATEGORY API/FRONTEND DATA CHECK ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

// Check categories data
$categories = Category::all();
echo PHP_EOL . "Available Categories:" . PHP_EOL;
foreach ($categories as $category) {
    echo "ID: {$category->id} | Code: {$category->code} | Name: {$category->name}" . PHP_EOL;
    echo "  Description: {$category->description}" . PHP_EOL;
    echo "  Created: {$category->created_at}" . PHP_EOL;
    echo "  ---" . PHP_EOL;
}

echo PHP_EOL . "Total Categories: " . $categories->count() . PHP_EOL;

// Test the JSON response format
echo PHP_EOL . "=== JSON FORMAT TEST ===" . PHP_EOL;
$categoriesArray = $categories->map(function ($category) {
    return [
        'id' => $category->id,
        'code' => $category->code,
        'name' => $category->name,
        'description' => $category->description,
        'image' => $category->image,
        'created_at' => $category->created_at?->format('Y-m-d H:i:s'),
        'updated_at' => $category->updated_at?->format('Y-m-d H:i:s'),
    ];
});

echo json_encode($categoriesArray, JSON_PRETTY_PRINT) . PHP_EOL;

// Check permissions
echo PHP_EOL . "=== PERMISSION CHECK ===" . PHP_EOL;
$permissions = $adminUser->getAllPermissions();
$categoryPermissions = $permissions->filter(function ($permission) {
    return str_contains($permission->name, 'category');
});

echo "Category-related permissions:" . PHP_EOL;
foreach ($categoryPermissions as $permission) {
    echo "- " . $permission->name . PHP_EOL;
}

// Check user roles
echo PHP_EOL . "User roles:" . PHP_EOL;
foreach ($adminUser->roles as $role) {
    echo "- " . $role->name . PHP_EOL;
}

echo PHP_EOL . "✅ DATA CHECK COMPLETED" . PHP_EOL;
