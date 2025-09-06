<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Requests\RoleRequest;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Role;
use App\Http\Controllers\Controller;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        // get all role data
        $roles = Role::query()
            ->with('permissions')
            ->when(request()->search, fn($query) => $query->where('name', 'like', '%' . request()->search . '%'))
            ->select('id', 'name')
            ->latest()
            ->paginate(7)
            ->withQueryString();

        // get all permission data
        $permissions = Permission::query()
            ->select('id', 'name')
            ->orderBy('name')
            ->get();

        // render view
        return Inertia::render('Dashboard/Roles/IndexShadcn', [
            'roles' => $roles,
            'permissions' => $permissions
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(RoleRequest $request)
    {
        // create new role data
        $role = Role::create(['name' => $request->name]);

        // give permissions to role
        $role->givePermissionTo($request->selectedPermission);

        // render view
        return back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(RoleRequest $request, Role $role)
    {
        try {
            // update role data
            $role->update(['name' => $request->name]);

            // sync role permissions
            $role->syncPermissions($request->selectedPermission);

            // render view
            return back();
        } catch (\Throwable $e) {
            // Log error for server-side inspection
            Log::error('Role update failed: ' . $e->getMessage(), [
                'role_id' => $role->id ?? null,
                'request' => $request->all(),
                'exception' => $e,
            ]);

            // Also write a more explicit temporary debug file to storage/logs so it's
            // easy to inspect while developing (will overwrite each failure).
            try {
                $debugPath = storage_path('logs/role_update_error.log');
                $debugData = [
                    'timestamp' => now()->toDateTimeString(),
                    'role_id' => $role->id ?? null,
                    'request' => $request->all(),
                    'exception_message' => $e->getMessage(),
                    'exception_trace' => $e->getTraceAsString(),
                ];
                file_put_contents($debugPath, print_r($debugData, true));
            } catch (\Throwable $writeEx) {
                Log::error('Failed to write role_update_error.log: ' . $writeEx->getMessage());
            }

            // If request expects JSON (Inertia), return JSON diagnostics so client can surface it
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Internal server error while updating role',
                    'error' => $e->getMessage(),
                ], 500);
            }

            // Fallback to previous behavior
            return back()->with('error', 'Failed to update role.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role)
    {
        // delete role data
        $role->delete();

        // render view
        return back();
    }
}
