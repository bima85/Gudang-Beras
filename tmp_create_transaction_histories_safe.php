<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

try {
    echo "Checking transaction_histories...\n";
    if (Schema::hasTable('transaction_histories')) {
        echo "Table exists, nothing to do.\n";
        exit(0);
    }

    echo "Creating table transaction_histories...\n";
    Schema::create('transaction_histories', function (Blueprint $table) {
        $table->id();
        $table->string('transaction_number')->unique();
        $table->enum('transaction_type', ['purchase', 'sale', 'return', 'transfer', 'adjustment']);
        $table->dateTime('transaction_date');
        $table->time('transaction_time')->nullable();
        $table->string('related_party')->nullable();
        $table->foreignId('warehouse_id')->constrained('warehouses');
        $table->foreignId('product_id')->constrained('products')->onDelete('cascade');
        $table->decimal('quantity', 16, 3);
        $table->string('unit');
        $table->decimal('price', 14, 3)->nullable();
        $table->decimal('subtotal', 18, 3)->nullable();
        $table->decimal('stock_before', 18, 3);
        $table->decimal('stock_after', 18, 3);
        $table->enum('payment_status', ['unpaid', 'partial', 'paid'])->nullable();
        $table->text('notes')->nullable();
        $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
        $table->timestamps();
    });

    echo "Created.\n";

    $cols = DB::select("DESCRIBE transaction_histories");
    echo "Columns:\n";
    foreach ($cols as $c) {
        $r = (array)$c;
        echo $r['Field'] . ' | ' . $r['Type'] . PHP_EOL;
    }
} catch (Exception $e) {
    echo 'Exception: ' . $e->getMessage() . PHP_EOL;
    exit(1);
}
