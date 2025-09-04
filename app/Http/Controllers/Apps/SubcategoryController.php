<?php

namespace App\Http\Controllers\Apps;

use App\Models\Subcategory;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class SubcategoryController extends Controller
{
    public function index(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('subcategories-access')) {
            abort(403, 'Unauthorized');
        }

        $perPage = $request->input('per_page', 10);
        $subcategories = Subcategory::with('category')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Dashboard/Subcategories/Index', [
            'subcategories' => $subcategories,
        ]);
    }

    public function create()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('subcategories-create')) {
            abort(403, 'Unauthorized');
        }

        $categories = Category::all(['id', 'name']);
        return Inertia::render('Dashboard/Subcategories/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('subcategories-create')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subcategories,code',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string'
        ]);

        try {
            $subcategory = Subcategory::create($validated);

            // Return JSON response for AJAX requests
            if ($request->expectsJson()) {
                return response()->json([
                    'id' => $subcategory->id,
                    'code' => $subcategory->code,
                    'name' => $subcategory->name,
                    'description' => $subcategory->description,
                    'category_id' => $subcategory->category_id,
                    'message' => 'Subcategory created successfully.'
                ], 201);
            }

            return redirect()->route('subcategories.index')->with('success', 'Subcategory created successfully');
        } catch (\Exception $e) {
            Log::error('Store subcategory error:', ['message' => $e->getMessage()]);

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Failed to create subcategory. Please try again.'], 500);
            }

            return back()->withErrors(['error' => 'Failed to create subcategory. Please try again.']);
        }
    }

    public function edit(Subcategory $subcategory)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('subcategories-edit')) {
            abort(403, 'Unauthorized');
        }

        $categories = Category::all(['id', 'name']);
        return Inertia::render('Dashboard/Subcategories/Edit', [
            'subcategory' => $subcategory,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, Subcategory $subcategory)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('subcategories-edit')) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subcategories,code,' . $subcategory->id,
            'category_id' => 'required|exists:categories,id',
        ]);

        $subcategory->update($validated);

        return redirect()->route('subcategories.index')->with('success', 'Subcategory updated successfully');
    }

    public function destroy(Subcategory $subcategory)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('subcategories-delete')) {
            abort(403, 'Unauthorized');
        }

        $subcategory->delete();

        return back()->with('success', 'Subcategory deleted successfully');
    }
}
