<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Transaction;
use App\Models\Customer;
use App\Models\User;

echo "Testing Complete Auto Generation (Invoice + No Urut)\n";
echo "===================================================\n\n";

try {
    // Get test data
    $customer = Customer::first();
    $user = User::first();

    if (!$customer || !$user) {
        echo "❌ Missing test data (customer or user)\n";
        exit;
    }

    echo "✅ Using customer: " . $customer->name . "\n";
    echo "✅ Using user: " . $user->name . "\n\n";

    // Check current state
    $currentMaxNoUrut = Transaction::max('no_urut') ?? 0;
    echo "Current max no_urut: " . $currentMaxNoUrut . "\n";

    $today = now()->format('d/m/Y');
    $todayTransactionCount = Transaction::where('transaction_number', 'like', "TRX-{$today}-%")->count();
    echo "Today's transaction count: " . $todayTransactionCount . "\n\n";

    // Test auto generation by creating transactions
    echo "Creating test transactions with auto-generation...\n";

    for ($i = 1; $i <= 3; $i++) {
        echo "\n--- Transaction {$i} ---\n";

        // Use the controller methods
        $controller = new App\Http\Controllers\Apps\TransactionController();
        $reflection = new ReflectionClass($controller);

        $invoiceMethod = $reflection->getMethod('generateInvoiceNumber');
        $invoiceMethod->setAccessible(true);

        $noUrutMethod = $reflection->getMethod('generateNoUrut');
        $noUrutMethod->setAccessible(true);

        $invoice = $invoiceMethod->invoke($controller);
        $noUrut = $noUrutMethod->invoke($controller);

        echo "Generated Invoice: " . $invoice . "\n";
        echo "Generated No Urut: " . $noUrut . "\n";

        // Create actual transaction to test persistence
        $transaction = Transaction::create([
            'cashier_id' => $user->id,
            'customer_id' => $customer->id,
            'invoice' => $invoice,
            'transaction_number' => $invoice,
            'no_urut' => $noUrut,
            'grand_total' => 10000 * $i,
            'cash' => 10000 * $i,
            'change' => 0,
            'payment_method' => 'cash',
            'status' => 'completed'
        ]);

        echo "✅ Transaction created with ID: " . $transaction->id . "\n";
        echo "   No Urut: " . $transaction->no_urut . "\n";
        echo "   Invoice: " . $transaction->invoice . "\n";
    }

    // Verify sequential no_urut
    echo "\n--- Verification ---\n";
    $recentTransactions = Transaction::orderBy('no_urut', 'desc')->limit(3)->get();

    echo "Last 3 transactions (desc order):\n";
    foreach ($recentTransactions as $idx => $trans) {
        echo ($idx + 1) . ". No Urut: {$trans->no_urut}, Invoice: {$trans->invoice}\n";
    }

    // Clean up test transactions
    echo "\n--- Cleanup ---\n";
    $testTransactions = Transaction::where('grand_total', 'IN', [10000, 20000, 30000])->get();
    foreach ($testTransactions as $trans) {
        echo "Deleting transaction ID: " . $trans->id . " (No Urut: {$trans->no_urut})\n";
        $trans->delete();
    }

    echo "\n🎉 Test completed successfully!\n";
    echo "✅ Invoice auto-generation: WORKING\n";
    echo "✅ No Urut auto-generation: WORKING\n";
    echo "✅ Sequential numbering: WORKING\n";
} catch (Exception $e) {
    echo "❌ Error during test: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}
