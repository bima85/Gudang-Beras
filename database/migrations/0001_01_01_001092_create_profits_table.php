<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('profits', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('transaction_id');
            $table->bigInteger('total');
            $table->timestamps();
            $table->foreign('transaction_id')->references('id')->on('transactions');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('profits');
    }
};
