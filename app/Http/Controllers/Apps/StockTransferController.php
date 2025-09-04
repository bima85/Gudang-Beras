<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class StockTransferController extends Controller
{
    /**
     * Display stock transfer page
     */
    public function index()
    {
        $warehouses = Warehouse::where(function ($q) {
            $q->whereNull('type')->orWhere('type', '!=', 'toko');
        })->get(['id', 'name']);

        $tokos = \App\Models\Toko::get(['id', 'name']);
        $products = Product::with(['category', 'subcategory'])->get();
        $units = \App\Models\Unit::get();

        return Inertia::render('Dashboard/StockTransfer/Index', [
            'warehouses' => $warehouses,
            'tokos' => $tokos,
            'products' => $products,
            'units' => $units,
        ]);
    }

    /**
     * Transfer stock from warehouse to toko
     */
    public function transferToToko(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'from_warehouse_id' => 'required|exists:warehouses,id',
            'to_toko_id' => 'required|exists:tokos,id',
            'unit_id' => 'required|exists:units,id',
            'qty' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $unit = \App\Models\Unit::find($request->unit_id);
            $qtyInKg = $request->qty * ($unit->conversion_to_kg ?? 1);

            // Check warehouse stock
            $currentWarehouseStock = WarehouseStock::getStock($request->product_id, $request->from_warehouse_id);
            if ($currentWarehouseStock < $qtyInKg) {
                return response()->json([
                    'message' => 'Stok gudang tidak mencukupi',
                    'available' => $currentWarehouseStock,
                    'required' => $qtyInKg
                ], 422);
            }

            // Reduce warehouse stock
            WarehouseStock::reduceStock(
                $request->product_id,
                $request->from_warehouse_id,
                $qtyInKg,
                Auth::id()
            );

            // Add toko stock
            \App\Services\StockKgService::createTokoStock([
                'product_id' => $request->product_id,
                'toko_id' => $request->to_toko_id,
                'unit_id' => $request->unit_id,
                'qty' => $request->qty,
                'type' => 'in',
                'note' => "Transfer dari gudang ID: {$request->from_warehouse_id}. {$request->notes}",
                'user_id' => Auth::id(),
            ]);

            // Create StockCard entries
            $warehouse = Warehouse::find($request->from_warehouse_id);
            $toko = \App\Models\Toko::find($request->to_toko_id);

            // Warehouse out
            $lastWarehouseCard = \App\Models\StockCard::where('product_id', $request->product_id)
                ->where('warehouse_id', $request->from_warehouse_id)
                ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
            $warehouseSaldoLama = $lastWarehouseCard?->saldo ?? 0;
            $warehouseSaldoBaru = $warehouseSaldoLama - $qtyInKg;

            \App\Models\StockCard::create([
                'product_id' => $request->product_id,
                'warehouse_id' => $request->from_warehouse_id,
                'toko_id' => null,
                'unit_id' => $request->unit_id,
                'date' => now(),
                'type' => \App\Models\StockCard::TYPE_OUT,
                'qty' => $qtyInKg,
                'saldo' => $warehouseSaldoBaru,
                'note' => "Transfer ke {$toko->name}. {$request->notes}",
                'user_id' => Auth::id(),
            ]);

            // Toko in
            $lastTokoCard = \App\Models\StockCard::where('product_id', $request->product_id)
                ->where('toko_id', $request->to_toko_id)
                ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
            $tokoSaldoLama = $lastTokoCard?->saldo ?? 0;
            $tokoSaldoBaru = $tokoSaldoLama + $qtyInKg;

            \App\Models\StockCard::create([
                'product_id' => $request->product_id,
                'warehouse_id' => null,
                'toko_id' => $request->to_toko_id,
                'unit_id' => $request->unit_id,
                'date' => now(),
                'type' => \App\Models\StockCard::TYPE_IN,
                'qty' => $qtyInKg,
                'saldo' => $tokoSaldoBaru,
                'note' => "Transfer dari {$warehouse->name}. {$request->notes}",
                'user_id' => Auth::id(),
            ]);

            DB::commit();

            Log::info('[StockTransfer] Transfer completed', [
                'product_id' => $request->product_id,
                'from_warehouse' => $request->from_warehouse_id,
                'to_toko' => $request->to_toko_id,
                'qty_kg' => $qtyInKg,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'message' => 'Transfer stok berhasil',
                'transfer_details' => [
                    'product_id' => $request->product_id,
                    'from_warehouse' => $warehouse->name,
                    'to_toko' => $toko->name,
                    'qty' => $request->qty,
                    'unit' => $unit->name,
                    'qty_kg' => $qtyInKg
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollback();

            Log::error('[StockTransfer] Transfer failed', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'message' => 'Transfer gagal: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available stock for transfer
     */
    public function getAvailableStock(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
        ]);

        $currentStock = WarehouseStock::getStock($request->product_id, $request->warehouse_id);

        return response()->json([
            'available_kg' => $currentStock,
            'product_id' => $request->product_id,
            'warehouse_id' => $request->warehouse_id,
        ]);
    }
}
