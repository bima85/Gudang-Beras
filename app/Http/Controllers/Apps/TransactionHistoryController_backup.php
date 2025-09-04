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

        $query = TransactionHistory::with(['product', 'warehouse', 'creator'])->orderBy('transaction_date', 'desc');
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
                'to' => $to,
            ],
        ]);
    }

    public function create()
    {
        $products = Product::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        return inertia('Dashboard/TransactionHistories/Create', compact('products', 'warehouses'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'transaction_number' => 'required|string|unique:transaction_histories,transaction_number',
            'transaction_type' => 'required|in:purchase,sale,return,transfer,adjustment',
            'transaction_date' => 'required|date',
            'related_party' => 'nullable|string',
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'price' => 'nullable|numeric',
            'payment_status' => 'nullable|in:unpaid,partial,paid',
            'notes' => 'nullable|string',
        ]);

        // hitung subtotal
        $data['subtotal'] = isset($data['price']) ? ($data['price'] * $data['quantity']) : null;

        // ambil stock_before dari produk (anggap product->stock menyimpan stock dalam unit dasar)
        $product = Product::findOrFail($data['product_id']);
        $stockBefore = $product->stock ?? 0;

        // hitung stock_after bergantung pada transaction_type
        if (in_array($data['transaction_type'], ['purchase', 'return'])) {
            $stockAfter = $stockBefore + $data['quantity'];
        } elseif (in_array($data['transaction_type'], ['sale', 'transfer'])) {
            $stockAfter = $stockBefore - $data['quantity'];
        } else {
            // adjustment: use provided quantity as delta
            $stockAfter = $data['quantity'];
        }

        $data['stock_before'] = $stockBefore;
        $data['stock_after'] = $stockAfter;
        $data['created_by'] = Auth::id();

        $transaction = TransactionHistory::create($data);

        // optionally update product stock when appropriate
        if (in_array($data['transaction_type'], ['purchase', 'return'])) {
            $product->stock = $stockAfter;
            $product->save();
        } elseif (in_array($data['transaction_type'], ['sale', 'transfer'])) {
            $product->stock = max(0, $stockAfter);
            $product->save();
        } elseif ($data['transaction_type'] === 'adjustment') {
            $product->stock = $stockAfter;
            $product->save();
        }

        return redirect()->route('transaction-histories.index')->with('success', 'Transaction recorded.');
    }

    public function edit($id)
    {
        $transaction = TransactionHistory::findOrFail($id);
        $products = Product::select('id', 'name')->get();
        $warehouses = Warehouse::select('id', 'name')->get();
        return inertia('Dashboard/TransactionHistories/Edit', compact('transaction', 'products', 'warehouses'));
    }

    public function update(Request $request, $id)
    {
        $transaction = TransactionHistory::findOrFail($id);

        $data = $request->validate([
            'transaction_type' => 'required|in:purchase,sale,return,transfer,adjustment',
            'transaction_date' => 'required|date',
            'related_party' => 'nullable|string',
            'warehouse_id' => 'required|exists:warehouses,id',
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|numeric',
            'unit' => 'required|string',
            'price' => 'nullable|numeric',
            'payment_status' => 'nullable|in:unpaid,partial,paid',
            'notes' => 'nullable|string',
        ]);

        $data['subtotal'] = isset($data['price']) ? ($data['price'] * $data['quantity']) : null;

        // recalc stock_before/after based on product current stock
        $product = Product::findOrFail($data['product_id']);
        $stockBefore = $product->stock ?? 0;
        if (in_array($data['transaction_type'], ['purchase', 'return'])) {
            $stockAfter = $stockBefore + $data['quantity'];
        } elseif (in_array($data['transaction_type'], ['sale', 'transfer'])) {
            $stockAfter = $stockBefore - $data['quantity'];
        } else {
            $stockAfter = $data['quantity'];
        }

        $data['stock_before'] = $stockBefore;
        $data['stock_after'] = $stockAfter;
        $data['created_by'] = Auth::id();

        $transaction->update($data);

        // update product stock similarly to store
        if (in_array($data['transaction_type'], ['purchase', 'return'])) {
            $product->stock = $stockAfter;
            $product->save();
        } elseif (in_array($data['transaction_type'], ['sale', 'transfer'])) {
            $product->stock = max(0, $stockAfter);
            $product->save();
        } elseif ($data['transaction_type'] === 'adjustment') {
            $product->stock = $stockAfter;
            $product->save();
        }

        return redirect()->route('transaction-histories.index')->with('success', 'Transaction updated.');
    }

    public function destroy($id)
    {
        $transaction = TransactionHistory::findOrFail($id);
        $transaction->delete();
        return redirect()->route('transaction-histories.index')->with('success', 'Transaction deleted.');
    }

    public function exportExcel()
    {
        $from = request()->query('from');
        $to = request()->query('to');
        $fileName = 'transaction_histories_' . date('Ymd_His') . '.xlsx';
        return Excel::download(new TransactionHistoriesExport($from, $to), $fileName);
    }

    public function exportPdf()
    {
        $from = request()->query('from');
        $to = request()->query('to');
        $query = TransactionHistory::with(['product', 'warehouse', 'creator'])->orderBy('transaction_date', 'desc');
        if ($from) $query->whereDate('transaction_date', '>=', $from);
        if ($to) $query->whereDate('transaction_date', '<=', $to);
        $transactions = $query->get();
        $pdf = Pdf::loadView('exports.transaction_histories_pdf', compact('transactions'));
        $fileName = 'transaction_histories_' . date('Ymd_His') . '.pdf';
        return $pdf->download($fileName);
    }
}
