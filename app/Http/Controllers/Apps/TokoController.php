<?php

namespace App\Http\Controllers\Apps;

use App\Models\Toko;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class TokoController extends Controller
{
    public function index(Request $request)
    {
        $query = Toko::query();

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('address', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%');
            });
        }

        $tokos = $query->orderBy('name')->paginate(10)->withQueryString();

        return Inertia::render('Dashboard/Toko/Index', [
            'tokos' => $tokos,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/Toko/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
        ]);

        $toko = Toko::create($validated);

        return redirect()->route('tokos.index')->with('success', 'Toko berhasil ditambahkan');
    }

    public function show(Toko $toko)
    {
        return Inertia::render('Dashboard/Toko/Show', ['toko' => $toko]);
    }

    public function edit(Toko $toko)
    {
        return Inertia::render('Dashboard/Toko/Edit', ['toko' => $toko]);
    }

    public function update(Request $request, Toko $toko)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'description' => 'nullable|string|max:255',
        ]);

        $toko->update($validated);

        return redirect()->route('tokos.index')->with('success', 'Toko berhasil diperbarui');
    }

    public function destroy(Toko $toko)
    {
        $toko->delete();

        return back()->with('success', 'Toko berhasil dihapus');
    }
}
