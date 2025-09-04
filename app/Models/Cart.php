<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'cashier_id',
        'product_id',
        'qty',
        'price',
        'unit_id',
        'category_id',
        'subcategory_id',
        'toko_id',
        'pakai_stok_toko',
        'toko_consumed',
        'stok_toko_id',
    ];

    /**
     * Get the product associated with the cart.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Relasi ke kategori
    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // Relasi ke subkategori
    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class, 'subcategory_id');
    }

    /**
     * Get the unit associated with the cart (from units table).
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id', 'id');
    }
    // HAPUS relasi unitConversion karena sudah tidak dipakai dan menyebabkan error
}
