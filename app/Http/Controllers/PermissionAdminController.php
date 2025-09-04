<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class PermissionAdminController extends Controller
{
    // Reset spatie permission cache
    public function resetCache(Request $request)
    {
        try {
            Artisan::call('permission:cache-reset');
            Artisan::call('cache:clear');
            return response()->json(['success' => true, 'message' => 'Permission cache reset']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // Sync given role with provided permissions (expects role and permissions array)
    public function syncRolePermissions(Request $request)
    {
        $data = $request->validate([
            'role' => 'required|string',
            'permissions' => 'required|array',
        ]);
        try {
            $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => $data['role']]);
            $perms = [];
            foreach ($data['permissions'] as $p) {
                $perms[] = \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $p])->name;
            }
            $role->syncPermissions($perms);
            Artisan::call('permission:cache-reset');
            return response()->json(['success' => true, 'role' => $role->name, 'permissions' => $perms]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
