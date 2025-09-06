<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            ComprehensivePermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            UnitSeeder::class,
            // Ensure delivery permission exists and is assigned to gudang/super-admin
            \Database\Seeders\EnsureDeliveryPermissionSeeder::class,
            // Ensure core roles and permissions exist and are assigned
            \Database\Seeders\EnsureRolesPermissionsSeeder::class,
        ]);
    }
}
