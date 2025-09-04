<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Inertia::share('_token', csrf_token());
        // share the chosen role/location from session so front-end components
        // (Sidebar, Dashboard) can show the currently selected location
        Inertia::share('location', function () {
            try {
                $role = session('role');
                // if current session role is 'toko', prefer to show the toko name
                if ($role && strtolower($role) === 'toko') {
                    $user = \Illuminate\Support\Facades\Auth::user();
                    if ($user) {
                        // try relation or toko_id field
                        if (method_exists($user, 'toko') && $user->toko) {
                            return $user->toko->name ?? 'toko';
                        }
                        if (isset($user->toko_id) && $user->toko_id) {
                            $t = \App\Models\Toko::find($user->toko_id);
                            return $t ? ($t->name ?? 'toko') : 'toko';
                        }
                        // fallback: return first toko name if available
                        $firstToko = \App\Models\Toko::orderBy('id')->first();
                        if ($firstToko) return $firstToko->name ?? 'toko';
                    }
                }
                return session('role');
            } catch (\Exception $e) {
                return session('role');
            }
        });
        //
    }
}
