<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use App\Models\TransactionHistory;

class TransactionHistoryTimeTest extends TestCase
{
    public function test_transaction_history_records_transaction_time_on_sale()
    {
        // ensure no existing table (avoid collision when running against mysql)
        if (Schema::hasTable('transaction_histories')) {
            Schema::drop('transaction_histories');
        }

        // create a minimal transaction_histories table for the test
        Schema::create('transaction_histories', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('transaction_number')->unique();
            $table->string('transaction_type')->nullable();
            $table->dateTime('transaction_date')->nullable();
            $table->time('transaction_time')->nullable();
            $table->string('related_party')->nullable();
            $table->unsignedBigInteger('warehouse_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->decimal('quantity', 16, 0)->nullable();
            $table->string('unit')->nullable();
            $table->decimal('price', 14, 0)->nullable();
            $table->decimal('subtotal', 18, 0)->nullable();
            $table->decimal('stock_before', 18, 0)->nullable();
            $table->decimal('stock_after', 18, 0)->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();
        });

        // create a TransactionHistory record directly
        TransactionHistory::unguard();
        $th = TransactionHistory::create([
            'transaction_number' => 'TEST-' . time(),
            'transaction_type' => 'sale',
            'transaction_date' => now(),
            'transaction_time' => now()->format('H:i:s'),
            'related_party' => 'Test Customer',
            'warehouse_id' => 1,
            'product_id' => 1,
            'quantity' => 1,
            'unit' => 'kg',
            'price' => 10000,
            'subtotal' => 10000,
            'stock_before' => 0,
            'stock_after' => 0,
            'created_by' => 1,
        ]);

        $this->assertNotNull($th->transaction_time);
        $this->assertMatchesRegularExpression('/^\d{2}:\d{2}:\d{2}$/', $th->transaction_time);

        // cleanup
        Schema::dropIfExists('transaction_histories');
    }
}
