<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\CategoryController;
use App\Models\User;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

echo "=== CATEGORY VALIDATION & EDGE CASES TESTING ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new CategoryController();

echo PHP_EOL . "=== TEST 1: Validation - Empty Fields ===" . PHP_EOL;

try {
    $emptyData = [
        'code' => '',
        'name' => '',
        'description' => ''
    ];

    $request = Request::create('/dashboard/categories', 'POST', $emptyData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "❌ Should have failed validation but didn't" . PHP_EOL;
} catch (ValidationException $e) {
    echo "✅ Validation working - Empty fields rejected" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Unexpected error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: Validation - Duplicate Code ===" . PHP_EOL;

try {
    $existingCategory = Category::first();
    $duplicateData = [
        'code' => $existingCategory->code, // Use existing code
        'name' => 'Duplicate Test',
        'description' => 'Testing duplicate code validation'
    ];

    $request = Request::create('/dashboard/categories', 'POST', $duplicateData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "❌ Should have failed duplicate validation but didn't" . PHP_EOL;
} catch (ValidationException $e) {
    echo "✅ Duplicate code validation working" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Unexpected error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 3: Update with Same Code (Should Succeed) ===" . PHP_EOL;

try {
    $category = Category::first();
    $updateData = [
        'code' => $category->code, // Same code should be allowed in update
        'name' => $category->name . ' Updated',
        'description' => $category->description . ' - Updated'
    ];

    $request = Request::create('/dashboard/categories/' . $category->id, 'PUT', $updateData);
    app()->instance('request', $request);

    $response = $controller->update($request, $category);
    echo "✅ Update with same code successful" . PHP_EOL;

    $category->refresh();
    echo "Updated name: " . $category->name . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error updating with same code: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 4: Long String Validation ===" . PHP_EOL;

try {
    $longData = [
        'code' => str_repeat('A', 300), // Very long code
        'name' => str_repeat('B', 300), // Very long name
        'description' => str_repeat('C', 1000) // Very long description
    ];

    $request = Request::create('/dashboard/categories', 'POST', $longData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "⚠️ Long strings accepted - check database column lengths" . PHP_EOL;

    // Clean up if created
    $createdCategory = Category::where('code', str_repeat('A', 300))->first();
    if ($createdCategory) {
        $createdCategory->delete();
        echo "Cleaned up long string test category" . PHP_EOL;
    }
} catch (ValidationException $e) {
    echo "✅ Long string validation working" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Error with long strings: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 5: Search Edge Cases ===" . PHP_EOL;

try {
    // Test empty search
    $request = Request::create('/dashboard/categories?search=', 'GET');
    app()->instance('request', $request);
    $response = $controller->index();
    echo "✅ Empty search handled" . PHP_EOL;

    // Test search with special characters
    $request = Request::create('/dashboard/categories?search=%20@#$%', 'GET');
    app()->instance('request', $request);
    $response = $controller->index();
    echo "✅ Special character search handled" . PHP_EOL;

    // Test very long search term
    $longSearch = str_repeat('x', 1000);
    $request = Request::create('/dashboard/categories?search=' . urlencode($longSearch), 'GET');
    app()->instance('request', $request);
    $response = $controller->index();
    echo "✅ Long search term handled" . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Search edge case error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 6: Delete Category with Relations ===" . PHP_EOL;

try {
    // First, check if there are products linked to categories
    $categoryWithProducts = Category::has('products')->first();

    if ($categoryWithProducts) {
        echo "Found category with products: " . $categoryWithProducts->name . PHP_EOL;
        echo "Products count: " . $categoryWithProducts->products->count() . PHP_EOL;

        // Try to delete - this should either cascade or fail gracefully
        $response = $controller->destroy($categoryWithProducts);
        echo "⚠️ Category with products deletion - check if this should be allowed" . PHP_EOL;
    } else {
        echo "✅ No categories with products found - relation constraint testing skipped" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "✅ Category with relations deletion prevented: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== SUMMARY ===" . PHP_EOL;
$finalCategories = Category::all();
echo "Final category count: " . $finalCategories->count() . PHP_EOL;
foreach ($finalCategories as $category) {
    echo "- " . $category->name . " (Code: " . $category->code . ")" . PHP_EOL;
}

echo PHP_EOL . "✅ CATEGORY VALIDATION TESTING COMPLETED" . PHP_EOL;
