<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class AdminRolesController extends Controller
{
    public function __construct()
    {
        // Additional guard: ensure only super-admin can call these controller methods.
        $this->middleware(function ($request, $next) {
            $user = Auth::user();
            if (! $user || ! $user->hasRole('super-admin')) {
                abort(403);
            }
            return $next($request);
        });
    }
    public function index()
    {
        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('Admin/RolesPermissions', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function assignPermission(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
            'permission' => 'required|string',
        ]);

        $role = Role::where('name', $request->role)->firstOrFail();
        $permission = Permission::firstOrCreate(['name' => $request->permission, 'guard_name' => 'web']);

        $role->givePermissionTo($permission);

        return redirect()->back()->with('success', 'Permission assigned');
    }

    public function revokePermission(Request $request)
    {
        $request->validate([
            'role' => 'required|string',
            'permission' => 'required|string',
        ]);

        $role = Role::where('name', $request->role)->firstOrFail();
        $permission = Permission::where('name', $request->permission)->first();
        if ($permission) $role->revokePermissionTo($permission);

        return redirect()->back()->with('success', 'Permission revoked');
    }
}
