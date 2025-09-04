<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    use HasFactory;
    use HasFactory;

    protected $fillable = [
        'name',
        'conversion_to_kg',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'conversion_to_kg' => 'float',
    ];

    // 🔁 Relasi ke pembelian
    public function purchaseItems()
    {
        return $this->hasMany(PurchaseItem::class);
    }

    // 🔁 Relasi ke penjualan
    public function saleItems()
    {
        return $this->hasMany(Transaction::class);
    }

    // 🔁 Relasi ke stok
    public function stocks()
    {
        return $this->hasMany(WarehouseStock::class);
    }
}
