<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Unit;
use App\Models\Warehouse;
use App\Models\StockCard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class StockCardController extends Controller
{
    public function index()
    {
        $stockCards = StockCard::with(['product.category', 'product.subcategory', 'warehouse', 'toko', 'unit'])
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        // Update saldo with actual current stock and convert QTY to original unit
        foreach ($stockCards as $card) {
            // Debug category relationship - manual lookup for category
            if ($card->product && $card->product->category_id) {
                $category = \App\Models\Category::find($card->product->category_id);
                $card->category_name = $category ? $category->name : '-';
            } else {
                $card->category_name = '-';
            }

            // Convert QTY from kg back to original unit for display
            if ($card->unit && $card->unit->conversion_to_kg > 0) {
                $card->qty_original = $card->qty / $card->unit->conversion_to_kg;
            } else {
                $card->qty_original = $card->qty;
            }

            if ($card->warehouse_id) {
                // For warehouse stock cards, get actual warehouse stock
                $actualStock = DB::table('warehouse_stocks')
                    ->where('product_id', $card->product_id)
                    ->where('warehouse_id', $card->warehouse_id)
                    ->value('qty_in_kg');

                // Update the saldo to show current actual stock
                if ($actualStock !== null) {
                    $card->actual_saldo = $actualStock;
                } else {
                    $card->actual_saldo = 0;
                }
            } elseif ($card->toko_id) {
                // For store stock cards, get actual store stock
                $actualStock = DB::table('store_stocks')
                    ->where('product_id', $card->product_id)
                    ->where('toko_id', $card->toko_id)
                    ->value('qty_in_kg');

                // Update the saldo to show current actual stock
                if ($actualStock !== null) {
                    $card->actual_saldo = $actualStock;
                } else {
                    $card->actual_saldo = 0;
                }
            }
        }

        return Inertia::render('Dashboard/StockCards/Index', [
            'stockCards' => ['data' => $stockCards],
        ]);
    }

    public function create()
    {
        return Inertia::render('Dashboard/StockCards/Create', [
            'products' => Product::all(),
            'warehouses' => Warehouse::all(),
            'units' => Unit::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'type' => 'required|in:in,out,adjustment',
            'qty_original' => 'required|numeric|min:0.01',
            'unit_id' => 'required|exists:units,id',
            'note' => 'nullable|string|max:255',
        ]);

        $unit = Unit::findOrFail($request->unit_id);
        $conversion = $unit->conversion_to_kg ?? 1;
        $qtyKg = $request->qty_original * $conversion;

        // Ambil saldo terakhir
        $last = StockCard::where('product_id', $request->product_id)
            ->where('warehouse_id', $request->warehouse_id)
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->first();

        $saldoLama = $last?->saldo ?? 0;
        $qtySigned = $request->type === 'in' ? $qtyKg : ($request->type === 'out' ? -$qtyKg : 0);

        $saldoBaru = $saldoLama + $qtySigned;

        StockCard::create([
            'product_id' => $request->product_id,
            'warehouse_id' => $request->warehouse_id,
            'unit_id' => $request->unit_id,
            'type' => $request->type,
            'qty' => $qtyKg,
            'saldo' => $saldoBaru,
            'note' => $request->note,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('stock-cards.index')->with('success', 'Data kartu stok berhasil disimpan.');
    }
}
