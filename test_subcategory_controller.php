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

echo "=== SUBCATEGORY CONTROLLER TESTING - Phase 2 ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

$controller = new SubcategoryController();

echo PHP_EOL . "=== TEST 1: Index Method ===" . PHP_EOL;

try {
    $request = Request::create('/dashboard/subcategories', 'GET');
    app()->instance('request', $request);

    $response = $controller->index($request);
    echo "✅ Index method executed successfully" . PHP_EOL;
    echo "Response type: " . get_class($response) . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Index method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 2: Create Method ===" . PHP_EOL;

try {
    $response = $controller->create();
    echo "✅ Create method executed successfully" . PHP_EOL;
    echo "Response type: " . get_class($response) . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Create method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 3: Store Method with Valid Data ===" . PHP_EOL;

try {
    // Get first available category
    $category = Category::first();
    if (!$category) {
        echo "❌ No categories available for testing" . PHP_EOL;
    } else {
        $storeData = [
            'name' => 'Test Subcategory Store',
            'code' => 'TST-STORE-' . time(),
            'description' => 'Test subcategory for store method',
            'category_id' => $category->id
        ];

        $request = Request::create('/dashboard/subcategories', 'POST', $storeData);
        app()->instance('request', $request);

        $response = $controller->store($request);
        echo "✅ Store method executed successfully" . PHP_EOL;
        echo "Response type: " . get_class($response) . PHP_EOL;

        // Verify the subcategory was created
        $createdSubcategory = Subcategory::where('code', $storeData['code'])->first();
        if ($createdSubcategory) {
            echo "✅ Subcategory created in database: " . $createdSubcategory->name . PHP_EOL;
            echo "Category: " . $createdSubcategory->category->name . PHP_EOL;
        }
    }
} catch (\Exception $e) {
    echo "❌ Store method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 4: Edit Method ===" . PHP_EOL;

try {
    $subcategory = Subcategory::first();
    if (!$subcategory) {
        echo "❌ No subcategories available for edit testing" . PHP_EOL;
    } else {
        $response = $controller->edit($subcategory);
        echo "✅ Edit method executed successfully" . PHP_EOL;
        echo "Response type: " . get_class($response) . PHP_EOL;
        echo "Editing subcategory: " . $subcategory->name . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Edit method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 5: Update Method ===" . PHP_EOL;

try {
    $subcategory = Subcategory::where('name', 'Test Subcategory Store')->first();
    if (!$subcategory) {
        $subcategory = Subcategory::first();
    }

    if (!$subcategory) {
        echo "❌ No subcategories available for update testing" . PHP_EOL;
    } else {
        $updateData = [
            'name' => $subcategory->name . ' Updated',
            'code' => $subcategory->code,
            'description' => $subcategory->description . ' - Updated via test',
            'category_id' => $subcategory->category_id
        ];

        $request = Request::create('/dashboard/subcategories/' . $subcategory->id, 'PUT', $updateData);
        app()->instance('request', $request);

        $response = $controller->update($request, $subcategory);
        echo "✅ Update method executed successfully" . PHP_EOL;
        echo "Response type: " . get_class($response) . PHP_EOL;

        // Verify update
        $subcategory->refresh();
        echo "Updated name: " . $subcategory->name . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Update method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== TEST 6: Destroy Method ===" . PHP_EOL;

try {
    // Create a test subcategory for deletion
    $category = Category::first();
    $testSubcategory = Subcategory::create([
        'name' => 'Test Delete Subcategory',
        'code' => 'TST-DEL-' . time(),
        'description' => 'Test subcategory for deletion',
        'category_id' => $category->id
    ]);

    echo "Created test subcategory for deletion: " . $testSubcategory->name . PHP_EOL;

    $response = $controller->destroy($testSubcategory);
    echo "✅ Destroy method executed successfully" . PHP_EOL;
    echo "Response type: " . get_class($response) . PHP_EOL;

    // Verify deletion
    $deletedSubcategory = Subcategory::find($testSubcategory->id);
    if (!$deletedSubcategory) {
        echo "✅ Subcategory successfully deleted from database" . PHP_EOL;
    } else {
        echo "⚠️ Subcategory still exists in database" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ Destroy method error: " . $e->getMessage() . PHP_EOL;
}

echo PHP_EOL . "=== FINAL SUBCATEGORY COUNT ===" . PHP_EOL;
$finalCount = Subcategory::count();
echo "Total subcategories: " . $finalCount . PHP_EOL;

$subcategories = Subcategory::with('category')->get();
foreach ($subcategories as $subcategory) {
    echo "- {$subcategory->name} (Code: {$subcategory->code}) - Category: " .
        ($subcategory->category ? $subcategory->category->name : 'N/A') . PHP_EOL;
}

echo PHP_EOL . "✅ SUBCATEGORY CONTROLLER TESTING COMPLETED" . PHP_EOL;
