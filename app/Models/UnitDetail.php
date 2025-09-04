<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UnitDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_id',
        'name_unit',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }
}
