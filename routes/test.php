<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Apps\TransactionController;

// Test route
Route::get('/test-print/{id}', function ($id) {
    return response()->json([
        'message' => 'Test route works',
        'id' => $id,
        'url' => request()->url(),
        'route_name' => Route::currentRouteName()
    ]);
})->name('test.print');
