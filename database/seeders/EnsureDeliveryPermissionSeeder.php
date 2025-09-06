<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;

class EnsureDeliveryPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Ensures the `deliveries-access` permission exists and is assigned
     * to the `gudang` role (and `super-admin` if present).
     */
    public function run()
    {
        DB::transaction(function () {
            $perm = Permission::firstOrCreate([
                'name' => 'deliveries-access',
                'guard_name' => 'web',
            ]);

            $assignRoles = ['gudang', 'super-admin'];

            foreach ($assignRoles as $roleName) {
                $role = Role::where('name', $roleName)->first();
                if ($role && !$role->hasPermissionTo($perm)) {
                    $role->givePermissionTo($perm);
                }
            }
        });
    }
}
