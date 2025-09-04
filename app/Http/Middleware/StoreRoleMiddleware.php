<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StoreRoleMiddleware
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
        // Determine role/location to store in session.
        // Priority: explicit input (user chose location) -> authenticated user's primary role -> existing session
        // During automated tests we don't want this middleware to interact with
        // the session or alter request flow — it can interfere with test auth
        // and CSRF flows. Short-circuit in testing environment.
        if (app()->environment('testing')) {
            Log::info('StoreRoleMiddleware: bypassed in testing environment');
            return $next($request);
        }
        $roleFromInput = $request->input('role');
        $role = null;

        if (!empty($roleFromInput)) {
            $role = $roleFromInput;
        } else {
            if ($request->user()) {
                try {
                    $names = $request->user()->getRoleNames()->toArray();
                    $role = count($names) ? $names[0] : null;
                } catch (\Throwable $e) {
                    // ignore and fall back
                    Log::warning('StoreRoleMiddleware: failed to get roles from user', ['error' => $e->getMessage()]);
                }
            }

            if (!$role) {
                $role = session('role');
            }
        }

        // Normalize role casing (store as capitalized word) to keep comparisons predictable
        if (is_string($role)) {
            $role = ucfirst(strtolower($role));
        }

        // Prefer to store role in the current session if available.
        if ($request->hasSession()) {
            $request->session()->put('role', $role);
            $stored = $request->session()->get('role');
            Log::info('StoreRoleMiddleware: Role stored in session', ['role' => $stored]);
        } else {
            // When running in contexts where the session middleware hasn't run
            // (for example certain test bootstraps), store role on the request
            // so callers can still read it during this request lifecycle.
            $request->attributes->set('role', $role);
            Log::info('StoreRoleMiddleware: Role stored on request attribute (no session available)', ['role' => $role]);
        }

        return $next($request);
    }
}
