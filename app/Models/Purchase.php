<?php

namespace App\Models;

use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\PurchaseItem;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Purchase extends Model
{

    use HasFactory;
    protected $fillable = [
        'supplier_id',
        'warehouse_id',
        'toko_id',
        'purchase_date',
        'invoice_number',
        'total',
        'total_pembelian',
        'user_id',
        'category_id'
    ];
    protected $casts = [
        'purchase_date' => 'date',
        'total' => 'decimal:2',
    ];
    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function items()
    {
        return $this->hasMany(PurchaseItem::class);
    }
    public function toko()
    {
        return $this->belongsTo(\App\Models\Toko::class);
    }
}
