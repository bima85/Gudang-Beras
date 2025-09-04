<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\WarehouseStock;
use App\Models\Unit;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StockMovementController extends Controller
{
    /**
     * Display a listing of stock movements.
     */
    public function index(Request $request)
    {
        $query = StockMovement::with(['product.category', 'warehouse', 'toko', 'user'])
            ->orderBy('created_at', 'desc');

        // Filter by product if specified
        if ($request->filled('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        // Filter by warehouse if specified
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        // Filter by toko if specified
        if ($request->filled('toko_id')) {
            $query->where('toko_id', $request->toko_id);
        }

        // Filter by type if specified
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        $stockMovements = $query->paginate(20)->withQueryString();

        // Get filter options
        $products = Product::select('id', 'name', 'barcode')->orderBy('name')->get();
        $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
        $tokos = Toko::select('id', 'name')->orderBy('name')->get();
        $types = ['purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment'];

        $user = $request->user();

        return Inertia::render('Dashboard/StockMovements/Index', [
            'stockMovements' => $stockMovements,
            'products' => $products,
            'warehouses' => $warehouses,
            'tokos' => $tokos,
            'types' => $types,
            'filters' => $request->only(['product_id', 'warehouse_id', 'toko_id', 'type', 'date_from', 'date_to']),
            'permissions' => [
                'create' => $user->can('stock-movements.create') || $user->can('stock-movements.manage'),
                'edit' => $user->can('stock-movements.edit') || $user->can('stock-movements.manage'),
                'delete' => $user->can('stock-movements.delete') || $user->can('stock-movements.manage'),
                'view' => $user->can('stock-movements.view') || $user->can('stock-movements.manage'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new stock movement.
     */
    public function create()
    {
        $products = Product::with('category')
            ->select('id', 'name', 'barcode', 'category_id')
            ->orderBy('name')
            ->get();

        $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
        $tokos = Toko::select('id', 'name')->orderBy('name')->get();

        $units = Unit::select('id', 'name', 'conversion_to_kg')->orderBy('name')->get();

        $types = [
            'purchase' => 'Pembelian',
            'transfer_in' => 'Transfer Masuk',
            'adjustment' => 'Penyesuaian'
        ];

        return Inertia::render('Dashboard/StockMovements/Create', [
            'products' => $products,
            'warehouses' => $warehouses,
            'tokos' => $tokos,
            'units' => $units,
            'types' => $types,
            'permissions' => [
                'create' => true, // User sudah bisa access create page
            ],
        ]);
    }

    /**
     * Store a newly created stock movement.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'nullable|exists:warehouses,id',
            'toko_id' => 'nullable|exists:tokos,id',
            'type' => ['required', Rule::in(['purchase', 'sale', 'transfer_in', 'transfer_out', 'adjustment'])],
            'qty_input' => 'required|numeric|min:0.01',
            'unit_input' => 'required|exists:units,id',
            'description' => 'nullable|string|max:255',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
        ]);

        // Validasi bahwa hanya salah satu warehouse_id atau toko_id yang diisi
        if (($request->warehouse_id && $request->toko_id) || (!$request->warehouse_id && !$request->toko_id)) {
            return response()->json([
                'message' => 'Pilih warehouse atau toko, tidak keduanya',
                'errors' => [
                    'warehouse_id' => ['Pilih warehouse atau toko'],
                    'toko_id' => ['Pilih warehouse atau toko']
                ]
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Get unit conversion
            $unit = Unit::find($request->unit_input);
            $conversionToKg = $unit ? (float) $unit->conversion_to_kg : 1.0;

            // Convert quantity to kg
            $quantityInKg = (float) $request->qty_input * $conversionToKg;

            // Determine if this is addition or subtraction
            $isAddition = in_array($request->type, ['purchase', 'transfer_in', 'adjustment']);
            $quantityChange = $isAddition ? $quantityInKg : -$quantityInKg;

            if ($request->warehouse_id) {
                // Handle warehouse stock
                $currentStock = WarehouseStock::getStock($request->product_id, $request->warehouse_id);
                $newBalance = $currentStock + $quantityChange;

                // Check for negative stock (only for subtractions)
                if (!$isAddition && $newBalance < 0) {
                    return response()->json([
                        'message' => 'Stok tidak mencukupi. Stok tersedia: ' . $currentStock . ' kg, diminta: ' . $quantityInKg . ' kg',
                        'errors' => [
                            'qty_input' => ['Stok tidak mencukupi']
                        ]
                    ], 422);
                }

                // Update warehouse stock using helper method
                WarehouseStock::updateStock(
                    $request->product_id,
                    $request->warehouse_id,
                    $quantityChange,
                    $request->type,
                    $request->reference_type,
                    $request->reference_id,
                    $request->description,
                    Auth::id()
                );
            } else {
                // Handle toko stock
                $currentStock = StockMovement::getCurrentTokoStock($request->product_id, $request->toko_id);
                $newBalance = $currentStock + $quantityChange;

                // Check for negative stock (only for subtractions)
                if (!$isAddition && $newBalance < 0) {
                    return response()->json([
                        'message' => 'Stok toko tidak mencukupi. Stok tersedia: ' . $currentStock . ' kg, diminta: ' . $quantityInKg . ' kg',
                        'errors' => [
                            'qty_input' => ['Stok toko tidak mencukupi']
                        ]
                    ], 422);
                }

                // Record toko stock movement
                StockMovement::recordTokoMovement(
                    $request->product_id,
                    $request->toko_id,
                    $quantityChange,
                    $request->type,
                    $request->reference_type,
                    $request->reference_id,
                    $request->description,
                    Auth::id()
                );
            }

            DB::commit();

            Log::info('[StockMovementController::store] Stock movement created', [
                'product_id' => $request->product_id,
                'warehouse_id' => $request->warehouse_id,
                'toko_id' => $request->toko_id,
                'type' => $request->type,
                'quantity_change' => $quantityChange,
                'new_balance' => $newBalance,
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->route('stock-movements.index')
                ->with('success', 'Pergerakan stok berhasil dicatat');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('[StockMovementController::store] Error creating stock movement', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan: ' . $e->getMessage(),
                'errors' => [
                    'general' => [$e->getMessage()]
                ]
            ], 500);
        }
    }

    /**
     * Display the specified stock movement.
     */
    public function show(StockMovement $stockMovement)
    {
        $stockMovement->load(['product.category', 'warehouse', 'toko', 'user']);

        return Inertia::render('Dashboard/StockMovements/Show', [
            'stockMovement' => $stockMovement,
        ]);
    }

    /**
     * Show the form for editing the specified stock movement.
     */
    public function edit(StockMovement $stockMovement)
    {
        $stockMovement->load(['product', 'warehouse', 'toko']);

        $products = Product::with('category')
            ->select('id', 'name', 'barcode', 'category_id')
            ->orderBy('name')
            ->get();

        $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
        $tokos = Toko::select('id', 'name')->orderBy('name')->get();

        $units = Unit::select('id', 'name', 'conversion_to_kg')->orderBy('name')->get();

        $types = [
            'purchase' => 'Pembelian',
            'sale' => 'Penjualan',
            'transfer_in' => 'Transfer Masuk',
            'transfer_out' => 'Transfer Keluar',
            'adjustment' => 'Penyesuaian'
        ];

        return Inertia::render('Dashboard/StockMovements/Edit', [
            'stockMovement' => $stockMovement,
            'products' => $products,
            'warehouses' => $warehouses,
            'tokos' => $tokos,
            'units' => $units,
            'types' => $types,
            'permissions' => [
                'edit' => true, // User sudah bisa access edit page
            ],
        ]);
    }

    /**
     * Update the specified stock movement.
     */
    public function update(Request $request, StockMovement $stockMovement)
    {
        $request->validate([
            'description' => 'nullable|string|max:255',
            'reference_type' => 'nullable|string',
            'reference_id' => 'nullable|integer',
        ]);

        try {
            // Only allow updating description and reference fields
            // Stock quantities should not be editable to maintain data integrity
            $stockMovement->update($request->only([
                'description',
                'reference_type',
                'reference_id'
            ]));

            Log::info('[StockMovementController::update] Stock movement updated', [
                'id' => $stockMovement->id,
                'updated_fields' => $request->only(['description', 'reference_type', 'reference_id']),
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->route('stock-movements.index')
                ->with('success', 'Pergerakan stok berhasil diperbarui');
        } catch (\Exception $e) {
            Log::error('[StockMovementController::update] Error updating stock movement', [
                'id' => $stockMovement->id,
                'error' => $e->getMessage(),
                'request' => $request->all(),
            ]);

            return back()->withErrors(['general' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified stock movement.
     * Note: This should be used with extreme caution as it affects stock balances.
     */
    public function destroy(StockMovement $stockMovement)
    {
        try {
            DB::beginTransaction();

            // Reverse the stock movement by applying opposite quantity
            $reverseQuantity = -$stockMovement->quantity_in_kg;

            WarehouseStock::updateStock(
                $stockMovement->product_id,
                $stockMovement->warehouse_id,
                $reverseQuantity,
                'adjustment',
                'reversal',
                $stockMovement->id,
                'Pembatalan movement ID: ' . $stockMovement->id,
                Auth::id()
            );

            // Delete the original movement
            $stockMovement->delete();

            DB::commit();

            Log::warning('[StockMovementController::destroy] Stock movement deleted and reversed', [
                'id' => $stockMovement->id,
                'product_id' => $stockMovement->product_id,
                'warehouse_id' => $stockMovement->warehouse_id,
                'reversed_quantity' => $reverseQuantity,
                'user_id' => Auth::id(),
            ]);

            return redirect()
                ->route('stock-movements.index')
                ->with('success', 'Pergerakan stok berhasil dibatalkan dan stok telah disesuaikan');
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('[StockMovementController::destroy] Error deleting stock movement', [
                'id' => $stockMovement->id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors(['general' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Get current stock for a product in a warehouse (API endpoint)
     */
    public function getCurrentStock(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
        ]);

        $currentStock = WarehouseStock::getStock($request->product_id, $request->warehouse_id);

        return response()->json([
            'current_stock_kg' => $currentStock,
            'current_stock_formatted' => number_format($currentStock, 2) . ' kg',
        ]);
    }
}
