<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "=== UNIT CREATION FOR PRODUCT TESTING ===" . PHP_EOL;

// Login as admin
$adminUser = User::where('email', 'admin@admin.com')->first();
Auth::login($adminUser);
echo "✅ Logged in as: " . $adminUser->name . PHP_EOL;

// Check existing units
echo PHP_EOL . "=== CHECKING EXISTING UNITS ===" . PHP_EOL;
$existingUnits = Unit::all();
echo "Current unit count: " . $existingUnits->count() . PHP_EOL;

if ($existingUnits->count() > 0) {
    foreach ($existingUnits as $unit) {
        echo "- {$unit->name} (conversion: {$unit->conversion_to_kg} kg)" . PHP_EOL;
    }
} else {
    echo "No existing units found - creating basic units..." . PHP_EOL;

    $defaultUnits = [
        [
            'name' => 'Kilogram',
            'conversion_to_kg' => 1.0,
            'is_default' => true
        ],
        [
            'name' => 'Gram',
            'conversion_to_kg' => 0.001,
            'is_default' => false
        ],
        [
            'name' => 'Sak (25kg)',
            'conversion_to_kg' => 25.0,
            'is_default' => false
        ],
        [
            'name' => 'Liter',
            'conversion_to_kg' => 1.0,
            'is_default' => false
        ],
        [
            'name' => 'Pieces',
            'conversion_to_kg' => 0.1,
            'is_default' => false
        ]
    ];

    foreach ($defaultUnits as $unitData) {
        try {
            $unit = Unit::create($unitData);
            echo "✅ Created: {$unit->name}" . PHP_EOL;
        } catch (\Exception $e) {
            echo "❌ Failed to create {$unitData['name']}: " . $e->getMessage() . PHP_EOL;
        }
    }
}

// Final count
echo PHP_EOL . "=== FINAL UNIT COUNT ===" . PHP_EOL;
$finalUnits = Unit::all();
echo "Total units: " . $finalUnits->count() . PHP_EOL;

foreach ($finalUnits as $unit) {
    echo "- {$unit->name} (ID: {$unit->id}, Conversion: {$unit->conversion_to_kg} kg, Default: " .
        ($unit->is_default ? 'Yes' : 'No') . ")" . PHP_EOL;
}

echo PHP_EOL . "✅ UNIT CREATION COMPLETED" . PHP_EOL;
