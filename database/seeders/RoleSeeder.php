<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    // Refactor the RoleSeeder to improve readability and avoid repetitive code
    public function run(): void
    {
        $this->createRoleWithPermissions('users-access', '%users%');
        $this->createRoleWithPermissions('roles-access', '%roles%');
        $this->createRoleWithPermissions('permission-access', '%permissions%');
        $this->createRoleWithPermissions('categories-access', '%categories%');
        $this->createRoleWithPermissions('products-access', '%products%');
        $this->createRoleWithPermissions('customers-access', '%customers%');
        $this->createRoleWithPermissions('transactions-access', '%transactions%');

        // Create super-admin role and give all permissions
        if (!Role::where('name', 'super-admin')->exists()) {
            $superAdminRole = Role::create(['name' => 'super-admin']);
            // Give all permissions to super-admin
            $allPermissions = Permission::all();
            $superAdminRole->givePermissionTo($allPermissions);
        } else {
            // Update existing super-admin role to have all permissions
            $superAdminRole = Role::where('name', 'super-admin')->first();
            $allPermissions = Permission::all();
            $superAdminRole->syncPermissions($allPermissions);
        }

        // Adding roles for Toko and Gudang with specific permissions
        if (!Role::where('name', 'Toko')->exists()) {
            $tokoRole = Role::create(['name' => 'Toko']);
            // Give Toko role access to transactions, customers, and dashboard
            $tokoPermissions = Permission::whereIn('name', [
                'dashboard-access',
                'transactions-access',
                'transactions-create',
                'customers-access',
                'customers-create',
                'purchases-access'
            ])->get();
            $tokoRole->givePermissionTo($tokoPermissions);
        }

        if (!Role::where('name', 'Gudang')->exists()) {
            $gudangRole = Role::create(['name' => 'Gudang']);
            // Give Gudang role access to inventory management
            $gudangPermissions = Permission::whereIn('name', [
                'dashboard-access',
                'products-access',
                'products-create',
                'products-edit',
                'categories-access',
                'subcategories-access',
                'units-access',
                'suppliers-access',
                'purchases-access',
                'purchases-create',
                'purchases-edit'
            ])->get();
            $gudangRole->givePermissionTo($gudangPermissions);
        }
    }

    private function createRoleWithPermissions($roleName, $permissionNamePattern)
    {
        if (Role::where('name', $roleName)->exists()) {
            return; // Skip if the role already exists
        }

        $permissions = Permission::where('name', 'like', $permissionNamePattern)->get();
        $role = Role::create(['name' => $roleName]);
        $role->givePermissionTo($permissions);
    }
}
