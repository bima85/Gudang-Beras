<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\WarehouseStock;
use App\Models\Product;
use App\Models\StoreStock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class StockReportController extends Controller
{
    /**
     * Display consolidated stock report (Laporan Stok Akhir)
     */
    public function index(Request $request)
    {
        // Check permission - simplified for now
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $filters = $request->only(['product_id', 'warehouse_id', 'toko_id', 'category_id', 'search']);

        // Get consolidated stock data
        $stockData = $this->getConsolidatedStock($filters);

        $products = Product::select('id', 'name', 'barcode')->get();
        $warehouses = Warehouse::where(function ($q) {
            $q->whereNull('type')->orWhere('type', '!=', 'toko');
        })->get(['id', 'name']);
        $tokos = \App\Models\Toko::get(['id', 'name']);
        $categories = \App\Models\Category::get(['id', 'name']);

        return Inertia::render('Dashboard/StockReports/Index', [
            'stockData' => $stockData,
            'products' => $products,
            'warehouses' => $warehouses,
            'tokos' => $tokos,
            'categories' => $categories,
            'filters' => $filters,
        ]);
    }

    /**
     * Get consolidated stock data
     */
    private function getConsolidatedStock($filters = [])
    {
        // Base query for products
        $productsQuery = Product::with(['category', 'subcategory'])
            ->when($filters['product_id'] ?? null, fn($q, $v) => $q->where('id', $v))
            ->when($filters['category_id'] ?? null, fn($q, $v) => $q->where('category_id', $v))
            ->when($filters['search'] ?? null, fn($q, $v) => $q->where(function ($qq) use ($v) {
                $qq->where('name', 'like', "%{$v}%")
                    ->orWhere('barcode', 'like', "%{$v}%");
            }));

        $products = $productsQuery->get();

        $consolidatedData = [];

        foreach ($products as $product) {
            $productData = [
                'product' => $product,
                'warehouses' => [],
                'tokos' => [],
                'total_warehouse_kg' => 0,
                'total_toko_kg' => 0,
                'grand_total_kg' => 0,
            ];

            // Get warehouse stocks
            $warehouseStocks = WarehouseStock::where('product_id', $product->id)
                ->with('warehouse')
                ->when($filters['warehouse_id'] ?? null, fn($q, $v) => $q->where('warehouse_id', $v))
                ->get();

            foreach ($warehouseStocks as $stock) {
                if ($stock->warehouse && ($stock->warehouse->type !== 'toko' || is_null($stock->warehouse->type))) {
                    $productData['warehouses'][] = [
                        'warehouse' => $stock->warehouse,
                        'qty_kg' => $stock->qty_in_kg,
                    ];
                    $productData['total_warehouse_kg'] += $stock->qty_in_kg;
                }
            }

            // Get toko stocks (aggregate by toko)
            $tokoStocksQuery = DB::table('store_stocks')
                ->select([
                    'toko_id',
                    DB::raw('SUM(qty * COALESCE((SELECT conversion_to_kg FROM units WHERE units.id = stok_tokos.unit_id), 1)) as total_kg')
                ])
                ->where('product_id', $product->id)
                ->when($filters['toko_id'] ?? null, fn($q, $v) => $q->where('toko_id', $v))
                ->groupBy('toko_id')
                ->havingRaw('total_kg > 0');

            $tokoStocks = $tokoStocksQuery->get();

            foreach ($tokoStocks as $tokoStock) {
                $toko = \App\Models\Toko::find($tokoStock->toko_id);
                if ($toko) {
                    $productData['tokos'][] = [
                        'toko' => $toko,
                        'qty_kg' => $tokoStock->total_kg,
                    ];
                    $productData['total_toko_kg'] += $tokoStock->total_kg;
                }
            }

            $productData['grand_total_kg'] = $productData['total_warehouse_kg'] + $productData['total_toko_kg'];

            // Only include products that have stock somewhere
            if ($productData['grand_total_kg'] > 0) {
                $consolidatedData[] = $productData;
            }
        }

        return $consolidatedData;
    }

    /**
     * Export consolidated stock report
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $filters = $request->only(['product_id', 'warehouse_id', 'toko_id', 'category_id', 'search']);
        $format = $request->get('format', 'excel');

        $stockData = $this->getConsolidatedStock($filters);

        if ($format === 'pdf') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.consolidated-stock', compact('stockData'));
            return $pdf->download('laporan-stok-konsolidasi.pdf');
        } else {
            // Simple Excel export for now
            return response()->json([
                'message' => 'Excel export not implemented yet',
                'data' => $stockData
            ]);
        }
    }
}
