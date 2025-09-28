<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Toko;
use Illuminate\Http\Request;
use Inertia\Inertia;

class StockViewController extends Controller
{
    /**
     * Tampilkan daftar stok warehouse
     */
    public function warehouseStocks(Request $request)
    {
        $query = WarehouseStock::with(['product', 'warehouse', 'updatedBy'])
            ->where('qty_in_kg', '>', 0);

        // Filter berdasarkan warehouse
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        // Filter berdasarkan produk
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $warehouseStocks = $query->latest('updated_at')->get();

        return Inertia::render('Stocks/WarehouseStocks', [
            'warehouseStocks' => $warehouseStocks,
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'filters' => $request->only(['warehouse_id', 'search'])
        ]);
    }

    /**
     * Tampilkan daftar stok toko
     */
    public function storeStocks(Request $request)
    {
        $query = StoreStock::with(['product', 'toko', 'updatedBy'])
            ->where('qty_in_kg', '>', 0);

        // Filter berdasarkan toko
        if ($request->filled('toko_id')) {
            $query->where('toko_id', $request->toko_id);
        }

        // Filter berdasarkan produk
        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $storeStocks = $query->latest('updated_at')->get();

        return Inertia::render('Stocks/StoreStocks', [
            'storeStocks' => $storeStocks,
            'tokos' => Toko::select('id', 'name')->get(),
            'filters' => $request->only(['toko_id', 'search'])
        ]);
    }

    /**
     * API untuk mendapatkan stok produk tertentu
     */
    public function getProductStock(Request $request, $productId)
    {
        $warehouseStocks = WarehouseStock::where('product_id', $productId)
            ->with('warehouse:id,name')
            ->get();

        $storeStocks = StoreStock::where('product_id', $productId)
            ->with('toko:id,name')
            ->get();

        $product = Product::find($productId);

        return response()->json([
            'product' => $product,
            'warehouse_stocks' => $warehouseStocks,
            'store_stocks' => $storeStocks,
            'total_warehouse_stock' => $warehouseStocks->sum('qty_in_kg'),
            'total_store_stock' => $storeStocks->sum('qty_in_kg'),
        ]);
    }

    /**
     * Halaman manajemen stok gabungan
     */
    public function management(Request $request)
    {
        // Ambil data warehouse stocks dengan filter
        $warehouseQuery = WarehouseStock::with(['product', 'warehouse', 'updatedBy'])
            ->where('qty_in_kg', '>', 0);

        // Filter berdasarkan warehouse
        if ($request->filled('warehouse_id')) {
            $warehouseQuery->where('warehouse_id', $request->warehouse_id);
        }

        // Filter berdasarkan produk
        if ($request->filled('search')) {
            $search = $request->search;
            $warehouseQuery->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $warehouseStocks = $warehouseQuery->latest('updated_at')->get();

        // Ambil data store stocks dengan filter
        $storeQuery = StoreStock::with(['product', 'toko', 'updatedBy'])
            ->where('qty_in_kg', '>', 0);

        // Filter berdasarkan toko
        if ($request->filled('toko_id')) {
            $storeQuery->where('toko_id', $request->toko_id);
        }

        // Filter berdasarkan produk
        if ($request->filled('search')) {
            $search = $request->search;
            $storeQuery->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $storeStocks = $storeQuery->latest('updated_at')->get();

        return Inertia::render('Stocks/StockManagement', [
            'warehouseStocks' => $warehouseStocks,
            'storeStocks' => $storeStocks,
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'tokos' => Toko::select('id', 'name')->get(),
            'filters' => $request->only(['warehouse_id', 'toko_id', 'search'])
        ]);
    }
}
