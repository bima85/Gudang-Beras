<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CSRFController extends Controller
{
    /**
     * Get a fresh CSRF token
     */
    public function token(Request $request): JsonResponse
    {
        return response()->json([
            'csrf_token' => csrf_token()
        ]);
    }
}
