<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;

class EnsureRolesPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Core roles
            $roles = ['super-admin', 'gudang', 'toko'];
            foreach ($roles as $r) {
                Role::firstOrCreate(['name' => $r]);
            }

            // Core permissions useful for environments
            $permissions = [
                'deliveries-access',
                'transactions.manage',
                'purchases.manage',
                'force-gudang-view',
            ];

            foreach ($permissions as $perm) {
                Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
            }

            // Assign permissions: super-admin -> all, gudang -> deliveries-access, toko -> transactions/purchases
            $super = Role::where('name', 'super-admin')->first();
            if ($super) {
                $super->syncPermissions(Permission::all());
            }

            $gudang = Role::where('name', 'gudang')->first();
            if ($gudang) {
                $gudang->givePermissionTo('deliveries-access');
                // Allow gudang to view transaction reports and export
                $gudang->givePermissionTo(['reports.transactions', 'reports-export', 'transactions-delete']);
            }

            $toko = Role::where('name', 'toko')->first();
            if ($toko) {
                $toko->givePermissionTo(['transactions.manage', 'purchases.manage', 'transactions.sell', 'transactions.purchase']);
                // Allow toko to view transaction reports and export
                $toko->givePermissionTo(['reports.transactions', 'reports-export', 'transactions-delete']);
            }
        });
    }
}
