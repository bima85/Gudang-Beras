<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PurchaseItem extends Model
{
    protected $fillable = ['purchase_id', 'product_id', 'unit_id', 'category_id', 'subcategory_id', 'qty', 'qty_gudang', 'qty_toko', 'harga_pembelian', 'subtotal', 'kuli_fee', 'timbangan'];

    public function purchase()
    {
        return $this->belongsTo(Purchase::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }
}
