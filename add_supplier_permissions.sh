#!/bin/bash

# Script untuk menambahkan permission checks ke SupplierController
cd "$(dirname "$0")"

echo "Adding permission checks to SupplierController..."

# Backup original file  
cp app/Http/Controllers/Apps/SupplierController.php app/Http/Controllers/Apps/SupplierController.php.backup

# Create new file with permissions
cat > app/Http/Controllers/Apps/SupplierController.php << 'EOF'
<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

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
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
        ]);

        Supplier::create($validated);

        return redirect()->route('suppliers.index')->with('success', 'Supplier berhasil ditambahkan.');
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
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
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
EOF

echo "Permission checks added to SupplierController successfully!"
