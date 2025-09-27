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
use App\Services\PricingService;

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
        $type = $request->query('type');
        $locationId = $request->query('location_id');
        $locationType = $request->query('location_type');

        // Eager-load category/subcategory for both the history product and any linked transaction details
        $query = TransactionHistory::with([
            'product.category',
            'product.subcategory',
            'warehouse',
            'toko',
            'creator',
            // ensure nested products include category and subcategory
            'transaction.details.product.category',
            'transaction.details.product.subcategory',
            'transaction.details.unit'
        ])->orderBy('transaction_date', 'desc')->orderBy('transaction_time', 'desc');

        if ($from) {
            $fromDate = \Carbon\Carbon::parse($from, 'Asia/Jakarta')->startOfDay()->utc();
            $query->where('transaction_date', '>=', $fromDate->format('Y-m-d'));
        }
        if ($to) {
            $toDate = \Carbon\Carbon::parse($to, 'Asia/Jakarta')->endOfDay()->utc();
            $query->where('transaction_date', '<=', $toDate->format('Y-m-d'));
        }
        if ($locationId && $locationType) {
            if ($locationType === 'warehouse') {
                $query->where('warehouse_id', $locationId);
            } elseif ($locationType === 'toko') {
                $query->where('toko_id', $locationId);
            }
        }

        if ($type) {
            $query->where('transaction_type', $type);
        }

        $perPage = $request->query('per_page', 15);
        $transactions = $query->paginate($perPage)->appends($request->only(['from', 'to', 'location_id', 'location_type', 'per_page', 'type']));

        // Normalize/attach local datetime fields and ensure nested product/category/subcategory are present
        $transactions->getCollection()->transform(function ($th) {
            // attach a best-effort local datetime (Asia/Jakarta)
            try {
                if (isset($th->transaction) && $th->transaction && isset($th->transaction->created_at)) {
                    // prefer the authoritative Transaction.created_at when available
                    $localDt = \Carbon\Carbon::parse($th->transaction->created_at)->setTimezone('Asia/Jakarta');
                } else {
                    // fall back to transaction_date + transaction_time stored on the history
                    $date = $th->transaction_date ?? null;
                    $time = $th->transaction_time ?? null;
                    if ($date && $time) {
                        // try to parse combined datetime in Asia/Jakarta
                        $combined = $date . ' ' . $time;
                        $localDt = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $combined, 'Asia/Jakarta');
                    } elseif ($date) {
                        $localDt = \Carbon\Carbon::parse($date, 'Asia/Jakarta')->startOfDay();
                    } else {
                        $localDt = null;
                    }
                }
            } catch (\Exception $e) {
                $localDt = null;
            }

            $th->transaction_datetime_local = $localDt ? $localDt->format('Y-m-d H:i:s') : null;
            $th->transaction_datetime_iso = $localDt ? $localDt->toIso8601String() : null;
            $th->transaction_date_local = $localDt ? $localDt->toDateString() : ($th->transaction_date ?? null);
            $th->transaction_time_local = $localDt ? $localDt->format('H:i:s') : ($th->transaction_time ?? null);

            // Ensure product relation includes category & subcategory attributes (already eager-loaded where possible)
            if (isset($th->product) && $th->product) {
                $th->product->category = $th->product->category ?? null;
                $th->product->subcategory = $th->product->subcategory ?? null;
            }

            // Ensure transaction details' product objects include category & subcategory
            if (isset($th->transaction) && isset($th->transaction->details) && is_iterable($th->transaction->details)) {
                foreach ($th->transaction->details as $d) {
                    if (isset($d->product) && $d->product) {
                        $d->product->category = $d->product->category ?? null;
                        $d->product->subcategory = $d->product->subcategory ?? null;
                    }
                    // Attach harga_beli for each detail
                    try {
                        $defaultPurchase = $d->product->purchase_price ?? $d->harga_pembelian ?? $d->purchase_price ?? 0;
                        $trxDateLocal = $localDt ? $localDt->toDateString() : ($th->transaction_date ?? null);
                        $d->harga_beli = PricingService::getPurchasePrice($d->product_id ?? null, $trxDateLocal, $defaultPurchase);
                    } catch (\Exception $e) {
                        $d->harga_beli = $d->harga_pembelian ?? ($d->purchase_price ?? 0);
                    }
                }
            }

            // Attach harga_beli for the history's direct product (if any)
            if (isset($th->product) && $th->product) {
                try {
                    $default = $th->product->purchase_price ?? 0;
                    $dt = $localDt ? $localDt->toDateString() : ($th->transaction_date ?? null);
                    $th->harga_beli = PricingService::getPurchasePrice($th->product_id ?? null, $dt, $default);
                } catch (\Exception $e) {
                    $th->harga_beli = $th->product->purchase_price ?? 0;
                }
            }

            return $th;
        });

        // Check if this is an AJAX request
        if ($request->ajax() || $request->wantsJson()) {
            // Generate pagination links array manually
            $links = [];
            $currentPage = $transactions->currentPage();
            $lastPage = $transactions->lastPage();
            $baseUrl = $request->url();

            // Previous link
            if ($currentPage > 1) {
                $links[] = [
                    'url' => $baseUrl . '?' . http_build_query(array_merge($request->query(), ['page' => $currentPage - 1])),
                    'label' => '&laquo; Previous',
                    'active' => false
                ];
            } else {
                $links[] = [
                    'url' => null,
                    'label' => '&laquo; Previous',
                    'active' => false
                ];
            }

            // Page links
            for ($page = max(1, $currentPage - 2); $page <= min($lastPage, $currentPage + 2); $page++) {
                $links[] = [
                    'url' => $baseUrl . '?' . http_build_query(array_merge($request->query(), ['page' => $page])),
                    'label' => (string) $page,
                    'active' => $page === $currentPage
                ];
            }

            // Next link
            if ($currentPage < $lastPage) {
                $links[] = [
                    'url' => $baseUrl . '?' . http_build_query(array_merge($request->query(), ['page' => $currentPage + 1])),
                    'label' => 'Next &raquo;',
                    'active' => false
                ];
            } else {
                $links[] = [
                    'url' => null,
                    'label' => 'Next &raquo;',
                    'active' => false
                ];
            }

            return response()->json([
                'data' => $transactions->items(),
                'links' => $links,
                'current_page' => $transactions->currentPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
                'from' => $transactions->firstItem(),
                'to' => $transactions->lastItem(),
                'last_page' => $transactions->lastPage(),
            ]);
        }

        return inertia('Dashboard/TransactionHistories/Index', [
            'transactions' => $transactions,
            'filters' => [
                'from' => $from,
                'to' => $to,
                'location_id' => $locationId,
                'location_type' => $locationType,
                'type' => $type
            ],
            'tokos' => \App\Models\Toko::select('id', 'name')->get(),
            'warehouses' => \App\Models\Warehouse::select('id', 'name')->get()
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
            'creator',
            'transaction.details.product.category',
            'transaction.details.product.subcategory',
            'transaction.details.unit',
            'transaction'
        ])->findOrFail($id);

        // Attach local datetime fields for consistency with index
        try {
            if (isset($transaction->transaction) && $transaction->transaction && isset($transaction->transaction->created_at)) {
                $localDt = \Carbon\Carbon::parse($transaction->transaction->created_at)->setTimezone('Asia/Jakarta');
            } else {
                $date = $transaction->transaction_date ?? null;
                $time = $transaction->transaction_time ?? null;
                if ($date && $time) {
                    $combined = $date . ' ' . $time;
                    $localDt = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $combined, 'Asia/Jakarta');
                } elseif ($date) {
                    $localDt = \Carbon\Carbon::parse($date, 'Asia/Jakarta')->startOfDay();
                } else {
                    $localDt = null;
                }
            }
        } catch (\Exception $e) {
            $localDt = null;
        }

        $transaction->transaction_datetime_local = $localDt ? $localDt->format('Y-m-d H:i:s') : null;
        $transaction->transaction_date_local = $localDt ? $localDt->toDateString() : ($transaction->transaction_date ?? null);
        $transaction->transaction_time_local = $localDt ? $localDt->format('H:i:s') : ($transaction->transaction_time ?? null);

        // Ensure product/category/subcategory exist on nested details
        if (isset($transaction->transaction) && isset($transaction->transaction->details) && is_iterable($transaction->transaction->details)) {
            foreach ($transaction->transaction->details as $d) {
                if (isset($d->product) && $d->product) {
                    $d->product->category = $d->product->category ?? null;
                    $d->product->subcategory = $d->product->subcategory ?? null;
                }
                // attach harga_beli for detail rows (use PricingService)
                try {
                    $default = $d->product->purchase_price ?? $d->harga_pembelian ?? $d->purchase_price ?? 0;
                    $dt = $localDt ? $localDt->toDateString() : ($transaction->transaction_date ?? null);
                    $d->harga_beli = PricingService::getPurchasePrice($d->product_id ?? null, $dt, $default);
                } catch (\Exception $e) {
                    $d->harga_beli = $d->harga_pembelian ?? ($d->purchase_price ?? 0);
                }
            }
        }

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

        // include category & subcategory to help frontend filter/select
        $products = Product::select('id', 'name', 'category_id', 'subcategory_id')
            ->with(['category:id,name', 'subcategory:id,name'])
            ->get();
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
            'transtrack' => 'nullable|string',
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
                'transtrack' => $request->transtrack,
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
        // include category & subcategory to help frontend filter/select
        $products = Product::select('id', 'name', 'category_id', 'subcategory_id')
            ->with(['category:id,name', 'subcategory:id,name'])
            ->get();
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
            'transtrack' => 'nullable|string',
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
                'transtrack' => $request->transtrack,
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
