<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockCard extends Model
{
    use HasFactory;

    public function toko()
    {
        return $this->belongsTo(\App\Models\Toko::class);
    }
    use HasFactory;

    protected $fillable = [
        'product_id',
        'warehouse_id',
        'toko_id',
        'quantity_original',
        'unit_id',
        'date',
        'type',
        'qty',
        'saldo',
        'note',
        'user_id',
    ];

    // Konstanta jenis transaksi
    const TYPE_IN = 'in';           // masuk (pembelian, retur pelanggan, produksi, dsb)
    const TYPE_OUT = 'out';         // keluar (penjualan, retur ke supplier, kerusakan)
    const TYPE_ADJUSTMENT = 'adjustment'; // penyesuaian (stok opname, koreksi manual)

    /**
     * Relasi: StockCard milik satu produk
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relasi: StockCard milik satu gudang
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Relasi: StockCard dicatat oleh satu user
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Relasi: StockCard milik satu unit (satuan)
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    /**
     * Scope: Filter berdasarkan produk
     */
    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Scope: Filter berdasarkan gudang
     */
    public function scopeByWarehouse($query, $warehouseId)
    {
        return $query->where('warehouse_id', $warehouseId);
    }

    /**
     * Scope: Filter berdasarkan rentang tanggal
     */
    public function scopeByDateRange($query, $start, $end)
    {
        return $query->whereBetween('date', [$start, $end]);
    }

    /**
     * Scope: Urutkan berdasarkan tanggal
     */
    public function scopeOrdered($query)
    {
        return $query->orderBy('date')->orderBy('id');
    }

    /**
     * Mendapatkan label tipe transaksi
     */
    public function getTypeLabelAttribute()
    {
        return match ($this->type) {
            self::TYPE_IN => 'Masuk',
            self::TYPE_OUT => 'Keluar',
            self::TYPE_ADJUSTMENT => 'Penyesuaian',
            default => ucfirst($this->type),
        };
    }
}
