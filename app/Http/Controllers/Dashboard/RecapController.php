<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;

class RecapController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');
        $query = Transaction::with(['cashier', 'customer', 'details.product.category']);
        if ($start && $end) {
            $query->whereDate('created_at', '>=', $start)
                  ->whereDate('created_at', '<=', $end);
        }
        $transactions = $query->orderByDesc('created_at')->paginate(20)->withQueryString();
        $totalCash = $transactions->where('payment_method', 'cash')->sum('grand_total');
        $totalTempo = $transactions->where('payment_method', 'tempo')->sum('grand_total');
        $totalDeposit = $transactions->where('is_deposit', true)->sum('deposit_amount');
        $totalPenjualan = $transactions->sum('grand_total');
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
            'totalCash' => $totalCash,
            'totalTempo' => $totalTempo,
            'totalDeposit' => $totalDeposit,
            'totalPenjualan' => $totalPenjualan,
            'balancing' => $balancing,
            'start_date' => $start,
            'end_date' => $end,
            'kategoriProduk' => $kategoriProduk,
        ]);
    }
}
