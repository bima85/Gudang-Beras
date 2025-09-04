<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StockRequest extends Model
{
    use HasFactory;

    protected $table = 'stock_requests';

    protected $fillable = [
        'requester_id',
        'from_warehouse_id',
        'to_toko_id',
        'product_id',
        'unit_id',
        'qty',
        'status',
        'approved_by',
        'approved_at',
        'note',
    ];

    protected $casts = [
        'qty' => 'decimal:4',
        'approved_at' => 'datetime',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toToko()
    {
        return $this->belongsTo(Toko::class, 'to_toko_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
