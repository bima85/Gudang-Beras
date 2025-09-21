<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Subcategory;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Collection;
use Barryvdh\DomPDF\Facade\Pdf as PDF;

class RecapController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        // Query transaksi penjualan dengan timezone Asia/Jakarta
        $query = Transaction::with(['cashier', 'customer', 'details.product.categoryRelation']);
        if ($start && $end) {
            $startDate = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay()->utc();
            $endDate = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay()->utc();

            $query->whereBetween('created_at', [
                $startDate->format('Y-m-d H:i:s'),
                $endDate->format('Y-m-d H:i:s')
            ]);
        }
        $transactions = $query->orderByDesc('created_at')->paginate(20)->withQueryString();

        // Query pembelian untuk periode yang sama dengan timezone Asia/Jakarta
        $purchaseQuery = Purchase::with(['supplier', 'warehouse', 'toko', 'items.product.categoryRelation', 'items.product.subcategory']);
        if ($start && $end) {
            $startDate = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay()->utc();
            $endDate = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay()->utc();

            $purchaseQuery->whereBetween('purchase_date', [
                $startDate->format('Y-m-d H:i:s'),
                $endDate->format('Y-m-d H:i:s')
            ]);
        }
        $purchases = $purchaseQuery->orderByDesc('purchase_date')->get();

        // Hitung total penjualan
        $totalPenjualan = $transactions->sum('grand_total');
        $totalCash = $transactions->where('payment_method', 'cash')->sum('grand_total');
        $totalTempo = $transactions->where('payment_method', 'tempo')->sum('grand_total');
        $totalDeposit = $transactions->where('is_deposit', true)->sum('deposit_amount');

        // Hitung total pembelian/HPP
        $totalPembelian = 0;
        foreach ($purchases as $purchase) {
            foreach ($purchase->items as $item) {
                $totalPembelian += $item->qty * $item->harga_pembelian;
            }
        }

        // Hitung laba rugi
        $labaKotor = $totalPenjualan - $totalPembelian;
        $persentaseLaba = $totalPenjualan > 0 ? ($labaKotor / $totalPenjualan) * 100 : 0;

        // Balancing check
        $balancing = ($totalCash + $totalDeposit + $totalTempo) === $totalPenjualan;

        // Kategori produk realtime: hitung jumlah produk per kategori dari transaksi yang ditampilkan
        $kategoriProduk = [];
        foreach ($transactions as $trx) {
            foreach ($trx->details as $detail) {
                $cat = $detail->product->categoryRelation->name ?? '-';
                if (!isset($kategoriProduk[$cat])) $kategoriProduk[$cat] = 0;
                $kategoriProduk[$cat] += $detail->qty;
            }
        }

        // Load all categories, subcategories, and products
        $categories = Category::with('products')->get();
        $subcategories = Subcategory::with('products')->get();
        $products = Product::with(['categoryRelation', 'subcategory'])->get();

        return inertia('Dashboard/Reports/Recap', [
            'transactions' => $transactions,
            'purchases' => $purchases,
            'totalCash' => $totalCash,
            'totalTempo' => $totalTempo,
            'totalDeposit' => $totalDeposit,
            'totalPenjualan' => $totalPenjualan,
            'totalPembelian' => $totalPembelian,
            'labaKotor' => $labaKotor,
            'persentaseLaba' => $persentaseLaba,
            'balancing' => $balancing,
            'start_date' => $start,
            'end_date' => $end,
            'kategoriProduk' => $kategoriProduk,
            'categories' => $categories,
            'subcategories' => $subcategories,
            'products' => $products,
        ]);
    }

    /**
     * Export recap transactions to Excel
     */
    public function exportExcel(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        $query = Transaction::with(['cashier', 'customer', 'details.product']);
        if ($start && $end) {
            $startDate = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay()->utc();
            $endDate = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay()->utc();
            $query->whereBetween('created_at', [$startDate->format('Y-m-d H:i:s'), $endDate->format('Y-m-d H:i:s')]);
        }
        $transactions = $query->orderByDesc('created_at')->get();

        $rows = [];
        foreach ($transactions as $trx) {
            // compute HPP per transaction by summing purchase_price * qty from details.product.purchase_price
            $cost = 0;
            foreach ($trx->details as $d) {
                $purchasePrice = $d->product->purchase_price ?? 0;
                $cost += ($purchasePrice * $d->qty);
            }
            $profit = $trx->grand_total - $cost;
            $rows[] = [
                'Tanggal' => $trx->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                'Invoice' => $trx->invoice_number ?? $trx->id,
                'Kasir' => $trx->cashier->name ?? '-',
                'Pelanggan' => $trx->customer->name ?? '-',
                'Total' => $trx->grand_total,
                'HPP' => $cost,
                'Profit' => $profit,
                'Metode' => $trx->payment_method,
            ];
        }

        $export = new class($rows) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings {
            protected $rows;
            public function __construct($rows)
            {
                $this->rows = $rows;
            }
            public function collection()
            {
                return new Collection($this->rows);
            }
            public function headings(): array
            {
                return array_keys($this->rows[0] ?? []);
            }
        };
        // Use raw to avoid BinaryFileResponse which triggers mime-type guessing
        $content = Excel::raw($export, \Maatwebsite\Excel\Excel::XLSX);
        return response($content, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="rekap-transaksi.xlsx"',
        ]);
    }

    /**
     * Export recap transactions to PDF
     */
    public function exportPdf(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        $query = Transaction::with(['cashier', 'customer', 'details.product']);
        if ($start && $end) {
            $startDate = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay()->utc();
            $endDate = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay()->utc();
            $query->whereBetween('created_at', [$startDate->format('Y-m-d H:i:s'), $endDate->format('Y-m-d H:i:s')]);
        }
        $transactions = $query->orderByDesc('created_at')->get();

        $rows = [];
        foreach ($transactions as $trx) {
            $cost = 0;
            foreach ($trx->details as $d) {
                $purchasePrice = $d->product->purchase_price ?? 0;
                $cost += ($purchasePrice * $d->qty);
            }
            $profit = $trx->grand_total - $cost;
            $rows[] = [
                'tanggal' => $trx->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                'invoice' => $trx->invoice_number ?? $trx->id,
                'kasir' => $trx->cashier->name ?? '-',
                'pelanggan' => $trx->customer->name ?? '-',
                'total' => $trx->grand_total,
                'hpp' => $cost,
                'profit' => $profit,
                'metode' => $trx->payment_method,
            ];
        }

        $pdf = PDF::loadView('exports.recap_transactions_pdf', ['rows' => $rows, 'start' => $start, 'end' => $end]);
        $content = $pdf->output();
        return response($content, 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="rekap-transaksi.pdf"',
        ]);
    }
}
