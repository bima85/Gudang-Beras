<?php

namespace App\Exports;

use App\Models\TransactionHistory;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TransactionHistoriesExport implements FromCollection, WithHeadings, WithMapping
{
    protected $from;
    protected $to;

    public function __construct($from = null, $to = null)
    {
        $this->from = $from;
        $this->to = $to;
    }

    public function collection()
    {
        $query = TransactionHistory::with(['product', 'warehouse', 'creator'])->orderBy('transaction_date', 'desc');
        if ($this->from) {
            $query->whereDate('transaction_date', '>=', $this->from);
        }
        if ($this->to) {
            $query->whereDate('transaction_date', '<=', $this->to);
        }
        return $query->get();
    }

    public function headings(): array
    {
        return [
            'Tanggal',
            'No. Transaksi',
            'Jenis',
            'Produk',
            'Qty',
            'Satuan',
            'Harga',
            'Subtotal',
            'Gudang',
            'Pihak Terkait',
            'User',
            'Catatan',
        ];
    }

    public function map($row): array
    {
        return [
            $row->transaction_date,
            $row->transaction_number,
            $row->transaction_type,
            $row->product?->name,
            $row->quantity,
            $row->unit,
            $row->price,
            $row->subtotal,
            $row->warehouse?->name,
            $row->related_party,
            $row->creator?->name,
            $row->notes,
        ];
    }
}
