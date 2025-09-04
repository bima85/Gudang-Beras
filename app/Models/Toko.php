<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Toko extends Model
{
    use SoftDeletes;

    protected $table = 'tokos';
    protected $fillable = [
        'name',
        'address',
        'phone',
        'description',
    ];

    protected $dates = ['deleted_at'];

    /**
     * storeStocks
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function storeStocks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreStock::class, 'toko_id');
    }
}
