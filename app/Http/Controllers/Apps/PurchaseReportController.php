<?php

namespace App\Http\Controllers\Apps;

use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\PurchaseItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;

class PurchaseReportController extends Controller
{
    public function index(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('reports-access')) {
            abort(403, 'Unauthorized');
        }

        // dd($request->all());
        $filters = $request->only(['supplier_id', 'date_from', 'date_to', 'product_id']);
        $query = Purchase::with([
            'supplier',
            'warehouse',
            'toko',
            'items.product',
            'items.category',
            'items.subcategory',
            'items.unit',
        ])
            ->when($filters['supplier_id'] ?? null, fn($q, $v) => $q->where('supplier_id', $v))
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['product_id'] ?? null, fn($q, $v) => $q->whereHas('items', fn($qq) => $qq->where('product_id', $v)));
        $purchases = $query->latest()->paginate(15)->withQueryString();

        // Debug: Check if toko data is loaded
        if ($purchases->count() > 0) {
            $firstPurchase = $purchases->first();
            error_log("=== PURCHASE DEBUG ===");
            error_log("Purchase ID: " . $firstPurchase->id);
            error_log("Toko ID: " . $firstPurchase->toko_id);
            error_log("Toko relation loaded: " . ($firstPurchase->relationLoaded('toko') ? 'YES' : 'NO'));
            if ($firstPurchase->toko) {
                error_log("Toko name: " . $firstPurchase->toko->name);
            } else {
                error_log("Toko is NULL");
            }
        }

        $suppliers = Supplier::select('id', 'name')->orderBy('name')->get();
        $products = Product::select('id', 'name')->orderBy('name')->get();
        return Inertia::render('Dashboard/PurchaseReport/Index', [
            'purchases' => $purchases,
            'suppliers' => $suppliers,
            'products' => $products,
            'filters' => $filters,
        ]);
    }

    public function exportPdf(Request $request)
    {
        // Check permission
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('reports-export')) {
            abort(403, 'Unauthorized');
        }

        $filters = $request->only(['supplier_id', 'date_from', 'date_to', 'product_id']);
        $query = Purchase::with([
            'supplier',
            'warehouse',
            'toko',
            'items.product',
            'items.category',
            'items.subcategory',
            'items.unit',
        ])
            ->when($filters['supplier_id'] ?? null, fn($q, $v) => $q->where('supplier_id', $v))
            ->when($filters['date_from'] ?? null, fn($q, $v) => $q->whereDate('created_at', '>=', $v))
            ->when($filters['date_to'] ?? null, fn($q, $v) => $q->whereDate('created_at', '<=', $v))
            ->when($filters['product_id'] ?? null, fn($q, $v) => $q->whereHas('items', fn($qq) => $qq->where('product_id', $v)));
        $purchases = $query->get();

        $pdf = Pdf::loadView('exports.purchase_report_pdf', compact('purchases'));
        return $pdf->download('laporan-pembelian.pdf');
    }

    public function exportExcel(Request $request)
    {
        // Dummy Excel export, replace with real Excel logic
        return response('Export Excel belum diimplementasi', 501);
    }
}
