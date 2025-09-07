<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class ComprehensivePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all permissions for the application
        $permissions = [
            // dashboard permissions
            'dashboard-access',

            // users permissions
            'users-access',
            'users-create',
            'users-update',
            'users-delete',

            // roles permissions
            'roles-access',
            'roles-create',
            'roles-update',
            'roles-delete',

            // permissions permissions
            'permissions-access',
            'permissions-create',
            'permissions-update',
            'permissions-delete',

            // categories permissions
            'categories-access',
            'categories-create',
            'categories-edit',
            'categories-delete',

            // subcategories permissions
            'subcategories-access',
            'subcategories-create',
            'subcategories-edit',
            'subcategories-delete',

            // products permissions
            'products-access',
            'products-create',
            'products-edit',
            'products-delete',

            // customers permissions
            'customers-access',
            'customers-create',
            'customers-edit',
            'customers-delete',

            // suppliers permissions
            'suppliers-access',
            'suppliers-create',
            'suppliers-edit',
            'suppliers-delete',

            // units permissions
            'units-access',
            'units-create',
            'units-edit',
            'units-delete',

            // transactions permissions
            'transactions-access',
            'transactions-create',
            'transactions-edit',
            'transactions-delete',

            // purchases permissions
            'purchases-access',
            'purchases-create',
            'purchases-edit',
            'purchases-delete',

            // transaction histories permissions
            'transaction-histories-access',
            'transaction-histories-create',
            'transaction-histories-edit',
            'transaction-histories-delete',

            // tokos permissions
            'tokos-access',
            'tokos-create',
            'tokos-edit',
            'tokos-delete',

            // reports permissions
            'reports-access',
            // specific reports
            'reports.transactions',
            'reports-create',
            'reports-edit',
            'reports-delete',
            'reports-export',

            // stock view permissions
            'stock-view-access',
            'stocks.view.gudang',
            'stocks.view.toko',

            // warehouse permissions
            'warehouse.manage',

            // force view permissions
            'force-gudang-view',

            // stock movement permissions
            'stock-movements.view',
            'stock-movements.create',
            'stock-movements.edit',
            'stock-movements.delete',
            'stock-movements.manage',
        ];

        // Create all permissions using firstOrCreate
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $this->command->info('✅ All permissions created successfully!');
    }
}
