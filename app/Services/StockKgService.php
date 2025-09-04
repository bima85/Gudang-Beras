<?php

namespace App\Services;

use App\Models\Unit;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use Illuminate\Support\Facades\Log;

class StockKgService
{
    // get or fail kg unit
    public static function getKgUnit()
    {
        $unitKg = Unit::where('name', 'kg')->first();
        if (! $unitKg) {
            Log::error('[StockKgService] unit kg not found');
            return null;
        }
        return $unitKg;
    }

    // create warehouse stock entry but converted into kg unit
    public static function createWarehouseStock(array $data)
    {
        // expected keys: product_id, unit_id, warehouse_id, qty, type, note, sisa_stok (optional), user_id
        $unit = Unit::find($data['unit_id']);
        $unitKg = self::getKgUnit();
        if (! $unitKg) return null;

        $conversion = $unit?->conversion_to_kg ?? 1;
        // normalize qty: service treats qty as magnitude; apply sign based on type
        $amount = isset($data['qty']) ? abs($data['qty']) : 0;
        $qtyKg = $amount * $conversion;

        // determine old_sisa in kg from last kg row or sum
        $lastKg = WarehouseStock::where('product_id', $data['product_id'])
            ->where('warehouse_id', $data['warehouse_id'])
            ->where('unit_id', $unitKg->id)
            ->orderByDesc('id')
            ->first();
        $old_sisa = $lastKg ? ($lastKg->sisa_stok ?? $lastKg->stok_gudang) : WarehouseStock::where('product_id', $data['product_id'])->where('warehouse_id', $data['warehouse_id'])->where('unit_id', $unitKg->id)->sum('stok_gudang');

        $new_sisa = ($data['type'] === 'in') ? ($old_sisa + $qtyKg) : ($old_sisa - $qtyKg);

        $created = WarehouseStock::create([
            'product_id' => $data['product_id'],
            'unit_id' => $unitKg->id,
            'warehouse_id' => $data['warehouse_id'],
            'stok_gudang' => $data['type'] === 'in' ? $qtyKg : -1 * $qtyKg,
            'type' => $data['type'],
            'note' => $data['note'] ?? null,
            'sisa_stok' => $new_sisa,
            'user_id' => $data['user_id'] ?? null,
        ]);

        return $created;
    }

    // create toko stock entry converted into kg
    public static function createTokoStock(array $data)
    {
        // expected keys: product_id, unit_id, toko_id, qty, type, note, user_id
        $unit = Unit::find($data['unit_id']);
        $unitKg = self::getKgUnit();
        if (! $unitKg) return null;

        $conversion = $unit?->conversion_to_kg ?? 1;
        $qtyKg = $data['qty'] * $conversion;

        // find last toko kg row
        $lastKg = StoreStock::where('product_id', $data['product_id'])
            ->where('toko_id', $data['toko_id'])
            ->where('unit_id', $unitKg->id)
            ->orderByDesc('id')
            ->first();
        $old_sisa = $lastKg ? ($lastKg->sisa_stok ?? $lastKg->qty) : StoreStock::where('product_id', $data['product_id'])->where('toko_id', $data['toko_id'])->where('unit_id', $unitKg->id)->sum('qty');

        $new_sisa = ($data['type'] === 'in') ? ($old_sisa + $qtyKg) : ($old_sisa - $qtyKg);

        $storedQty = ($data['type'] === 'in') ? $qtyKg : -1 * $qtyKg;

        $created = StoreStock::create([
            'product_id' => $data['product_id'],
            'toko_id' => $data['toko_id'],
            'unit_id' => $unitKg->id,
            'qty' => $storedQty,
            'type' => $data['type'] ?? null,
            'note' => $data['note'] ?? null,
            'sisa_stok' => $new_sisa,
            'user_id' => $data['user_id'] ?? null,
        ]);

        return $created;
    }
}
