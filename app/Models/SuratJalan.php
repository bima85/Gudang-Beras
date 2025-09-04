<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Transaction;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\User;

class SuratJalan extends Model
{
    use HasFactory;

    protected $table = 'surat_jalans';

    protected $fillable = [
        'transaction_id',
        'warehouse_id',
        'toko_id',
        'user_id',
        'no_surat',
        'notes',
        'status', // pending, picked, delivered
    ];

    protected $casts = [
        'picked_at' => 'datetime',
    ];

    /**
     * Relation to transaction
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    /**
     * Relation to warehouse
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class, 'warehouse_id');
    }

    /**
     * Relation to toko
     */
    public function toko()
    {
        return $this->belongsTo(Toko::class, 'toko_id');
    }

    /**
     * Relation to user (creator/cashier)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
