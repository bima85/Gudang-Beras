<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        $role = session('role') ?? ($request->user() ? $request->user()->getRoleNames()->first() : null);

        // Log the current route being accessed
        \Log::info('RoleMiddleware: Current route', ['route' => $request->path()]);

        // Log the role before proceeding
        \Log::info('RoleMiddleware: Role before validation', ['role' => $role]);

        if (!$role) {
            return redirect()->route('login')->withErrors(['role' => 'Role is required.']);
        }

        $path = $request->path();

        // Rules (simple and explicit):
        // - purchases routes => toko or super-admin
        // - transactions routes => gudang, toko, super-admin
        // - stok-toko, stocks, warehouses => gudang, toko, super-admin (view allowed for gudang/toko)
        // - dashboard/gudang & dashboard/toko => any role stored in session (already validated)

        $role = strtolower($role);

        // Helper to check allowed roles
        $allowed = function ($roles) use ($role) {
            $roles = array_map('strtolower', $roles);
            return in_array($role, $roles);
        };

        // purchases
        if (str_starts_with($path, 'dashboard/purchases') || str_contains($path, '/purchases')) {
            if (!$allowed(['toko', 'super-admin'])) {
                abort(403, 'Akses ke halaman pembelian dibatasi untuk toko.');
            }
        }

        // transactions (list, store, search, print, destroy, etc.)
        if (str_contains($path, '/transactions')) {
            if (!$allowed(['gudang', 'toko', 'super-admin'])) {
                abort(403, 'Akses transaksi dibatasi.');
            }
        }

        // stok-toko, stocks, warehouses management
        if (str_contains($path, 'stok-toko') || str_contains($path, '/stocks') || str_contains($path, '/warehouses')) {
            if (!$allowed(['gudang', 'toko', 'super-admin'])) {
                abort(403, 'Akses stok dibatasi.');
            }
        }

        // Delivery route (surat jalan) allow gudang/toko/super-admin
        if (str_contains($path, '/transactions/') && str_ends_with($path, '/delivery')) {
            if (!$allowed(['gudang', 'toko', 'super-admin'])) {
                abort(403, 'Akses pembuatan surat jalan dibatasi.');
            }
        }

        return $next($request);
    }
}
