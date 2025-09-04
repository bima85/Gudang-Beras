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
        if (! $user || ! $user->hasPermissionTo('units-create')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|unique:units,name',
            'conversion_to_kg' => 'required|numeric|min:0.01',
            'is_default' => 'nullable|boolean',
        ]);

        Unit::create($validated);

        return back()->with('success', 'Unit created successfully');
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
