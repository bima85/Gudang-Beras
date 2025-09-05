<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\CategoryController;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

echo "=== CATEGORY CONTROLLER TESTING ===" . PHP_EOL;

try {
    // Login as admin user
    $adminUser = User::where('email', 'admin@admin.com')->first();
    if (!$adminUser) {
        echo "❌ Admin user not found" . PHP_EOL;
        exit;
    }

    Auth::login($adminUser);
    echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

    // Test CategoryController
    $controller = new CategoryController();

    // Test index method
    echo PHP_EOL . "=== Testing CategoryController@index ===" . PHP_EOL;

    // Create mock request
    $request = Request::create('/dashboard/categories', 'GET');
    app()->instance('request', $request);

    try {
        $response = $controller->index();
        echo "✅ Categories index accessible" . PHP_EOL;
        echo "Response type: " . get_class($response) . PHP_EOL;

        // Access response data if it's Inertia
        if (method_exists($response, 'toResponse')) {
            $responseData = $response->toResponse($request);
            echo "✅ Inertia response created successfully" . PHP_EOL;
        }
    } catch (\Exception $e) {
        echo "❌ Error accessing categories index: " . $e->getMessage() . PHP_EOL;
    }

    // Test create method
    echo PHP_EOL . "=== Testing CategoryController@create ===" . PHP_EOL;
    try {
        $response = $controller->create();
        echo "✅ Categories create accessible" . PHP_EOL;
    } catch (\Exception $e) {
        echo "❌ Error accessing categories create: " . $e->getMessage() . PHP_EOL;
    }

    echo PHP_EOL . "=== Testing Categories Data ===" . PHP_EOL;
    $categories = \App\Models\Category::paginate(10);
    echo "Total categories: " . $categories->total() . PHP_EOL;
    echo "Per page: " . $categories->perPage() . PHP_EOL;
    echo "Current page: " . $categories->currentPage() . PHP_EOL;

    foreach ($categories as $category) {
        echo "- " . $category->name . " (ID: " . $category->id . ")" . PHP_EOL;
    }
} catch (\Exception $e) {
    echo "❌ General error: " . $e->getMessage() . PHP_EOL;
    echo "Stack trace: " . $e->getTraceAsString() . PHP_EOL;
}
