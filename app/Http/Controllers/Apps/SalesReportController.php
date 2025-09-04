<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\Transaction;
use App\Models\TransactionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class SalesReportController extends Controller
{
    /**
     * Display sales report
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $filters = $request->only(['date_from', 'date_to', 'customer_id', 'product_id', 'warehouse_id']);

        // Get sales data from transactions and transaction history
        $salesData = $this->getSalesData($filters);
        $salesSummary = $this->getSalesSummary($filters);

        $customers = \App\Models\Customer::get(['id', 'name']);
        $products = \App\Models\Product::select('id', 'name', 'barcode')->get();
        $warehouses = \App\Models\Warehouse::get(['id', 'name']);

        return Inertia::render('Dashboard/SalesReport/Index', [
            'salesData' => $salesData,
            'salesSummary' => $salesSummary,
            'customers' => $customers,
            'products' => $products,
            'warehouses' => $warehouses,
            'filters' => $filters,
        ]);
    }

    /**
     * Get detailed sales data
     */
    private function getSalesData($filters = [])
    {
        $query = Transaction::with(['customer', 'details.product', 'details.unit'])
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['customer_id'] ?? null, fn($q, $v) => $q->where('customer_id', $v))
            ->when($filters['warehouse_id'] ?? null, fn($q, $v) => $q->where('warehouse_id', $v));

        if ($filters['product_id'] ?? null) {
            $query->whereHas('details', fn($q) => $q->where('product_id', $filters['product_id']));
        }

        return $query->orderBy('created_at', 'desc')->paginate(20);
    }

    /**
     * Get sales summary
     */
    private function getSalesSummary($filters = [])
    {
        $query = TransactionHistory::where('transaction_type', 'sale')
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->whereDate('transaction_date', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->whereDate('transaction_date', '<=', $v))
            ->when($filters['product_id'] ?? null, fn($q, $v) => $q->where('product_id', $v))
            ->when($filters['warehouse_id'] ?? null, fn($q, $v) => $q->where('warehouse_id', $v));

        $summary = $query->selectRaw('
            COUNT(*) as total_transactions,
            SUM(quantity) as total_quantity,
            SUM(subtotal) as total_amount,
            AVG(subtotal) as avg_transaction_value
        ')->first();

        // Top selling products
        $topProducts = $query->clone()
            ->select('product_id', DB::raw('SUM(quantity) as total_qty'), DB::raw('SUM(subtotal) as total_sales'))
            ->with('product')
            ->groupBy('product_id')
            ->orderBy('total_sales', 'desc')
            ->limit(10)
            ->get();

        // Daily sales trend
        $dailyTrend = $query->clone()
            ->selectRaw('DATE(transaction_date) as date, SUM(subtotal) as daily_sales, COUNT(*) as daily_transactions')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        return [
            'summary' => $summary,
            'top_products' => $topProducts,
            'daily_trend' => $dailyTrend,
        ];
    }

    /**
     * Export sales report
     */
    public function export(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            abort(403, 'Unauthorized');
        }

        $filters = $request->only(['date_from', 'date_to', 'customer_id', 'product_id', 'warehouse_id']);
        $format = $request->get('format', 'pdf');

        $salesData = $this->getSalesData($filters);
        $salesSummary = $this->getSalesSummary($filters);

        if ($format === 'pdf') {
            $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.sales-report', compact('salesData', 'salesSummary'));
            return $pdf->download('laporan-penjualan.pdf');
        } else {
            return response()->json([
                'message' => 'Excel export not implemented yet',
                'data' => $salesData
            ]);
        }
    }
}
