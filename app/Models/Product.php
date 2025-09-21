<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    public function subcategory()
    {
        return $this->belongsTo(Subcategory::class);
    }

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'description',
        'category',        // String field
        'category_id',     // FK to categories
        'subcategory_id',  // FK to subcategories  
        'unit_id',         // FK to units
        'barcode',
        'location',        // New field
        'purchase_price',
        'sell_price',
        'min_stock'
        // Removed: 'stock' - using WarehouseStock and StoreStock instead
    ];

    /**
     * category
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function categoryRelation(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    /**
     * Compatibility alias for older code that expects ->category relation.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function category(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    // ...existing code...

    /**
     * unit
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function unit(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    /**
     * warehouseStocks
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function warehouseStocks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(WarehouseStock::class, 'product_id');
    }

    /**
     * storeStocks
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function storeStocks(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(StoreStock::class, 'product_id');
    }

    /**
     * warehouseStock - singular relation to get the main warehouse stock
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function warehouseStock(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(WarehouseStock::class, 'product_id');
    }

    /**
     * storeStock - singular relation to get the main store stock
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function storeStock(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(StoreStock::class, 'product_id');
    }
}
