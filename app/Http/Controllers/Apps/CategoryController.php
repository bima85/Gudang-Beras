<?php

namespace App\Http\Controllers\Apps;


use Inertia\Inertia;
use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('categories-access')) {
            abort(403, 'Unauthorized');
        }

        // Get categories with search and pagination
        $categories = Category::when(request()->input('search'), function ($categories) {
            $search = trim(request()->input('search'));
            $categories->where('name', 'like', '%' . $search . '%');
        })->latest()->paginate(10);

        return Inertia::render('Dashboard/Categories/Index', [
            'categories' => $categories,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('categories-create')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Dashboard/Categories/Create');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('categories-create')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized');
        }

        // Validate request
        $request->validate([
            'code' => 'required|unique:categories,code',
            'name' => 'required',
            'description' => 'required'
        ]);

        try {
            // Create category
            $category = Category::create([
                'code' => $request->input('code'),
                'name' => $request->input('name'),
                'description' => $request->input('description')
            ]);

            // Return JSON response for AJAX requests
            if ($request->expectsJson()) {
                return response()->json([
                    'id' => $category->id,
                    'code' => $category->code,
                    'name' => $category->name,
                    'description' => $category->description,
                    'message' => 'Category created successfully.'
                ], 201);
            }

            return to_route('categories.index')->with('success', 'Category created successfully.');
        } catch (\Exception $e) {
            Log::error('Store category error:', ['message' => $e->getMessage()]);

            if ($request->expectsJson()) {
                return response()->json(['message' => 'Failed to create category. Please try again.'], 500);
            }

            return back()->withErrors(['error' => 'Failed to create category. Please try again.']);
        }
    }
    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Category  $category
     * @return \Inertia\Response
     */
    public function edit(Category $category)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('categories-edit')) {
            abort(403, 'Unauthorized');
        }

        return Inertia::render('Dashboard/Categories/Edit', [
            'category' => $category,
        ]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Category $category)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('categories-edit')) {
            abort(403, 'Unauthorized');
        }

        // Validate request
        $request->validate([
            'code' => 'required|unique:categories,code,' . $category->getKey(),
            'image' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
            'name' => 'required',
            'description' => 'required'
        ]);

        try {
            // Prepare data for update
            $data = [
                'code' => $request->input('code'),
                'name' => $request->input('name'),
                'description' => $request->input('description')
            ];

            // Check if new image is uploaded
            if ($request->hasFile('image')) {
                // Remove old image if exists
                $originalImage = $category->getRawOriginal('image');
                if ($originalImage && Storage::disk('local')->exists('public/category/' . $originalImage)) {
                    Storage::disk('local')->delete('public/category/' . $originalImage);
                }

                // Store new image
                $image = $request->file('image');
                $image->storeAs('public/category', $image->hashName());
                $data['image'] = $image->hashName();
            }

            // Update category
            $category->update($data);

            return to_route('categories.index')->with('success', 'Category updated successfully.');
        } catch (\Exception $e) {
            Log::error('Update category error:', ['message' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to update category. Please try again.']);
        }
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Category  $category
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Category $category)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('categories-delete')) {
            abort(403, 'Unauthorized');
        }

        try {
            // Remove image if exists
            $originalImage = $category->getRawOriginal('image');
            if ($originalImage && Storage::disk('local')->exists('public/category/' . $originalImage)) {
                Storage::disk('local')->delete('public/category/' . $originalImage);
            }

            // Delete category
            $category->delete();

            return to_route('categories.index')->with('success', 'Category deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Delete category error:', ['message' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Failed to delete category. Please try again.']);
        }
    }
}
