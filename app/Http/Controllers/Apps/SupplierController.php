<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
    public function index()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('suppliers-access')) {
            abort(403, 'Unauthorized');
        }

        $suppliers = Supplier::all();
        return Inertia::render('Dashboard/Suppliers/Index', [
            'suppliers' => $suppliers
        ]);
    }

    public function create()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('suppliers-create')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Dashboard/Suppliers/Create');
    }

    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('suppliers-create')) {
            if ($request->wantsJson() || $request->ajax()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized');
        }

        try {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255', Rule::unique('suppliers', 'name')],
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
            ], [
                'name.unique' => 'Nama supplier sudah ada.'
            ]);

            $supplier = Supplier::create($validated);

            // If this is a non-Inertia AJAX request (from modal/fetch), return JSON response
            if ((($request->wantsJson() || $request->ajax()) && ! $request->header('X-Inertia'))) {
                return response()->json($supplier, 201);
            }

            return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            // If this is an Inertia request, let the exception bubble so Inertia middleware
            // can return a proper Inertia response. For plain AJAX/fetch requests (no X-Inertia header),
            // return JSON containing validation errors.
            if ($request->header('X-Inertia')) {
                throw $e;
            }

            if ($request->wantsJson() || $request->ajax()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            }

            throw $e;
        } catch (\Exception $e) {
            if ((($request->wantsJson() || $request->ajax()) && ! $request->header('X-Inertia'))) {
                return response()->json([
                    'message' => 'Server error: ' . $e->getMessage()
                ], 500);
            }
            throw $e;
        }
    }

    public function edit(Supplier $supplier)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('suppliers-edit')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Dashboard/Suppliers/Edit', [
            'supplier' => $supplier
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('suppliers-edit')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('suppliers', 'name')->ignore($supplier->id)],
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ], [
            'name.unique' => 'Nama supplier sudah ada.'
        ]);

        $supplier->update($validated);

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil diperbarui.');
    }

    public function destroy(Supplier $supplier)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('suppliers-delete')) {
            abort(403, 'Unauthorized');
        }

        $supplier->delete();

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil dihapus.');
    }
}
