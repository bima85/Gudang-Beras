<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TestUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure roles exist
        $super = Role::firstOrCreate(['name' => 'super-admin']);
        $toko = Role::firstOrCreate(['name' => 'toko']);
        $gudang = Role::firstOrCreate(['name' => 'gudang']);

        // Create permissions
        $permissions = [
            // Deliveries / Surat Jalan
            'deliveries.view',
            'deliveries.create',
            'deliveries.pick',

            // Stocks
            'stocks.view.gudang',
            'stocks.view.toko',

            // Transactions
            'transactions.sell',
            'transactions.purchase',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Assign permissions to roles
        // Gudang: see incoming goods, check stocks (gudang & toko), sell, pick/create deliveries
        $gudang->givePermissionTo([
            'deliveries.view',
            'deliveries.create',
            'deliveries.pick',
            'stocks.view.gudang',
            'stocks.view.toko',
            'transactions.sell',
        ]);

        // Toko (store admin): purchase + sell
        $toko->givePermissionTo([
            'transactions.purchase',
            'transactions.sell',
        ]);

        // Super-admin: give everything
        $super->givePermissionTo($permissions);

        // Superadmin user
        $superUser = User::firstOrCreate(
            ['email' => 'superadmin@example.test'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
            ]
        );
        $superUser->assignRole($super);

        // Admin user (not superadmin)
        $adminUser = User::firstOrCreate(
            ['email' => 'admin_user@example.test'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
            ]
        );
        $adminUser->assignRole($toko);

        // Gudang user
        $gudangUser = User::firstOrCreate(
            ['email' => 'gudang_user@example.test'],
            [
                'name' => 'Gudang User',
                'password' => bcrypt('password'),
            ]
        );
        $gudangUser->assignRole($gudang);
    }
}
