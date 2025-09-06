<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_number',
        'transaction_type',
        'transaction_time',
        'transaction_date',
        'related_party',
        'warehouse_id',
        'toko_id',
        'product_id',
        'quantity',
        'unit',
        'price',
        'subtotal',
        'kuli_fee',
        'timbangan',
        'discount',
        'deposit_amount',
        'stock_before',
        'stock_after',
        'payment_status',
        'notes',
        'created_by',
    ];

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
        return $this->belongsTo(Toko::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_number', 'transaction_number');
    }
}
