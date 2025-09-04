<?php

namespace Database\Seeders;

use App\Models\Unit;
use Illuminate\Database\Seeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Unit::insert([
        ['name' => 'kg', 'conversion_to_kg' => 1, 'is_default' => true],
        ['name' => 'sak', 'conversion_to_kg' => 25, 'is_default' => false],
        ['name' => 'ton', 'conversion_to_kg' => 1000, 'is_default' => false],
        ['name' => 'inner', 'conversion_to_kg' => 2.5, 'is_default' => false],
    ]);
    }
}
