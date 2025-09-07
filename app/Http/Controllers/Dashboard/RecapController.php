<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use Illuminate\Http\Request;

class RecapController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        // Query transaksi penjualan dengan timezone Asia/Jakarta
        $query = Transaction::with(['cashier', 'customer', 'details.product.category']);
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
        $purchaseQuery = Purchase::with(['supplier', 'items.product.category']);
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
                $totalPembelian += $item->quantity * $item->unit_price;
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
                $cat = $detail->product->category->name ?? '-';
                if (!isset($kategoriProduk[$cat])) $kategoriProduk[$cat] = 0;
                $kategoriProduk[$cat] += $detail->qty;
            }
        }

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
        ]);
    }
}
