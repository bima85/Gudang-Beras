<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StoreStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'toko_id',
        'qty_in_kg',
        'updated_by'
    ];

    protected $casts = [
        'qty_in_kg' => 'decimal:2',
    ];

    /**
     * Relasi ke Product
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relasi ke Toko
     */
    public function toko()
    {
        return $this->belongsTo(Toko::class);
    }

    /**
     * Relasi ke User yang terakhir update
     */
    public function updatedBy()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Scope untuk mendapatkan stok berdasarkan produk dan toko
     */
    public static function getStock($productId, $tokoId)
    {
        $stock = self::where('product_id', $productId)
            ->where('toko_id', $tokoId)
            ->first();

        return $stock ? $stock->qty_in_kg : 0;
    }

    /**
     * Method untuk menambah stok
     */
    public static function addStock($productId, $tokoId, $qtyKg, $userId = null)
    {
        $stock = self::firstOrCreate(
            ['product_id' => $productId, 'toko_id' => $tokoId],
            ['qty_in_kg' => 0]
        );

        $stock->increment('qty_in_kg', $qtyKg);
        $stock->update(['updated_by' => $userId]);

        return $stock;
    }

    /**
     * Method untuk mengurangi stok
     */
    public static function reduceStock($productId, $tokoId, $qtyKg, $userId = null)
    {
        $stock = self::where('product_id', $productId)
            ->where('toko_id', $tokoId)
            ->first();

        if (!$stock || $stock->qty_in_kg < $qtyKg) {
            return false;
        }

        $stock->decrement('qty_in_kg', $qtyKg);
        $stock->update(['updated_by' => $userId]);

        return $stock;
    }
}
