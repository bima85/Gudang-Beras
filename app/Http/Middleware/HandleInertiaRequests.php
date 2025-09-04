<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user() ? $request->user()->load('roles', 'permissions') : null;

        // determine assigned warehouse for the user if any
        $assignedWarehouse = null;
        $assignedWarehouseId = null;
        if ($user) {
            // common candidate fields that may store a user's assigned warehouse
            $candidateFields = ['assigned_warehouse_id', 'warehouse_id', 'gudang_id'];
            foreach ($candidateFields as $f) {
                if (isset($user->{$f}) && $user->{$f}) {
                    $assignedWarehouseId = $user->{$f};
                    break;
                }
            }
            if ($assignedWarehouseId) {
                try {
                    $w = \App\Models\Warehouse::find($assignedWarehouseId);
                    if ($w) {
                        $assignedWarehouse = [
                            'id' => $w->id,
                            'name' => $w->name ?? null,
                        ];
                    }
                } catch (\Exception $e) {
                    // ignore and leave assignedWarehouse null
                }
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $user ? $user->getPermissions() : [],
                'super' => $user ? $user->isSuperAdmin() : false,
                // explicit assigned warehouse info for frontend convenience
                'assigned_warehouse_id' => $assignedWarehouseId,
                'assigned_warehouse' => $assignedWarehouse,
            ],
        ];
    }
}
