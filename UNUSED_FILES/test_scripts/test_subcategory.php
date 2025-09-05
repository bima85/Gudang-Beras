<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Subcategory;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "=== SUBCATEGORY MODULE TESTING - Phase 1: Basic Model ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

// Check database table structure
echo PHP_EOL . "=== SUBCATEGORY TABLE STRUCTURE ===" . PHP_EOL;
try {
    $subcategories = Subcategory::all();
    echo "✅ Subcategory table accessible" . PHP_EOL;
    echo "Current subcategory count: " . $subcategories->count() . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Error accessing subcategory table: " . $e->getMessage() . PHP_EOL;
    exit;
}

// Test Model properties
echo PHP_EOL . "=== MODEL STRUCTURE TEST ===" . PHP_EOL;
$subcategoryModel = new Subcategory();
$fillable = $subcategoryModel->getFillable();
echo "Fillable fields: " . implode(', ', $fillable) . PHP_EOL;

$expectedFields = ['code', 'name', 'description', 'category_id'];
$missingFields = array_diff($expectedFields, $fillable);
if (empty($missingFields)) {
    echo "✅ All expected fillable fields present" . PHP_EOL;
} else {
    echo "❌ Missing fillable fields: " . implode(', ', $missingFields) . PHP_EOL;
}

// Test relationships
echo PHP_EOL . "=== RELATIONSHIP TESTING ===" . PHP_EOL;

// Check available categories first
$categories = Category::all();
echo "Available categories: " . $categories->count() . PHP_EOL;
if ($categories->count() == 0) {
    echo "❌ No categories found - subcategories need categories as parent" . PHP_EOL;
    exit;
}

foreach ($categories as $category) {
    echo "- {$category->name} (ID: {$category->id}, Code: {$category->code})" . PHP_EOL;
}

// Test category relationship
try {
    $testSubcategory = new Subcategory();
    $categoryRelation = $testSubcategory->category();
    echo "✅ Category relationship (belongsTo) available" . PHP_EOL;
    echo "Relationship type: " . get_class($categoryRelation) . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Category relationship error: " . $e->getMessage() . PHP_EOL;
}

// Test products relationship  
try {
    $testSubcategory = new Subcategory();
    $productsRelation = $testSubcategory->products();
    echo "✅ Products relationship (hasMany) available" . PHP_EOL;
    echo "Relationship type: " . get_class($productsRelation) . PHP_EOL;
} catch (\Exception $e) {
    echo "❌ Products relationship error: " . $e->getMessage() . PHP_EOL;
}

// Check existing subcategories with relationships
echo PHP_EOL . "=== EXISTING SUBCATEGORIES ===" . PHP_EOL;
$existingSubcategories = Subcategory::with('category')->get();

if ($existingSubcategories->count() > 0) {
    foreach ($existingSubcategories as $subcategory) {
        echo "- {$subcategory->name} (Code: {$subcategory->code})" . PHP_EOL;
        echo "  Category: " . ($subcategory->category ? $subcategory->category->name : 'N/A') . PHP_EOL;
        echo "  Description: {$subcategory->description}" . PHP_EOL;
        echo "  ---" . PHP_EOL;
    }
} else {
    echo "No existing subcategories found" . PHP_EOL;
}

// Permission check
echo PHP_EOL . "=== PERMISSION CHECK ===" . PHP_EOL;
$permissions = $adminUser->getAllPermissions();
$subcategoryPermissions = $permissions->filter(function ($permission) {
    return str_contains($permission->name, 'subcategori');
});

if ($subcategoryPermissions->count() > 0) {
    echo "Subcategory-related permissions:" . PHP_EOL;
    foreach ($subcategoryPermissions as $permission) {
        echo "- " . $permission->name . PHP_EOL;
    }
} else {
    echo "⚠️ No specific subcategory permissions found - checking super-admin status" . PHP_EOL;
    $isSuperAdmin = $adminUser->hasRole('super-admin');
    echo "Super-admin role: " . ($isSuperAdmin ? "✅ Yes" : "❌ No") . PHP_EOL;
}

echo PHP_EOL . "✅ SUBCATEGORY MODEL TESTING COMPLETED" . PHP_EOL;
