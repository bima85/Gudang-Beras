<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'toko_id',
        'type',
        'quantity_in_kg',
        'balance_after',
        'reference_type',
        'reference_id',
        'description',
        'user_id',
    ];

    protected $casts = [
        'quantity_in_kg' => 'decimal:2',
        'balance_after' => 'decimal:2',
    ];

    // Relationships
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function toko()
    {
        return $this->belongsTo(\App\Models\Toko::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper method untuk create stock movement
    public static function recordMovement(
        $productId,
        $warehouseId,
        $type,
        $quantityInKg,
        $balanceAfter = null,
        $referenceType = null,
        $referenceId = null,
        $description = null,
        $userId = null,
        $tokoId = null
    ) {
        // If balance not provided, calculate from current stock
        if ($balanceAfter === null) {
            if ($warehouseId) {
                $currentStock = \App\Models\WarehouseStock::getStock($productId, $warehouseId);
                $balanceAfter = $currentStock + $quantityInKg;
            } elseif ($tokoId) {
                // Calculate toko stock in kg
                $currentStock = self::getCurrentTokoStock($productId, $tokoId);
                $balanceAfter = $currentStock + $quantityInKg;
            } else {
                $balanceAfter = $quantityInKg; // fallback
            }
        }

        return self::create([
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'toko_id' => $tokoId,
            'type' => $type,
            'quantity_in_kg' => $quantityInKg,
            'balance_after' => $balanceAfter,
            'reference_type' => $referenceType,
            'reference_id' => $referenceId,
            'description' => $description,
            'user_id' => $userId ?? Auth::id(),
        ]);
    }

    // Helper method untuk get current toko stock in kg
    public static function getCurrentTokoStock($productId, $tokoId)
    {
        $total = DB::table('stock_movements')
            ->where('product_id', $productId)
            ->where('toko_id', $tokoId)
            ->sum('quantity_in_kg');

        return (float)$total;
    }

    // Alternative method untuk record movement khusus toko
    public static function recordTokoMovement(
        $productId,
        $tokoId,
        $type,
        $quantityInKg,
        $referenceType = null,
        $referenceId = null,
        $description = null,
        $userId = null
    ) {
        return self::recordMovement(
            $productId,
            null, // warehouse_id = null
            $type,
            $quantityInKg,
            null, // balance will be calculated
            $referenceType,
            $referenceId,
            $description,
            $userId,
            $tokoId
        );
    }
}
