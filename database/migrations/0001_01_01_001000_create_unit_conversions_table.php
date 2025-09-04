<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('unit_conversions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('from_unit_id');
            $table->unsignedBigInteger('to_unit_id');
            $table->decimal('conversion_value', 15, 8);
            $table->timestamps();

            $table->foreign('from_unit_id')->references('id')->on('units')->onDelete('cascade');
            $table->foreign('to_unit_id')->references('id')->on('units')->onDelete('cascade');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('unit_conversions');
    }
};
