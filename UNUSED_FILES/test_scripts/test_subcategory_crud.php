<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\SubcategoryController;
use App\Models\User;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

echo "=== SUBCATEGORY CRUD & VALIDATION TESTING - Phase 3 ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new SubcategoryController();

// First, let's fix the existing subcategory without category
echo PHP_EOL . "=== FIXING EXISTING DATA ===" . PHP_EOL;
$orphanSubcategory = Subcategory::whereNull('category_id')->orWhereDoesntHave('category')->first();
if ($orphanSubcategory) {
    $firstCategory = Category::first();
    $orphanSubcategory->update(['category_id' => $firstCategory->id]);
    echo "✅ Fixed orphan subcategory: " . $orphanSubcategory->name . " -> " . $firstCategory->name . PHP_EOL;
}

echo PHP_EOL . "=== TEST 1: Create Multiple Test Subcategories ===" . PHP_EOL;

$categories = Category::all();
$testSubcategories = [];

foreach ($categories->take(3) as $index => $category) {
    try {
        $subcategoryData = [
            'name' => 'Sub ' . $category->name,
            'code' => 'SUB-' . $category->code . '-' . ($index + 1),
            'description' => 'Subcategory untuk ' . $category->name,
            'category_id' => $category->id
        ];

        $request = Request::create('/dashboard/subcategories', 'POST', $subcategoryData);
        app()->instance('request', $request);

        $response = $controller->store($request);

        $createdSubcategory = Subcategory::where('code', $subcategoryData['code'])->first();
        if ($createdSubcategory) {
            $testSubcategories[] = $createdSubcategory;
            echo "✅ Created: " . $createdSubcategory->name . " under " . $category->name . PHP_EOL;
        }
    } catch (\Exception $e) {
        echo "❌ Error creating subcategory for " . $category->name . ": " . $e->getMessage() . PHP_EOL;
    }
}

echo PHP_EOL . "=== TEST 2: Validation - Empty Fields ===" . PHP_EOL;

try {
    $emptyData = [
        'name' => '',
        'code' => '',
        'category_id' => ''
    ];

    $request = Request::create('/dashboard/subcategories', 'POST', $emptyData);
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

echo PHP_EOL . "=== TEST 3: Validation - Duplicate Code ===" . PHP_EOL;

try {
    $existingSubcategory = Subcategory::first();
    $duplicateData = [
        'name' => 'Duplicate Test',
        'code' => $existingSubcategory->code, // Use existing code
        'description' => 'Testing duplicate code validation',
        'category_id' => Category::first()->id
    ];

    $request = Request::create('/dashboard/subcategories', 'POST', $duplicateData);
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

echo PHP_EOL . "=== TEST 4: Validation - Invalid Category ===" . PHP_EOL;

try {
    $invalidCategoryData = [
        'name' => 'Invalid Category Test',
        'code' => 'INV-CAT-' . time(),
        'description' => 'Testing invalid category validation',
        'category_id' => 99999 // Non-existent category
    ];

    $request = Request::create('/dashboard/subcategories', 'POST', $invalidCategoryData);
    app()->instance('request', $request);

    $response = $controller->store($request);
    echo "❌ Should have failed category validation but didn't" . PHP_EOL;
} catch (ValidationException $e) {
    echo "✅ Invalid category validation working" . PHP_EOL;
    $errors = $e->errors();
    foreach ($errors as $field => $messages) {
        echo "  - $field: " . implode(', ', $messages) . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Unexpected error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 5: Update with Same Code (Should Succeed) ===" . PHP_EOL;

try {
    $subcategory = Subcategory::first();
    $updateData = [
        'name' => $subcategory->name . ' Updated Again',
        'code' => $subcategory->code, // Same code should be allowed in update
        'description' => $subcategory->description . ' - Updated again',
        'category_id' => $subcategory->category_id
    ];

    $request = Request::create('/dashboard/subcategories/' . $subcategory->id, 'PUT', $updateData);
    app()->instance('request', $request);

    $response = $controller->update($request, $subcategory);
    echo "✅ Update with same code successful" . PHP_EOL;

    $subcategory->refresh();
    echo "Updated name: " . $subcategory->name . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error updating with same code: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 6: Category-Subcategory Relationship Test ===" . PHP_EOL;

$categoriesWithSubcategories = Category::with('subcategories')->get();
foreach ($categoriesWithSubcategories as $category) {
    $subcategoryCount = $category->subcategories->count();
    echo "Category: {$category->name} -> {$subcategoryCount} subcategories" . PHP_EOL;

    foreach ($category->subcategories as $subcategory) {
        echo "  - {$subcategory->name} (Code: {$subcategory->code})" . PHP_EOL;
    }
}

echo PHP_EOL . "=== TEST 7: Index with Pagination Test ===" . PHP_EOL;

try {
    // Test different pagination sizes
    $paginationSizes = [5, 10, 15];

    foreach ($paginationSizes as $perPage) {
        $request = Request::create('/dashboard/subcategories?per_page=' . $perPage, 'GET');
        app()->instance('request', $request);

        $response = $controller->index($request);
        echo "✅ Pagination with {$perPage} per page works" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Pagination error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== FINAL SUMMARY ===" . PHP_EOL;
$finalSubcategories = Subcategory::with('category')->get();
echo "Total subcategories: " . $finalSubcategories->count() . PHP_EOL;

echo PHP_EOL . "All subcategories with their categories:" . PHP_EOL;
foreach ($finalSubcategories as $subcategory) {
    $categoryName = $subcategory->category ? $subcategory->category->name : 'No Category';
    echo "- {$subcategory->name} (Code: {$subcategory->code}) -> {$categoryName}" . PHP_EOL;
}

echo PHP_EOL . "✅ SUBCATEGORY CRUD & VALIDATION TESTING COMPLETED" . PHP_EOL;
