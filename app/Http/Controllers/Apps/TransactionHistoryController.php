<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\TransactionHistory;
use App\Models\Product;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Exports\TransactionHistoriesExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;

class TransactionHistoryController extends Controller
{
    public function index(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $from = $request->query('from');
        $to = $request->query('to');

        $query = TransactionHistory::with([
            'product.category',
            'product.subcategory',
            'warehouse',
            'toko',
            'creator'
        ])->orderBy('transaction_date', 'desc');
        if ($from) {
            $query->whereDate('transaction_date', '>=', $from);
        }
        if ($to) {
            $query->whereDate('transaction_date', '<=', $to);
        }

        $transactions = $query->paginate(15)->appends($request->only(['from', 'to']));

        return inertia('Dashboard/TransactionHistories/Index', [
            'transactions' => $transactions,
            'filters' => [
                'from' => $from,
                'to' => $to
            ],
            'tokos' => \App\Models\Toko::select('id', 'name')->get()
        ]);
    }

    public function show($id)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $transaction = TransactionHistory::with([
            'product.category',
            'product.subcategory',
            'warehouse',
            'toko',
            'creator'
        ])->findOrFail($id);

        return inertia('Dashboard/TransactionHistories/Show', [
            'transaction' => $transaction
        ]);
    }

    public function create()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $products = Product::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        $tokos = \App\Models\Toko::select('id', 'name')->get();
        return inertia('Dashboard/TransactionHistories/Create', compact('products', 'warehouses', 'tokos'));
    }

    public function store(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'toko_id' => 'required|exists:tokos,id',
            'transaction_type' => 'required|in:purchase,sale,return,transfer,adjustment',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'transaction_date' => 'required|date',
            'transaction_number' => 'nullable|string',
            'related_party' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        try {
            TransactionHistory::create([
                'product_id' => $request->product_id,
                'toko_id' => $request->toko_id,
                'transaction_type' => $request->transaction_type,
                'quantity' => $request->quantity,
                'unit' => $request->unit,
                'price' => $request->price,
                'transaction_date' => $request->transaction_date,
                'transaction_number' => $request->transaction_number,
                'related_party' => $request->related_party,
                'notes' => $request->notes,
                'created_by' => Auth::id()
            ]);

            return redirect()->route('transaction-histories.index')
                ->with('success', 'Transaction history created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create transaction history: ' . $e->getMessage()]);
        }
    }

    public function edit($id)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $transaction = TransactionHistory::findOrFail($id);
        $products = Product::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        $tokos = \App\Models\Toko::select('id', 'name')->get();
        return inertia('Dashboard/TransactionHistories/Edit', compact('transaction', 'products', 'warehouses', 'tokos'));
    }

    public function update(Request $request, $id)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $transaction = TransactionHistory::findOrFail($id);

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'toko_id' => 'required|exists:tokos,id',
            'transaction_type' => 'required|in:purchase,sale,return,transfer,adjustment',
            'quantity' => 'required|numeric|min:0',
            'unit' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'transaction_date' => 'required|date',
            'transaction_number' => 'nullable|string',
            'related_party' => 'nullable|string',
            'notes' => 'nullable|string'
        ]);

        try {
            $transaction->update([
                'product_id' => $request->product_id,
                'toko_id' => $request->toko_id,
                'transaction_type' => $request->transaction_type,
                'quantity' => $request->quantity,
                'unit' => $request->unit,
                'price' => $request->price,
                'transaction_date' => $request->transaction_date,
                'transaction_number' => $request->transaction_number,
                'related_party' => $request->related_party,
                'notes' => $request->notes
            ]);

            return redirect()->route('transaction-histories.index')
                ->with('success', 'Transaction history updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update transaction history: ' . $e->getMessage()]);
        }
    }

    public function destroy($id)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        try {
            $transaction = TransactionHistory::findOrFail($id);
            $transaction->delete();

            return redirect()->route('transaction-histories.index')
                ->with('success', 'Transaction history deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete transaction history']);
        }
    }

    public function exportExcel()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $transactions = TransactionHistory::with(['product', 'warehouse', 'creator'])->get();
        return Excel::download(new TransactionHistoriesExport($transactions), 'transaction-histories.xlsx');
    }

    public function exportPdf()
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('transactions-access')) {
            abort(403, 'Unauthorized');
        }

        $transactions = TransactionHistory::with(['product', 'warehouse', 'creator'])->get();
        $pdf = Pdf::loadView('exports.transaction_histories_pdf', compact('transactions'));
        return $pdf->download('transaction-histories.pdf');
    }
}
