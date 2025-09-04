<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index()
    {
        $warehouses = Warehouse::orderBy('created_at', 'desc')->paginate(10);
        return inertia('Dashboard/Warehouse/Index', [
            'warehouses' => $warehouses
        ]);
    }

    public function create()
    {
        return inertia('Dashboard/Warehouse/Create');
    }

    public function store(Request $request)
    {
        // dd($request->all());
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:warehouses,code',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $warehouse = Warehouse::create($data);

        // If the client asked for JSON but is NOT an Inertia request, return JSON
        // (used by manual fetch() calls from modals or API clients).
        // Inertia requests include the X-Inertia header; when present we must
        // return a redirect or an Inertia response so the Inertia client can
        // handle the navigation correctly.
        $isInertia = $request->header('X-Inertia');
        if (($request->wantsJson() || $request->ajax()) && !$isInertia) {
            return response()->json($warehouse);
        }

        // For normal web or Inertia requests, redirect to index so Inertia
        // receives a redirect response it can follow.
        return redirect()
            ->route('dashboard.warehouses.index')
            ->with('success', 'Warehouse berhasil ditambahkan.');
    }

    public function edit(Warehouse $warehouse)
    {
        return inertia('Dashboard/Warehouse/Edit', [
            'warehouse' => $warehouse
        ]);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);
        $warehouse->update($data);
        return redirect()->route('dashboard.warehouses.index')->with('success', 'Warehouse berhasil diupdate.');
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();
        return redirect()->back()->with('success', 'Warehouse berhasil dihapus.');
    }

    public function recap(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');
        $query = Warehouse::query();
        if ($start) $query->whereDate('created_at', '>=', $start);
        if ($end) $query->whereDate('created_at', '<=', $end);
        $warehouses = $query->orderBy('created_at', 'desc')->paginate(20);
        $totalWarehouse = $query->count();
        return inertia('Dashboard/Warehouse/Recap', [
            'warehouses' => $warehouses,
            'totalWarehouse' => $totalWarehouse,
            'start_date' => $start,
            'end_date' => $end,
        ]);
    }
}
