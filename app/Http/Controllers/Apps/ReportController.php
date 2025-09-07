<?php

namespace App\Http\Controllers\Apps;

use App\Models\Transaction;
use App\Models\User;
use App\Models\Customer;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Display the transaction report page.
     *
     * @param  Request  $request
     * @return \Inertia\Response
     */
    public function transactions(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('reports.transactions')) {
            abort(403, 'Unauthorized');
        }

        $query = Transaction::with([
            'cashier',
            'customer',
            'details.product.category',
            'details.product.subcategory',
            'details.unit'
        ]);

        // Filter by date range - use Asia/Jakarta timezone
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $dateFrom = \Carbon\Carbon::parse($request->date_from, 'Asia/Jakarta')->startOfDay();
            $dateTo = \Carbon\Carbon::parse($request->date_to, 'Asia/Jakarta')->endOfDay();

            $query->whereBetween('created_at', [
                $dateFrom->utc()->format('Y-m-d H:i:s'),
                $dateTo->utc()->format('Y-m-d H:i:s')
            ]);
        }

        // Filter by cashier
        if ($request->filled('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }

        // Filter by customer
        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Filter by warehouse
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        // Search by transaction number
        if ($request->filled('search')) {
            $query->where('transaction_number', 'like', '%' . $request->search . '%');
        }

        $transactions = $query->latest()->paginate(15)->withQueryString();

        $cashiers = User::select('id', 'name')->get();
        $customers = Customer::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();

        return Inertia::render('Dashboard/Reports/TransactionsShadcn', [
            'transactions' => $transactions,
            'cashiers' => $cashiers,
            'customers' => $customers,
            'warehouses' => $warehouses,
            'filters' => $request->only(['date_from', 'date_to', 'cashier_id', 'customer_id', 'warehouse_id', 'search'])
        ]);
    }

    /**
     * Export transaction report
     */
    public function exportTransactions(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('reports-export')) {
            abort(403, 'Unauthorized');
        }

        // Implementation for export functionality
        // This would typically generate Excel/PDF export
        return response()->json(['message' => 'Export functionality to be implemented']);
    }

    /**
     * Delete a transaction
     */
    public function deleteTransaction($id)
    {
        try {
            $transaction = Transaction::findOrFail($id);

            // Check if user has permission to delete transactions
            $user = Auth::user();
            if (! $user || ! $user->hasPermissionTo('transactions-delete')) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            // Delete transaction
            $transaction->delete();

            return response()->json(['success' => true, 'message' => 'Transaksi berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menghapus transaksi'], 500);
        }
    }

    /**
     * Export transaction report to PDF
     */
    public function exportPdf(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('reports-export')) {
            abort(403, 'Unauthorized');
        }

        $query = Transaction::with([
            'cashier',
            'customer',
            'details.product.category',
            'details.product.subcategory',
            'details.unit'
        ]);

        // Apply same filters as in transactions method
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                $request->date_from . ' 00:00:00',
                $request->date_to . ' 23:59:59'
            ]);
        }

        if ($request->filled('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        $transactions = $query->latest()->get();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('exports.transaction_report_pdf', compact('transactions'));
        return $pdf->download('laporan-transaksi-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Export transaction report to Excel
     */
    public function exportExcel(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('reports-export')) {
            abort(403, 'Unauthorized');
        }

        $query = Transaction::with([
            'cashier',
            'customer',
            'details.product.category',
            'details.product.subcategory',
            'details.unit'
        ]);

        // Apply same filters as in transactions method
        if ($request->filled('date_from') && $request->filled('date_to')) {
            $query->whereBetween('created_at', [
                $request->date_from . ' 00:00:00',
                $request->date_to . ' 23:59:59'
            ]);
        }

        if ($request->filled('cashier_id')) {
            $query->where('cashier_id', $request->cashier_id);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        $transactions = $query->latest()->get();
        $filters = $request->only(['date_from', 'date_to', 'cashier_id', 'customer_id', 'warehouse_id']);

        return Excel::download(
            new \App\Exports\TransactionReportExport($transactions, $filters),
            'laporan-transaksi-' . date('Y-m-d-H-i-s') . '.xlsx'
        );
    }
}
