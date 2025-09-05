<?php

require_once 'vendor/autoload.php';

// Load Laravel environment
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Http\Controllers\Apps\TransactionController;
use App\Models\Transaction;

echo "Testing Invoice Generation Logic\n";
echo "================================\n\n";

// Test the logic that will be in generateInvoiceNumber method
$today = now()->format('d/m/Y');
$prefix = "TRX-{$today}-";

echo "Today's date: " . $today . "\n";
echo "Prefix: " . $prefix . "\n\n";

// Check existing transactions for today
$existingTransactions = Transaction::where('transaction_number', 'like', $prefix . '%')
    ->orderBy('transaction_number', 'desc')
    ->get();

echo "Existing transactions for today:\n";
if ($existingTransactions->count() > 0) {
    foreach ($existingTransactions as $trans) {
        echo "- " . $trans->transaction_number . "\n";
    }
} else {
    echo "- No transactions found for today\n";
}

// Test next number generation
$lastTransaction = Transaction::where('transaction_number', 'like', $prefix . '%')
    ->orderBy('transaction_number', 'desc')
    ->first();

if ($lastTransaction) {
    $lastNumber = (int) substr($lastTransaction->transaction_number, -3);
    $nextNumber = $lastNumber + 1;
    echo "\nLast number: " . $lastNumber;
    echo "\nNext number: " . $nextNumber;
} else {
    $nextNumber = 1;
    echo "\nFirst transaction of the day, starting with: " . $nextNumber;
}

$formattedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
$newInvoiceNumber = $prefix . $formattedNumber;

echo "\nGenerated invoice number: " . $newInvoiceNumber . "\n";

// Test multiple generations to ensure uniqueness
echo "\nTesting multiple sequential generations:\n";
for ($i = 1; $i <= 5; $i++) {
    $testLastTransaction = Transaction::where('transaction_number', 'like', $prefix . '%')
        ->orderBy('transaction_number', 'desc')
        ->first();

    if ($testLastTransaction) {
        $testLastNumber = (int) substr($testLastTransaction->transaction_number, -3);
        $testNextNumber = $testLastNumber + $i;
    } else {
        $testNextNumber = $i;
    }

    $testFormattedNumber = str_pad($testNextNumber, 3, '0', STR_PAD_LEFT);
    $testInvoiceNumber = $prefix . $testFormattedNumber;

    echo "Test {$i}: " . $testInvoiceNumber . "\n";
}

echo "\nTest completed successfully!\n";
