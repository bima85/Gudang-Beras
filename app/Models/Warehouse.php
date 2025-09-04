<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Warehouse extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'code',
        'phone',
        'address',
        'description',
    ];

    /**
     * warehouseStocks
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function warehouseStocks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WarehouseStock::class, 'warehouse_id');
    }
}
