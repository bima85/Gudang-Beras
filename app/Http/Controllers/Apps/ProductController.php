<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use App\Models\Unit;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        // Bisa return 404 atau response kosong
        return response()->json(['message' => 'Not implemented'], 404);
    }
    /**
     * Menampilkan daftar sumber daya.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('products-access')) {
            abort(403, 'Unauthorized');
        }

        $products = Product::when(request()->search, function ($query) {
            $query->where('name', 'like', '%' . request()->search . '%')
                ->orWhere('barcode', 'like', '%' . request()->search . '%');
        })
            ->with(['category', 'subcategory', 'unit'])
            ->latest()->paginate(10)
            ->withQueryString();

        return Inertia::render('Dashboard/Products/Index', [
            'products' => $products,
            'filters' => request()->only(['search']),
        ]);
    }

    /**
     * Menampilkan formulir untuk membuat sumber daya baru.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('products-create')) {
            abort(403, 'Unauthorized');
        }

        $categories = Category::select('id', 'name', 'code')->orderBy('name')->get();
        $units = Unit::select('id', 'name', 'symbol', 'conversion_to_kg', 'is_default')->orderBy('name')->get();
        $subcategories = Subcategory::select('id', 'name', 'code', 'category_id')->orderBy('name')->get();

        return Inertia::render('Dashboard/Products/Create', [
            'categories' => $categories,
            'units' => $units,
            'subcategories' => $subcategories,
        ]);
    }

    /**
     * Menyimpan sumber daya baru ke penyimpanan.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('products-create')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            abort(403, 'Unauthorized');
        }

        // For AJAX requests, make validation more flexible
        if ($request->expectsJson()) {
            $request->validate([
                'name' => 'required|string|max:255',
                'category_id' => 'nullable|integer|exists:categories,id',
                'subcategory_id' => 'nullable|integer|exists:subcategories,id',
                'unit_id' => 'nullable|integer|exists:units,id',
                'description' => 'nullable|string',
                'barcode' => 'nullable|string|max:100|unique:products,barcode',
            ]);
        } else {
            $request->validate([
                'barcode' => 'required|unique:products,barcode',
                'name' => 'required|string|max:255',
                'category_id' => 'required|integer|exists:categories,id',
                'subcategory_id' => 'required|integer|exists:subcategories,id',
                'unit_id' => 'required|integer|exists:units,id',
                'min_stock' => 'required|numeric|min:0',
                'description' => 'nullable|string',
            ], [
                'barcode.required' => 'Barcode wajib diisi.',
                'barcode.unique' => 'Barcode sudah terpakai.',
                'name.required' => 'Nama produk wajib diisi.',
                'category_id.required' => 'Kategori wajib dipilih.',
                'category_id.exists' => 'Kategori tidak valid.',
                'subcategory_id.required' => 'Subkategori wajib dipilih.',
                'subcategory_id.exists' => 'Subkategori tidak valid.',
                'unit_id.required' => 'Satuan wajib dipilih.',
                'unit_id.exists' => 'Satuan tidak valid.',
                'min_stock.required' => 'Stok minimal wajib diisi.',
            ]);
        }

        try {
            $productData = [
                'name' => $request->name,
                'description' => $request->description,
            ];

            // For AJAX requests (inline creation)
            if ($request->expectsJson()) {
                $productData['barcode'] = $request->barcode ?? 'BRC_' . Str::random(8);
                $productData['category_id'] = $request->category_id;
                $productData['subcategory_id'] = $request->subcategory_id;

                // Only set unit_id if provided and valid, otherwise leave null
                if ($request->unit_id) {
                    $productData['unit_id'] = $request->unit_id;
                } else {
                    // Try to get the first available unit as fallback
                    $firstUnit = \App\Models\Unit::first();
                    if ($firstUnit) {
                        $productData['unit_id'] = $firstUnit->id;
                    } else {
                        // If no units exist, we can't create product
                        throw new \Exception('No units available. Please create a unit first.');
                    }
                }

                $productData['min_stock'] = $request->min_stock ?? 0;
            } else {
                // For form submissions
                $productData['barcode'] = $request->barcode;
                $productData['category_id'] = $request->category_id;
                $productData['subcategory_id'] = $request->subcategory_id;
                $productData['unit_id'] = $request->unit_id;
                $productData['min_stock'] = $request->min_stock;
            }

            $product = Product::create($productData);

            // Otomatis insert ke tabel barcodes
            \App\Models\Barcode::create([
                'product_id' => $product->id,
                'barcode' => $product->barcode,
            ]);

            // Return JSON response for AJAX requests
            if ($request->expectsJson()) {
                return response()->json([
                    'id' => $product->id,
                    'name' => $product->name,
                    'description' => $product->description,
                    'barcode' => $product->barcode,
                    'category_id' => $product->category_id,
                    'subcategory_id' => $product->subcategory_id,
                    'unit_id' => $product->unit_id,
                    'message' => 'Product created successfully.'
                ], 201);
            }

            return to_route('products.index')->with('success', 'Data produk berhasil disimpan.');
        } catch (\Exception $e) {
            Log::error('Gagal menyimpan produk:', [
                'message' => $e->getMessage(),
                'request_data' => $request->all(),
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);

            if ($request->expectsJson()) {
                $errorMessage = 'Failed to create product. Please try again.';

                // Provide more specific error messages for common issues
                if (strpos($e->getMessage(), 'unit_id_foreign') !== false) {
                    $errorMessage = 'Invalid unit selected. Please choose a valid unit.';
                } elseif (strpos($e->getMessage(), 'category_id_foreign') !== false) {
                    $errorMessage = 'Invalid category selected. Please choose a valid category.';
                } elseif (strpos($e->getMessage(), 'subcategory_id_foreign') !== false) {
                    $errorMessage = 'Invalid subcategory selected. Please choose a valid subcategory.';
                }

                return response()->json(['message' => $errorMessage], 500);
            }

            return back()->withErrors(['error' => 'Gagal menyimpan produk. Silakan coba lagi.']);
        }
    }

    /**
     * Menampilkan formulir untuk mengedit sumber daya tertentu.
     *
     * @param  \App\Models\Product  $product
     * @return \Inertia\Response
     */
    public function edit(Product $product)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('products-edit')) {
            abort(403, 'Unauthorized');
        }

        $product = $product->load('category', 'unit', 'subcategory');
        $categories = Category::select('id', 'name')->orderBy('name')->get();
        $units = Unit::select('id', 'name', 'symbol', 'conversion_to_kg', 'is_default')->orderBy('name')->get();
        $subcategories = Subcategory::select('id', 'name', 'category_id')->orderBy('name')->get();

        return Inertia::render('Dashboard/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'units' => $units,
            'subcategories' => $subcategories,
        ]);
    }

    /**
     * Memperbarui sumber daya tertentu di penyimpanan.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, Product $product)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('products-edit')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'barcode' => "required|unique:products,barcode,{$product->id}",
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'subcategory_id' => 'required|integer|exists:subcategories,id',
            'unit_id' => 'required|integer|exists:units,id',
            'min_stock' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ], [
            'barcode.required' => 'Barcode wajib diisi.',
            'barcode.unique' => 'Barcode sudah terpakai.',
            'name.required' => 'Nama produk wajib diisi.',
            'category_id.required' => 'Kategori wajib dipilih.',
            'category_id.exists' => 'Kategori tidak valid.',
            'subcategory_id.required' => 'Subkategori wajib dipilih.',
            'subcategory_id.exists' => 'Subkategori tidak valid.',
            'unit_id.required' => 'Satuan wajib dipilih.',
            'unit_id.exists' => 'Satuan tidak valid.',
            'min_stock.required' => 'Stok minimal wajib diisi.',
        ]);

        try {
            $product->update([
                'barcode' => $request->barcode,
                'name' => $request->name,
                'category_id' => $request->category_id,
                'subcategory_id' => $request->subcategory_id,
                'unit_id' => $request->unit_id,
                'min_stock' => $request->min_stock,
                'description' => $request->description,
            ]);

            return to_route('products.index')->with('success', 'Data produk berhasil diperbarui.');
        } catch (\Exception $e) {
            Log::error('Gagal memperbarui produk:', ['message' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Gagal memperbarui produk. Silakan coba lagi.']);
        }
    }

    /**
     * Menghapus sumber daya tertentu dari penyimpanan.
     *
     * @param  \App\Models\Product  $product
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy(Product $product)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('products-delete')) {
            abort(403, 'Unauthorized');
        }

        try {
            $product->forceDelete(); // Hard delete

            return to_route('products.index')->with('success', 'Produk berhasil dihapus.');
        } catch (\Exception $e) {
            Log::error('Gagal menghapus produk:', ['message' => $e->getMessage()]);
            return back()->withErrors(['error' => 'Gagal menghapus produk. Silakan coba lagi.']);
        }
    }

    /**
     * Bulk delete products.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return back()->withErrors(['message' => 'Tidak ada produk yang dipilih.']);
        }
        $products = Product::whereIn('id', $ids)->get();
        foreach ($products as $product) {
            $product->forceDelete(); // Hard delete
        }
        return to_route('products.index')->with('success', 'Produk terpilih berhasil dihapus.');
    }

    /**
     * Search product for transaction (stok gudang & toko)
     */
    public function search(Request $request)
    {
        Log::info('[ProductController::search] called', $request->all());

        $barcode = $request->input('barcode');
        $warehouse_id = $request->input('warehouse_id');
        $toko_id = $request->input('toko_id');
        $unit_id = $request->input('unit_id');

        $product = \App\Models\Product::with(['unit', 'category', 'subcategory'])
            ->where('barcode', $barcode)
            ->orWhere('name', 'like', "%$barcode%")
            ->first();
        if (!$product) {
            return response()->json([
                'product' => null,
                'warehouse_stock_kg' => 0,
                'store_stock_kg' => 0,
            ]);
        }

        // Ambil stok dari warehouse_stocks dan store_stocks table yang baru
        $totalStokKg = 0.0;
        $warehouseStockKg = 0.0;
        $storeStockKg = 0.0;

        if ($warehouse_id) {
            // Cek stok warehouse
            $warehouseStock = \App\Models\WarehouseStock::where('product_id', $product->id)
                ->where('warehouse_id', $warehouse_id)
                ->first();

            if ($warehouseStock) {
                $warehouseStockKg = (float) $warehouseStock->qty_in_kg;
            }
        }

        if ($toko_id) {
            // Cek stok toko
            $storeStock = \App\Models\StoreStock::where('product_id', $product->id)
                ->where('toko_id', $toko_id)
                ->first();

            if ($storeStock) {
                $storeStockKg = (float) $storeStock->qty_in_kg;
            }
        }

        // Total stok adalah gabungan warehouse + store
        $totalStokKg = $warehouseStockKg + $storeStockKg;

        // Convert ke unit yang diminta jika ada
        $finalStock = $totalStokKg; // default: return in kg
        if ($unit_id) {
            try {
                $unit = \App\Models\Unit::find($unit_id);
                $requestedUnitConv = $unit ? (float) $unit->conversion_to_kg : null;
                if ($requestedUnitConv && $requestedUnitConv > 0) {
                    $finalStock = $totalStokKg / $requestedUnitConv;
                }
            } catch (\Throwable $e) {
                // Keep in kg if conversion fails
            }
        }

        Log::info('[ProductController::search] new stock calculation', [
            'product_id' => $product->id,
            'warehouse_id' => $warehouse_id,
            'unit_id' => $unit_id,
            'total_kg' => $totalStokKg,
            'final_stock' => $finalStock,
        ]);

        // Attach computed stock values to the product object
        $product->available_qty = (float) $finalStock;
        $product->warehouse_stock_kg = (float) $warehouseStockKg;
        $product->store_stock_kg = (float) $storeStockKg;
        $product->total_stock_kg = (float) $totalStokKg; // untuk info total dalam kg

        // Convert to unit for display if unit available
        $product->warehouse_stock = $warehouseStockKg;
        $product->store_stock = $storeStockKg;

        // Apply unit conversion if unit is loaded
        if ($product->unit && $product->unit->conversion_to_kg > 0) {
            $product->warehouse_stock = $warehouseStockKg / $product->unit->conversion_to_kg;
            $product->store_stock = $storeStockKg / $product->unit->conversion_to_kg;
        }

        Log::info('[ProductController::search] final stock from new structure', [
            'product_id' => $product->id,
            'available_qty' => $finalStock,
            'total_kg' => $totalStokKg
        ]);

        // Attach last purchase price (harga_pembelian) if available
        try {
            $purchasePrice = DB::table('purchase_items')
                ->where('product_id', $product->id)
                ->orderByDesc('id')
                ->value('harga_pembelian');
            $product->purchase_price = $purchasePrice !== null ? $purchasePrice : null;
            Log::info('[ProductController::search] purchase price', ['product_id' => $product->id, 'purchase_price' => $purchasePrice]);
        } catch (\Exception $e) {
            Log::info('[ProductController::search] purchase price lookup failed', ['exception' => $e->getMessage()]);
            $product->purchase_price = null;
        }

        return response()->json([
            'product' => $product,
            'stock' => $finalStock, // stock gabungan
            'stok_toko' => 0, // deprecated
            'combined_available' => $finalStock,
            'total_kg' => $totalStokKg, // total dalam kg
            'warehouse_stock_kg' => $warehouseStockKg, // untuk compatibility dengan frontend
            'store_stock_kg' => $storeStockKg, // untuk compatibility dengan frontend
        ]);
    }
}
