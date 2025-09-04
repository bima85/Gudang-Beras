<?php

namespace App\Helpers;

use App\Models\Unit;

class UnitConversionHelper
{
    public static function convertToBaseUnit($unitId, $qty)
    {
        $unit = Unit::find($unitId);
        return $unit ? $qty * $unit->conversion_to_base : $qty;
    }
    // Konversi ke satuan dasar (kg)
    public static function toKg($qty, $conversionToKg)
    {
        return $qty * $conversionToKg;
    }

    // Konversi dari kg ke semua satuan (ton, sak, kg)
    // Return: [ 'ton' => float, 'sak' => float, 'kg' => float ]
    public static function fromKg($qtyKg)
    {
        return [
            'ton' => $qtyKg / 1000,
            'sak' => $qtyKg / 25,
            'kg'  => $qtyKg,
        ];
    }

    // Konversi pecahan: hasilkan ton bulat, sak bulat, sisa kg
    public static function pecahKg($qtyKg)
    {
        $ton = floor($qtyKg / 1000);
        $sisaKgSetelahTon = $qtyKg % 1000;
        $sak = floor($sisaKgSetelahTon / 25);
        $kg = $sisaKgSetelahTon % 25;
        return [
            'ton' => $ton,
            'sak' => $sak,
            'kg'  => $kg,
        ];
    }
}
