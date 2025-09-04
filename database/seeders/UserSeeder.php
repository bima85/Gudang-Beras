<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure roles exist
        $superAdminRole = Role::firstOrCreate(['name' => 'super-admin']);
        // 'toko' role represents store admin (has only sales & purchases)
        $tokoRole = Role::firstOrCreate(['name' => 'toko']);
        $gudangRole = Role::firstOrCreate(['name' => 'gudang']);

        // Ensure permissions exist (add the common ones used in app)
        $permNames = [
            // controller expects granular permissions like 'transactions.sell' and 'transactions.purchase'
            'transactions.sell',
            'transactions.purchase',
            'transactions-access',
            'purchases-access',
            'deliveries-access',
            // allow forcing gudang-style dashboard view even when session role = toko
            'force-gudang-view',
            'permissions-access',
            'roles-access',
            'users-access',
            'users-create',
        ];

        $permissions = collect($permNames)->map(function ($name) {
            return Permission::firstOrCreate(['name' => $name]);
        });

        // Super Admin user: full access
        $user = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Administrator',
                'password' => bcrypt('password'),
            ]
        );
        // give all created permissions to super admin and assign super-admin role
        $user->syncPermissions(Permission::all());
        $user->assignRole($superAdminRole);
        // Optionally seed additional test/demo users. Set SEED_TEST_USERS=true in your .env
        // to create admin_user/example and other demo users. By default this is off
        // to keep seeded users minimal in non-dev environments.
        if (env('SEED_TEST_USERS', false)) {
            // Admin Toko user: default "toko" role (NOT super-admin)
            $adminToko = User::firstOrCreate(
                ['email' => 'admin_user@example.test'],
                [
                    'name' => 'Admin Toko',
                    'password' => bcrypt('password'),
                ]
            );
            $adminToko->syncPermissions([
                Permission::where('name', 'transactions.sell')->first(),
                Permission::where('name', 'transactions.purchase')->first(),
                Permission::where('name', 'purchases-access')->first(),
            ]);
            $adminToko->assignRole($tokoRole);
            $adminToko->givePermissionTo('force-gudang-view');
            $adminToko->force_gudang_view = true;
            $adminToko->save();

            // Admin Gudang user: default "gudang" role (NOT super-admin)
            $adminGudang = User::firstOrCreate(
                ['email' => 'admin_gudang@example.test'],
                [
                    'name' => 'Admin Gudang',
                    'password' => bcrypt('password'),
                ]
            );
            $adminGudang->syncPermissions([
                Permission::where('name', 'transactions.sell')->first(),
                Permission::where('name', 'deliveries-access')->first(),
            ]);
            $adminGudang->assignRole($gudangRole);

            // Cashier (kasir) user: transactions only (legacy)
            $cashier = User::firstOrCreate(
                ['email' => 'kasir@gmail.com'],
                [
                    'name' => 'kasir',
                    'password' => bcrypt('password'),
                ]
            );

            $transactionsSellPermission = Permission::where('name', 'transactions.sell')->first();
            $cashier->syncPermissions($transactionsSellPermission);
        }
    }
}
