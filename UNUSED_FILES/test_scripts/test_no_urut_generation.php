<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\TransactionController;
use App\Models\Transaction;

echo "Testing No Urut Auto Generation\n";
echo "==============================\n\n";

try {
    // Test the generateNoUrut method
    $controller = new App\Http\Controllers\Apps\TransactionController();
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('generateNoUrut');
    $method->setAccessible(true);

    // Check current highest no_urut
    $currentMax = Transaction::max('no_urut') ?? 0;
    echo "Current highest no_urut in database: " . $currentMax . "\n";

    // Test generateNoUrut method
    $nextNoUrut = $method->invoke($controller);
    echo "Generated next no_urut: " . $nextNoUrut . "\n";
    echo "Expected: " . ($currentMax + 1) . "\n";
    echo "Match: " . ($nextNoUrut == ($currentMax + 1) ? "✅ YES" : "❌ NO") . "\n\n";

    // Test multiple sequential calls
    echo "Testing sequential no_urut generation:\n";
    for ($i = 1; $i <= 5; $i++) {
        $testNoUrut = $method->invoke($controller);
        $expected = $currentMax + $i;
        echo "Call {$i}: Generated={$testNoUrut}, Expected={$expected} " .
            ($testNoUrut == $expected ? "✅" : "❌") . "\n";
    }

    echo "\n🎉 No Urut auto-generation test completed!\n";
} catch (Exception $e) {
    echo "❌ Error testing no_urut generation: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
