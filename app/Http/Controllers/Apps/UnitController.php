<?php

namespace App\Http\Controllers\Apps;

use App\Models\Unit;
use Inertia\Inertia;
use App\Models\UnitDetail;
use Illuminate\Http\Request;
use App\Models\UnitConversion;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class UnitController extends Controller
{
    public function index()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('units-access')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Dashboard/Units/Index', [
            'units' => Unit::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();

        // Debug logging
        Log::info('Unit store called', [
            'user_id' => Auth::id(),
            'user' => $user?->toArray(),
            'has_permission' => $user ? $user->hasPermissionTo('units-create') : false,
        ]);

        if (! $user || ! $user->hasPermissionTo('units-create')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized');
        }

        // For AJAX requests, make validation more flexible
        if ($request->expectsJson()) {
            $validated = $request->validate([
                'name' => 'required|string|max:255|unique:units,name',
                'symbol' => 'nullable|string|max:10',
                'conversion_to_kg' => 'nullable|numeric|min:0.001',
                'is_default' => 'nullable|boolean',
            ]);
        } else {
            $validated = $request->validate([
                'name' => 'required|unique:units,name',
                'conversion_to_kg' => 'required|numeric|min:0.01',
                'is_default' => 'nullable|boolean',
            ]);
        }

        try {
            // Set defaults for AJAX requests
            if ($request->expectsJson()) {
                $validated['symbol'] = $validated['symbol'] ?? strtolower(substr($validated['name'], 0, 3));
                $validated['conversion_to_kg'] = $validated['conversion_to_kg'] ?? 1.0;
                $validated['is_default'] = $validated['is_default'] ?? false;
            }

            $unit = Unit::create($validated);

            // Return JSON response for AJAX requests
            if ($request->expectsJson()) {
                return response()->json([
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'symbol' => $unit->symbol,
                    'conversion_to_kg' => $unit->conversion_to_kg,
                    'is_default' => $unit->is_default,
                    'message' => 'Unit created successfully.'
                ], 201);
            }

            return back()->with('success', 'Unit created successfully');
        } catch (\Exception $e) {
            Log::error('Failed to create unit:', [
                'message' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
            ]);

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Failed to create unit. Please try again.'], 500);
            }

            return back()->withErrors(['error' => 'Failed to create unit. Please try again.']);
        }
    }

    public function update(Request $request, Unit $unit)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('units-edit')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|unique:units,name,' . $unit->id,
            'conversion_to_kg' => 'required|numeric|min:0.01',
            'is_default' => 'nullable|boolean',
        ]);

        $unit->update($validated);

        return back()->with('success', 'Unit updated successfully');
    }

    public function destroy(Unit $unit)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('units-delete')) {
            abort(403, 'Unauthorized');
        }

        $unit->delete();

        return back()->with('success', 'Unit deleted successfully');
    }
}
