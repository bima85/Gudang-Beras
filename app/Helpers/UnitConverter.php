<?php

namespace App\Helpers;

use App\Models\Unit;

/**
 * Helper untuk konversi unit dengan aturan:
 * - 1 ton = 1000 kg
 * - 1 sak = 25 kg  
 * - 1 kg = 1 kg
 */
class UnitConverter
{
    /**
     * Konversi qty dari unit tertentu ke kg
     * 
     * @param float $qty Jumlah qty
     * @param string|Unit $unit Unit object atau nama unit (ton/sak/kg)
     * @return float Qty dalam kg
     */
    public static function toKg($qty, $unit)
    {
        // Jika unit adalah object Unit dari database
        if ($unit instanceof Unit) {
            return $qty * ($unit->conversion_to_kg ?? 1);
        }

        // Jika unit adalah string nama unit
        $unitName = strtolower(trim($unit));

        switch ($unitName) {
            case 'ton':
                return $qty * 1000;
            case 'sak':
                return $qty * 25;
            case 'kg':
                return $qty * 1;
            default:
                // Fallback: coba cari di database
                $unitModel = Unit::where('name', 'LIKE', "%{$unit}%")->first();
                if ($unitModel) {
                    return $qty * ($unitModel->conversion_to_kg ?? 1);
                }
                return $qty; // Default jika tidak dikenali
        }
    }

    /**
     * Konversi dari kg ke unit tertentu
     * 
     * @param float $qtyKg Qty dalam kg
     * @param string|Unit $unit Unit target
     * @return float Qty dalam unit target
     */
    public static function fromKg($qtyKg, $unit)
    {
        // Jika unit adalah object Unit dari database
        if ($unit instanceof Unit) {
            $conversion = $unit->conversion_to_kg ?? 1;
            return $conversion > 0 ? $qtyKg / $conversion : $qtyKg;
        }

        // Jika unit adalah string nama unit
        $unitName = strtolower(trim($unit));

        switch ($unitName) {
            case 'ton':
                return $qtyKg / 1000;
            case 'sak':
                return $qtyKg / 25;
            case 'kg':
                return $qtyKg;
            default:
                // Fallback: coba cari di database
                $unitModel = Unit::where('name', 'LIKE', "%{$unit}%")->first();
                if ($unitModel && $unitModel->conversion_to_kg > 0) {
                    return $qtyKg / $unitModel->conversion_to_kg;
                }
                return $qtyKg; // Default jika tidak dikenali
        }
    }

    /**
     * Konversi kg ke semua unit standar
     * 
     * @param float $qtyKg Qty dalam kg
     * @return array ['ton' => float, 'sak' => float, 'kg' => float]
     */
    public static function convertToAllUnits($qtyKg)
    {
        return [
            'ton' => $qtyKg / 1000,
            'sak' => $qtyKg / 25,
            'kg' => $qtyKg,
        ];
    }

    /**
     * Pecah kg menjadi ton bulat, sak bulat, dan sisa kg
     * 
     * @param float $qtyKg Qty dalam kg
     * @return array ['ton' => int, 'sak' => int, 'kg' => float]
     */
    public static function breakdownKg($qtyKg)
    {
        $ton = floor($qtyKg / 1000);
        $sisaSetelahTon = $qtyKg - ($ton * 1000);

        $sak = floor($sisaSetelahTon / 25);
        $kg = $sisaSetelahTon - ($sak * 25);

        return [
            'ton' => (int) $ton,
            'sak' => (int) $sak,
            'kg' => round($kg, 2),
        ];
    }

    /**
     * Format qty dengan unit untuk display
     * 
     * @param float $qty
     * @param string|Unit $unit
     * @return string
     */
    public static function formatQtyWithUnit($qty, $unit)
    {
        $unitName = $unit instanceof Unit ? $unit->name : $unit;
        return number_format($qty, 2, ',', '.') . ' ' . $unitName;
    }

    /**
     * Validasi apakah unit yang diberikan valid
     * 
     * @param string|Unit $unit
     * @return bool
     */
    public static function isValidUnit($unit)
    {
        if ($unit instanceof Unit) {
            return true;
        }

        $validUnits = ['ton', 'sak', 'kg'];
        return in_array(strtolower(trim($unit)), $validUnits);
    }
}
