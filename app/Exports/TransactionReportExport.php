<?php

namespace App\Exports;

use App\Models\Transaction;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class TransactionReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $transactions;
    protected $filters;

    public function __construct($transactions, $filters = [])
    {
        $this->transactions = $transactions;
        $this->filters = $filters;
    }

    /**
     * @return \Illuminate\Support\Collection
     */
    public function collection()
    {
        return $this->transactions;
    }

    /**
     * @return string
     */
    public function title(): string
    {
        return 'Laporan Transaksi';
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'No. Transaksi',
            'Kasir',
            'Pelanggan',
            'Metode Pembayaran',
            'Diskon',
            'Kembalian',
            'Total',
            'Detail Produk'
        ];
    }

    /**
     * @param mixed $transaction
     * @return array
     */
    public function map($transaction): array
    {
        $no = $this->getRowNumber($transaction);

        // Format detail produk
        $productDetails = '';
        if ($transaction->details && $transaction->details->count() > 0) {
            foreach ($transaction->details as $index => $detail) {
                if ($index > 0) $productDetails .= "\n";
                $productDetails .= sprintf(
                    "%s (Qty: %s %s) - Rp %s",
                    $detail->product?->name ?? '-',
                    $detail->qty ?? '-',
                    $detail->unit?->name ?? '-',
                    number_format($detail->subtotal ?? 0, 0, ',', '.')
                );
            }
        }

        return [
            $no,
            \Carbon\Carbon::parse($transaction->created_at)->timezone('Asia/Jakarta')->format('d/m/Y H:i:s'),
            $transaction->transaction_number ?? $transaction->invoice ?? $transaction->no_urut ?? '-',
            $transaction->cashier?->name ?? '-',
            $transaction->customer?->name ?? '-',
            $this->formatPaymentMethod($transaction->payment_method),
            'Rp ' . number_format($transaction->discount ?? 0, 0, ',', '.'),
            'Rp ' . number_format($transaction->change ?? 0, 0, ',', '.'),
            'Rp ' . number_format($transaction->grand_total ?? 0, 0, ',', '.'),
            $productDetails
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        $transactionCount = $this->transactions ? $this->transactions->count() : 0;
        $lastRow = $transactionCount + 1;

        return [
            // Header style
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F81BD'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ],

            // Data rows
            'A2:J' . $lastRow => [
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['rgb' => '000000'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_TOP,
                ],
            ],
        ];
    }

    /**
     * Helper method to get row number
     */
    private function getRowNumber($transaction)
    {
        static $counter = 0;
        return ++$counter;
    }

    /**
     * Helper method to format payment method
     */
    private function formatPaymentMethod($method)
    {
        switch ($method) {
            case 'cash':
                return 'Cash';
            case 'tempo':
                return 'Tempo';
            case 'deposit':
                return 'Deposit';
            default:
                return '-';
        }
    }
}
