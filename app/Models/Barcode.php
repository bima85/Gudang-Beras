<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Barcode extends Model
{
    use HasFactory;
    protected $fillable = [
        'product_id',
        'barcode',
    ];
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
