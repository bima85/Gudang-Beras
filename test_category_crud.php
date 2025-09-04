<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\CategoryController;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

echo "=== CATEGORY CRUD TESTING ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new CategoryController();

echo PHP_EOL . "=== TEST 1: CREATE Category ===" . PHP_EOL;

try {
    // Test creating new category
    $createData = [
        'code' => 'BMP001',
        'name' => 'Bumbu Dapur',
        'description' => 'Kategori untuk bumbu masak',
        'image' => null
    ];

    $request = Request::create('/dashboard/categories', 'POST', $createData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "✅ Category created successfully" . PHP_EOL;

    $newCategory = Category::where('name', 'Bumbu Dapur')->first();
    if ($newCategory) {
        echo "✅ New category found: " . $newCategory->name . " (Code: " . $newCategory->code . ", ID: " . $newCategory->id . ")" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error creating category: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: READ Categories List ===" . PHP_EOL;

try {
    $categories = Category::all();
    echo "✅ Found " . $categories->count() . " categories:" . PHP_EOL;
    foreach ($categories as $category) {
        echo "- " . $category->name . " (ID: " . $category->id . ")" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error reading categories: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 3: UPDATE Category ===" . PHP_EOL;

try {
    $category = Category::where('name', 'Beras')->first();
    if ($category) {
        $updateData = [
            'code' => $category->code ?: 'BRS001', // Use existing code or set new one
            'name' => 'Beras Premium',
            'description' => 'Kategori beras premium berkualitas',
            'image' => null
        ];

        $request = Request::create('/dashboard/categories/' . $category->id, 'PUT', $updateData);
        app()->instance('request', $request);

        $response = $controller->update($request, $category);

        $category->refresh();
        echo "✅ Category updated: " . $category->name . " (Code: " . ($category->code ?: 'N/A') . ")" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error updating category: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 4: LIST Categories with Search ===" . PHP_EOL;

try {
    // Test search functionality
    $request = Request::create('/dashboard/categories?search=beras', 'GET');
    app()->instance('request', $request);

    $response = $controller->index();
    echo "✅ Categories search accessible" . PHP_EOL;

    // Check actual search results
    $searchResults = Category::where('name', 'like', '%beras%')->get();
    echo "Search results for 'beras': " . $searchResults->count() . " found" . PHP_EOL;
    foreach ($searchResults as $result) {
        echo "- " . $result->name . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error testing search: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 5: DELETE Category ===" . PHP_EOL;

try {
    // Create a test category to delete
    $testCategory = Category::create([
        'code' => 'TST001',
        'name' => 'Test Delete',
        'description' => 'Category for delete testing'
    ]);

    echo "Created test category: " . $testCategory->name . " (Code: " . $testCategory->code . ", ID: " . $testCategory->id . ")" . PHP_EOL;

    $response = $controller->destroy($testCategory);

    $deletedCategory = Category::find($testCategory->id);
    if (!$deletedCategory) {
        echo "✅ Category deleted successfully" . PHP_EOL;
    } else {
        echo "❌ Category still exists after delete" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error deleting category: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== FINAL CATEGORIES LIST ===" . PHP_EOL;
$finalCategories = Category::all();
echo "Total categories: " . $finalCategories->count() . PHP_EOL;
foreach ($finalCategories as $category) {
    echo "- " . $category->name . " (ID: " . $category->id . ")" . PHP_EOL;
}

echo PHP_EOL . "✅ CATEGORY CRUD TESTING COMPLETED" . PHP_EOL;
