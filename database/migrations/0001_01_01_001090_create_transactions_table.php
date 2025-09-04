<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('cashier_id');
            $table->decimal('total', 16, 2)->default(0);
            $table->decimal('grand_total', 16, 2)->default(0);
            $table->decimal('payment', 16, 2)->default(0);
            $table->decimal('change', 16, 2)->default(0);
            $table->string('invoice')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();
            $table->foreign('customer_id')->references('id')->on('customers')->onDelete('set null');
            $table->foreign('cashier_id')->references('id')->on('users');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
