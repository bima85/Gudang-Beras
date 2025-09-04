<?php

namespace App\Exports;

use App\Models\Purchase;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class PurchaseExport implements FromCollection, WithHeadings
{
    /**
     * Mengembalikan data pembelian untuk diekspor ke Excel.
     *
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        $purchases = Purchase::with([
            'supplier',
            'warehouse',
            'items.product',
            'items.unit',
            'items.category',
            'items.subcategory'
        ])->latest()->get();

        return $purchases->flatMap(function ($purchase) {
            return $purchase->items->map(function ($item) use ($purchase) {
                return [
                    'Tanggal' => $purchase->purchase_date,
                    'Supplier' => $purchase->supplier->name ?? '-',
                    'Gudang' => $purchase->warehouse->name ?? '-',
                    'Produk' => $item->product->name ?? '-',
                    'Kuantitas' => $item->qty,
                    'Kuli Fee' => $item->kuli_fee,
                    'Timbangan' => $item->timbangan,
                    'Satuan' => $item->unit->name ?? '-',
                    'Harga' => $item->harga_pembelian,
                    'Subtotal' => $item->subtotal,
                ];
            });
        });
    }

    /**
     * Menentukan header kolom untuk file Excel.
     *
     * @return array
     */
    public function headings(): array
    {
        return [
            'Tanggal',
            'Supplier',
            'Gudang',
            'Produk',
            'Kuantitas',
            'Kuli Fee',
            'Timbangan',
            'Satuan',
            'Harga',
            'Subtotal',
        ];
    }
}
