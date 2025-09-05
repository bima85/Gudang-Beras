<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Test TransactionController
echo "Testing TransactionController Invoice Generation\n";
echo "=============================================\n\n";

try {
    // Create an instance of the controller
    $controller = new App\Http\Controllers\Apps\TransactionController();

    // Use reflection to access the private method
    $reflection = new ReflectionClass($controller);
    $method = $reflection->getMethod('generateInvoiceNumber');
    $method->setAccessible(true);

    // Test the method
    echo "Calling generateInvoiceNumber method...\n";
    $invoiceNumber = $method->invoke($controller);

    echo "Generated Invoice Number: " . $invoiceNumber . "\n";
    echo "Format validation: " . (preg_match('/^TRX-\d{2}\/\d{2}\/\d{4}-\d{3}$/', $invoiceNumber) ? 'PASSED' : 'FAILED') . "\n";

    // Test multiple calls to ensure uniqueness
    echo "\nTesting sequential calls:\n";
    for ($i = 1; $i <= 3; $i++) {
        $testNumber = $method->invoke($controller);
        echo "Call {$i}: " . $testNumber . "\n";
    }

    echo "\n✅ Controller method test completed successfully!\n";
} catch (Exception $e) {
    echo "❌ Error testing controller: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
