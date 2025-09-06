<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DebugSessionMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        Log::info('DebugSessionMiddleware: Before request', [
            'url' => $request->url(),
            'method' => $request->method(),
            'session_id' => $request->session()->getId(),
            'session_data' => $request->session()->all(),
            'cookies' => array_keys($request->cookies->all()),
            'auth_check' => Auth::check(),
            'auth_user' => Auth::check() ? Auth::user()->email : null,
        ]);

        $response = $next($request);

        Log::info('DebugSessionMiddleware: After request', [
            'url' => $request->url(),
            'status' => $response->getStatusCode(),
            'session_id' => $request->session()->getId(),
            'session_data' => $request->session()->all(),
            'auth_check' => Auth::check(),
            'auth_user' => Auth::check() ? Auth::user()->email : null,
        ]);

        return $response;
    }
}
