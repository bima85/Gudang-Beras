<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\StockMovement;
use App\Models\WarehouseStock;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class RealtimeDashboardController extends Controller
{
    public function getBarangMasukHariIni(Request $request)
    {
        try {
            // Get today's incoming stock movements
            $barangMasukHariIni = StockMovement::with(['product.category', 'product.unit'])
                ->where('type', 'masuk')
                ->whereDate('created_at', Carbon::today())
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($movement) {
                    return [
                        'id' => $movement->id,
                        'quantity' => $movement->quantity,
                        'created_at' => $movement->created_at,
                        'product' => [
                            'id' => $movement->product->id ?? null,
                            'name' => $movement->product->name ?? null,
                            'category' => [
                                'name' => $movement->product->category->name ?? null,
                            ],
                            'unit' => [
                                'name' => $movement->product->unit->name ?? 'unit',
                            ],
                        ],
                    ];
                });

            return response()->json([
                'success' => true,
                'barangMasukHariIni' => $barangMasukHariIni,
                'total_items' => $barangMasukHariIni->count(),
                'last_updated' => Carbon::now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching data: ' . $e->getMessage(),
                'barangMasukHariIni' => [],
            ], 500);
        }
    }

    public function getDashboardStats(Request $request)
    {
        try {
            // Get warehouse filter if provided
            $warehouseId = $request->get('warehouse_id');

            // Get today's incoming items
            $barangMasukQuery = StockMovement::with(['product.category', 'product.unit'])
                ->where('type', 'masuk')
                ->whereDate('created_at', Carbon::today());

            if ($warehouseId) {
                $barangMasukQuery->where('warehouse_id', $warehouseId);
            }

            $barangMasukHariIni = $barangMasukQuery->orderBy('created_at', 'desc')->get();

            // Get current rice stock - improved query with more flexible search
            Log::info('Checking rice stock...');

            // Debug: Check available products (look for beras, rice, or any grain products)
            $berasProducts = Product::where(function ($query) {
                $query->where('name', 'like', '%beras%')
                    ->orWhere('name', 'like', '%rice%')
                    ->orWhere('name', 'like', '%padi%')
                    ->orWhere('name', 'like', '%gabah%');
            })->get();

            // If no specific rice products, take all products as fallback for demo
            if ($berasProducts->isEmpty()) {
                $berasProducts = Product::all();
                Log::info('No rice products found, using all products as fallback');
            }

            Log::info('Found rice/grain products:', $berasProducts->pluck('name', 'id')->toArray());

            // Debug: Check available warehouses
            $warehouses = Warehouse::all();
            Log::info('Available warehouses:', $warehouses->pluck('name', 'id')->toArray());

            // Get rice stock - more flexible approach
            $stokBerasGudang = 0;
            $stokBerasToko = 0;

            if ($berasProducts->isNotEmpty()) {
                $berasProductIds = $berasProducts->pluck('id');

                // Get stock for gudang - improved logic (from warehouse_stocks)
                $gudangWarehouses = Warehouse::where(function ($query) {
                    $query->where('name', 'like', '%gudang%')
                        ->orWhere('name', 'like', '%warehouse%')
                        ->orWhere('name', 'like', '%widuran%')
                        ->orWhere(function ($subQuery) {
                            // Include "PT BERAS" as gudang since it contains "BERAS"
                            $subQuery->where('name', 'like', '%PT%')
                                ->where('name', 'like', '%BERAS%');
                        });
                })->get();

                Log::info('Gudang warehouses found:', $gudangWarehouses->pluck('name', 'id')->toArray());

                // Calculate gudang stock from warehouse_stocks
                if ($gudangWarehouses->isNotEmpty()) {
                    $stokBerasGudang = WarehouseStock::whereIn('product_id', $berasProductIds)
                        ->whereIn('warehouse_id', $gudangWarehouses->pluck('id'))
                        ->sum('qty_in_kg');
                }

                // Get stock for toko from warehouse_stocks (exclude the ones already counted as gudang)
                $tokoWarehouses = Warehouse::where(function ($query) use ($gudangWarehouses) {
                    $query->where('name', 'like', '%toko%')
                        ->orWhere('name', 'like', '%store%');

                    // Exclude warehouses already counted as gudang
                    if ($gudangWarehouses->isNotEmpty()) {
                        $query->whereNotIn('id', $gudangWarehouses->pluck('id'));
                    }
                })->get();

                Log::info('Toko warehouses found:', $tokoWarehouses->pluck('name', 'id')->toArray());

                $tokoWarehouseStock = 0;
                if ($tokoWarehouses->isNotEmpty()) {
                    $tokoWarehouseStock = WarehouseStock::whereIn('product_id', $berasProductIds)
                        ->whereIn('warehouse_id', $tokoWarehouses->pluck('id'))
                        ->sum('qty_in_kg');
                }

                // ALSO ADD stock from store_stocks table (this was missing!)
                $storeStockTotal = \App\Models\StoreStock::whereIn('product_id', $berasProductIds)
                    ->sum('qty_in_kg');

                Log::info('Store stocks total:', ['store_stock_total' => $storeStockTotal]);

                // Combine toko warehouse stock + store stock
                $stokBerasToko = $tokoWarehouseStock + $storeStockTotal;

                // Fallback: if no specific gudang/toko found, distribute stocks
                if ($gudangWarehouses->isEmpty() && $tokoWarehouses->isEmpty() && $storeStockTotal == 0) {
                    $allBerasStock = WarehouseStock::whereIn('product_id', $berasProductIds)->sum('qty_in_kg');
                    // Give most to gudang
                    $stokBerasGudang = $allBerasStock * 0.7;
                    $stokBerasToko = $allBerasStock * 0.3;
                }
            }

            Log::info('Rice stock calculated:', [
                'gudang' => $stokBerasGudang,
                'toko' => $stokBerasToko,
                'gudang_warehouses' => $gudangWarehouses ?? collect(),
                'toko_warehouses' => $tokoWarehouses ?? collect()
            ]);
            return response()->json([
                'success' => true,
                'barangMasukHariIni' => $barangMasukHariIni->map(function ($movement) {
                    return [
                        'id' => $movement->id,
                        'quantity' => $movement->quantity,
                        'created_at' => $movement->created_at,
                        'product' => [
                            'id' => $movement->product->id ?? null,
                            'name' => $movement->product->name ?? null,
                            'category' => [
                                'name' => $movement->product->category->name ?? null,
                            ],
                            'unit' => [
                                'name' => $movement->product->unit->name ?? 'unit',
                            ],
                        ],
                    ];
                }),
                'stokBerasGudang' => $stokBerasGudang,
                'stokBerasToko' => $stokBerasToko,
                'last_updated' => Carbon::now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching dashboard stats: ' . $e->getMessage(),
            ], 500);
        }
    }
}
