<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Always register our HandleInertiaRequests middleware.
        // Add the AddLinkHeadersForPreloadedAssets middleware only in production to
        // avoid preloading headers during local development which can cause
        // "preloaded but not used" console warnings when assets are served differently.
        $webAppend = [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ];

        // Use the env helper; enable preloaded link headers only in production by default.
        if ((function_exists('env') && env('APP_ENV') === 'production') || getenv('APP_ENV') === 'production') {
            $webAppend[] = \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class;
        }

        $middleware->web(append: $webAppend);

        // Register Spatie Permission middleware aliases
        $middleware->alias([
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);

        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
