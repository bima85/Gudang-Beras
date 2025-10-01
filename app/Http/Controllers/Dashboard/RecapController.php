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
use Illuminate\Support\Facades\DB;
use Barryvdh\DomPDF\Facade\Pdf as PDF;
use App\Services\PricingService;

class RecapController extends Controller
{
    public function index(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        // Limit period to a maximum number of days to avoid heavy queries
        $maxDays = 90; // configurable limit
        $periodLimited = false;
        $effectiveStartLocal = null; // Carbon in Asia/Jakarta
        $effectiveEndLocal = null; // Carbon in Asia/Jakarta

        if ($start && $end) {
            $startLocal = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay();
            $endLocal = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay();

            $days = $startLocal->diffInDays($endLocal) + 1;
            if ($days > $maxDays) {
                $periodLimited = true;
                $effectiveStartLocal = $startLocal->copy();
                $effectiveEndLocal = $startLocal->copy()->addDays($maxDays - 1)->endOfDay();
            } else {
                $effectiveStartLocal = $startLocal;
                $effectiveEndLocal = $endLocal;
            }
        }

        // Convert effective local dates to UTC for DB queries
        $startDateUtc = $effectiveStartLocal ? $effectiveStartLocal->utc() : null;
        $endDateUtc = $effectiveEndLocal ? $effectiveEndLocal->utc() : null;

        // Query transaksi penjualan dengan timezone Asia/Jakarta
        $query = Transaction::with(['cashier', 'customer', 'details.product.categoryRelation', 'details.product.subcategory', 'details.product.unit', 'details.unit']);
        if ($startDateUtc && $endDateUtc) {
            $query->whereBetween('created_at', [
                $startDateUtc->format('Y-m-d H:i:s'),
                $endDateUtc->format('Y-m-d H:i:s'),
            ]);
        }

        // allow client to request page size (per_page) with validation
        $allowedPerPage = [10, 20, 50, 100];
        $perPage = (int) request()->input('per_page', 20);
        if (!in_array($perPage, $allowedPerPage)) {
            $perPage = 20;
        }

        $transactions = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();

        // daily sales (sum grand_total grouped by date in Asia/Jakarta)
        $dailySalesQuery = DB::table('transactions')
            ->selectRaw("DATE(CONVERT_TZ(created_at, '+00:00', '+07:00')) as date, SUM(grand_total) as total_sales")
            ->when($startDateUtc && $endDateUtc, function ($q) use ($startDateUtc, $endDateUtc) {
                $q->whereBetween('created_at', [$startDateUtc->format('Y-m-d H:i:s'), $endDateUtc->format('Y-m-d H:i:s')]);
            })
            ->groupBy('date')
            ->orderBy('date');

        $dailySales = $dailySalesQuery->get()->keyBy('date')->toArray();

        // daily HPP from transaction_details joined with products
        $dailyHppQuery = DB::table('transaction_details')
            ->join('transactions', 'transaction_details.transaction_id', '=', 'transactions.id')
            ->join('products', 'transaction_details.product_id', '=', 'products.id')
            ->selectRaw("DATE(CONVERT_TZ(transactions.created_at, '+00:00', '+07:00')) as date, SUM(transaction_details.qty * COALESCE(products.purchase_price,0)) as total_hpp")
            ->when($startDateUtc && $endDateUtc, function ($q) use ($startDateUtc, $endDateUtc) {
                $q->whereBetween('transactions.created_at', [$startDateUtc->format('Y-m-d H:i:s'), $endDateUtc->format('Y-m-d H:i:s')]);
            })
            ->groupBy('date')
            ->orderBy('date');

        $dailyHpp = $dailyHppQuery->get()->keyBy('date')->toArray();

        // Merge sales and hpp per date into dailySummary
        $dates = array_unique(array_merge(array_keys($dailySales), array_keys($dailyHpp)));
        sort($dates);

        $dailySummary = [];
        foreach ($dates as $date) {
            $sales = isset($dailySales[$date]) ? (float)$dailySales[$date]->total_sales : 0;
            $hpp = isset($dailyHpp[$date]) ? (float)$dailyHpp[$date]->total_hpp : 0;
            $profit = $sales - $hpp;
            $margin = $sales > 0 ? ($profit / $sales) * 100 : 0;
            $dailySummary[] = [
                'date' => $date,
                'total_sales' => $sales,
                'total_hpp' => $hpp,
                'profit' => $profit,
                'margin' => $margin,
            ];
        }

        // Load purchase items for fallback pricing
        $purchasesItems = PurchaseItem::with('purchase')->get();

        // Tambahkan per-transaction HPP, profit, dan margin (gunakan PricingService)
        $transactions->getCollection()->transform(function ($trx) use ($purchasesItems) {
            $cost = 0;
            foreach ($trx->details as $d) {
                // determine default purchase price from product or detail fields
                $defaultPurchase = $d->product->purchase_price ?? $d->harga_pembelian ?? $d->purchase_price ?? 0;
                $trxDateLocal = $trx->created_at->setTimezone('Asia/Jakarta')->toDateString();
                $purchasePrice = PricingService::getPurchasePrice($d->product_id ?? null, $trxDateLocal, $defaultPurchase);

                // If still 0, try preloaded purchase items collection as fallback
                if ((float)$purchasePrice === 0.0 && isset($purchasesItems) && $purchasesItems instanceof \Illuminate\Support\Collection) {
                    $candidate = $purchasesItems->where('product_id', $d->product_id)
                        ->sortByDesc(function ($pi) {
                            return $pi->purchase->purchase_date ?? null;
                        })
                        ->first();
                    if ($candidate && !empty($candidate->harga_pembelian)) {
                        $purchasePrice = $candidate->harga_pembelian;
                    }
                }

                // attach harga_beli to detail for frontend/export
                $d->harga_beli = $purchasePrice;

                // attach unit name fallback
                $unitName = null;
                if (isset($d->unit) && isset($d->unit->name)) {
                    $unitName = $d->unit->name;
                } elseif (isset($d->product) && isset($d->product->unit) && isset($d->product->unit->name)) {
                    $unitName = $d->product->unit->name;
                } elseif (isset($d->satuan)) {
                    $unitName = $d->satuan;
                }
                $d->unit_name = $unitName;

                $cost += ($purchasePrice * ($d->qty ?? 0));
            }

            // compute profit using helper
            $profit = 0;
            foreach ($trx->details as $d) {
                $profit += PricingService::calculateProfit($d->price ?? 0, $d->harga_beli ?? 0, $d->qty ?? 0);
            }

            $margin = PricingService::calculateMargin($profit, $trx->grand_total);

            // attach aggregates
            $trx->hpp_cost = $cost;
            $trx->profit = $profit;
            $trx->margin = $margin;

            return $trx;
        });

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

        // Balancing check with tolerance (0.01)
        $balancing = abs(($totalCash + $totalDeposit + $totalTempo) - $totalPenjualan) <= 0.01;

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
            'dailySummary' => $dailySummary,
            'period_limited' => $periodLimited,
            'max_days' => $maxDays,
            'effective_start' => $effectiveStartLocal ? $effectiveStartLocal->toDateString() : null,
            'effective_end' => $effectiveEndLocal ? $effectiveEndLocal->toDateString() : null,
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
     * Debug helper: return a sample JSON of the first transaction (with details)
     * Protected by auth via routes group.
     */
    public function sampleJson(Request $request)
    {
        $trx = Transaction::with(['cashier', 'customer', 'details.product.categoryRelation', 'details.product.subcategory', 'details.product.unit', 'details.unit'])->orderByDesc('created_at')->first();
        if (!$trx) {
            return response()->json(['message' => 'No transactions found'], 404);
        }

        // ensure harga_beli and unit_name are attached (reuse the same logic)
        foreach ($trx->details as $d) {
            $purchasePrice = null;
            if (isset($d->product) && isset($d->product->purchase_price)) {
                $purchasePrice = $d->product->purchase_price;
            } elseif (isset($d->harga_pembelian)) {
                $purchasePrice = $d->harga_pembelian;
            } elseif (isset($d->purchase_price)) {
                $purchasePrice = $d->purchase_price;
            } else {
                $purchasePrice = 0;
            }
            $d->harga_beli = $purchasePrice;

            // fallback: last purchase_items.harga_pembelian where purchases.purchase_date <= transaction date
            if ((int)$d->harga_beli === 0 && isset($d->product_id) && $d->product_id) {
                $trxDateLocal = $trx->created_at->setTimezone('Asia/Jakarta')->toDateString();
                $lastBuy = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                    ->where('purchase_items.product_id', $d->product_id)
                    ->whereDate('purchases.purchase_date', '<=', $trxDateLocal)
                    ->orderByDesc('purchases.purchase_date')
                    ->value('purchase_items.harga_pembelian');
                if ($lastBuy !== null) {
                    $d->harga_beli = $lastBuy;
                }
            }

            $unitName = null;
            if (isset($d->unit) && isset($d->unit->name)) {
                $unitName = $d->unit->name;
            } elseif (isset($d->product) && isset($d->product->unit) && isset($d->product->unit->name)) {
                $unitName = $d->product->unit->name;
            } elseif (isset($d->satuan)) {
                $unitName = $d->satuan;
            }
            $d->unit_name = $unitName;
        }

        return response()->json($trx->toArray());
    }

    /**
     * Return paginated transactions as JSON for AJAX/live updates
     */
    public function dataJson(Request $request)
    {
        $start = $request->input('start_date');
        $end = $request->input('end_date');

        // per_page validation
        $allowedPerPage = [5, 10, 20, 50, 100];
        $perPage = (int) $request->input('per_page', 20);
        if (!in_array($perPage, $allowedPerPage)) $perPage = 20;

        $query = Transaction::with(['cashier', 'customer', 'details.product.categoryRelation', 'details.product.subcategory', 'details.product.unit', 'details.unit']);
        if ($start && $end) {
            $startLocal = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay()->utc();
            $endLocal = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay()->utc();
            $query->whereBetween('created_at', [$startLocal->format('Y-m-d H:i:s'), $endLocal->format('Y-m-d H:i:s')]);
        }

        $transactions = $query->orderByDesc('created_at')->paginate($perPage)->withQueryString();

        // attach harga_beli and unit_name for each detail (reuse logic)
        $transactions->getCollection()->transform(function ($trx) {
            foreach ($trx->details as $d) {
                $defaultPurchase = $d->product->purchase_price ?? $d->harga_pembelian ?? $d->purchase_price ?? 0;
                $trxDateLocal = $trx->created_at->setTimezone('Asia/Jakarta')->toDateString();
                $purchasePrice = PricingService::getPurchasePrice($d->product_id ?? null, $trxDateLocal, $defaultPurchase);
                $d->harga_beli = $purchasePrice;

                $unitName = null;
                if (isset($d->unit) && isset($d->unit->name)) {
                    $unitName = $d->unit->name;
                } elseif (isset($d->product) && isset($d->product->unit) && isset($d->product->unit->name)) {
                    $unitName = $d->product->unit->name;
                } elseif (isset($d->satuan)) {
                    $unitName = $d->satuan;
                }
                $d->unit_name = $unitName;
            }
            // compute hpp_cost, profit, margin per trx via PricingService
            $cost = 0;
            $profit = 0;
            foreach ($trx->details as $d) {
                $dQty = ($d->qty ?? 0);
                $dBuy = ($d->harga_beli ?? 0);
                $dSell = ($d->price ?? 0);
                $cost += ($dBuy * $dQty);
                $profit += PricingService::calculateProfit($dSell, $dBuy, $dQty);
            }
            $trx->hpp_cost = $cost;
            $trx->profit = $profit;
            $trx->margin = PricingService::calculateMargin($profit, $trx->grand_total);

            return $trx;
        });

        return response()->json($transactions->toArray());
    }

    /**
     * Export recap transactions to Excel
     */
    public function exportExcel(Request $request)
    {

        $start = $request->input('start_date');
        $end = $request->input('end_date');

        // if ?detail=1 will export per-transaction-detail rows, otherwise per-transaction summary
        $detailed = filter_var($request->input('detail', '0'), FILTER_VALIDATE_BOOLEAN);

        // eager-load category and subcategory for product to include them in export
        $query = Transaction::with(['cashier', 'customer', 'details.product.categoryRelation', 'details.product.subcategory']);
        if ($start && $end) {
            $startDate = \Carbon\Carbon::parse($start, 'Asia/Jakarta')->startOfDay()->utc();
            $endDate = \Carbon\Carbon::parse($end, 'Asia/Jakarta')->endOfDay()->utc();
            $query->whereBetween('created_at', [$startDate->format('Y-m-d H:i:s'), $endDate->format('Y-m-d H:i:s')]);
        }
        $transactions = $query->orderByDesc('created_at')->get();
        $purchasesItems = PurchaseItem::with('purchase')->get();
        // Normalize and attach harga_beli, unit_name, and purchase source info to each detail
        foreach ($transactions as $trx) {
            foreach ($trx->details as $d) {
                // Use the same resolution logic as the JSON/data endpoints: prefer product purchase_price then detail fields,
                // and use PricingService to respect historical purchase_items when available.
                $defaultPurchase = $d->product->purchase_price ?? $d->harga_pembelian ?? $d->purchase_price ?? 0;
                $trxDateLocal = $trx->created_at->setTimezone('Asia/Jakarta')->toDateString();
                $purchasePrice = PricingService::getPurchasePrice($d->product_id ?? null, $trxDateLocal, $defaultPurchase);

                // If still 0, try preloaded purchase items collection as fallback (keeps existing behavior)
                $purchaseSource = null;
                $lastBuyDate = null;
                if ((float)$purchasePrice === 0.0 && isset($purchasesItems) && $purchasesItems instanceof \Illuminate\Support\Collection) {
                    $candidate = $purchasesItems->where('product_id', $d->product_id)
                        ->sortByDesc(function ($pi) {
                            return $pi->purchase->purchase_date ?? null;
                        })
                        ->first();
                    if ($candidate && !empty($candidate->harga_pembelian)) {
                        $purchasePrice = $candidate->harga_pembelian;
                        $purchaseSource = 'purchase_items.preloaded';
                        $lastBuyDate = $candidate->purchase->purchase_date ?? null;
                    }
                }

                // attach to detail
                $d->harga_beli = $purchasePrice;
                $d->purchase_source = $purchaseSource;
                $d->purchase_date_source = $lastBuyDate;

                // unit name fallback
                $unitName = null;
                if (isset($d->unit) && isset($d->unit->name)) {
                    $unitName = $d->unit->name;
                } elseif (isset($d->product) && isset($d->product->unit) && isset($d->product->unit->name)) {
                    $unitName = $d->product->unit->name;
                } elseif (isset($d->satuan)) {
                    $unitName = $d->satuan;
                }
                $d->unit_name = $unitName;
            }

            // compute per-transaction aggregates using attached harga_beli
            $cost = 0;
            $profit = 0;
            foreach ($trx->details as $d) {
                $dQty = ($d->qty ?? 0);
                $dBuy = ($d->harga_beli ?? 0);
                $dSell = ($d->price ?? 0);
                $cost += ($dBuy * $dQty);
                $profit += (($dSell - $dBuy) * $dQty);
            }
            $trx->hpp_cost = $cost;
            $trx->profit = $profit;
            $trx->margin = $trx->grand_total > 0 ? ($profit / $trx->grand_total) * 100 : 0;
        }
        $rows = [];
        if ($detailed) {
            // per-detail rows
            foreach ($transactions as $trx) {
                foreach ($trx->details as $d) {
                    // use attached harga_beli (normalized earlier) and ensure profit uses formula
                    $purchasePrice = $d->harga_beli ?? 0;
                    $qty = $d->qty ?? 0;
                    $price = $d->price ?? 0;
                    $subtotalJual = $price * $qty;
                    $subtotalBeli = $purchasePrice * $qty;
                    $profitDetail = PricingService::calculateProfit($price, $purchasePrice, $qty);

                    // log first detail to help debug parity
                    static $logged = false;
                    if (!$logged) {
                        Log::info('exportExcel: sample detail', [
                            'invoice' => $trx->invoice_number ?? $trx->id,
                            'product_id' => $d->product_id ?? null,
                            'price' => $price,
                            'purchasePrice' => $purchasePrice,
                            'qty' => $qty,
                            'subtotalJual' => $subtotalJual,
                            'subtotalBeli' => $subtotalBeli,
                            'profitDetail' => $profitDetail,
                        ]);
                        $logged = true;
                    }

                    $rows[] = [
                        'Tanggal' => $trx->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                        'Invoice' => $trx->invoice_number ?? $trx->id,
                        'Kasir' => $trx->cashier->name ?? '-',
                        'Pelanggan' => $trx->customer->name ?? '-',
                        'Produk' => $d->product->name ?? ($d->product_name ?? '-'),
                        'Kategori' => $d->product->categoryRelation->name ?? '-',
                        'Subkategori' => $d->product->subcategory->name ?? '-',
                        'Satuan' => $d->unit->name ?? ($d->unit_name ?? ($d->satuan ?? '-')),
                        'Qty' => $qty,
                        'Harga Jual (per unit)' => $price,
                        'Harga Beli (per unit)' => $purchasePrice,
                        'Subtotal Jual' => $subtotalJual,
                        'Subtotal Beli' => $subtotalBeli,
                        'Profit' => $profitDetail,
                        'Metode' => $trx->payment_method,
                        // traceability columns for purchase price provenance
                        'Sumber Harga Beli' => $d->purchase_source ?? '-',
                        'Tanggal Pembelian Sumber' => $d->purchase_date_source ? \Carbon\Carbon::parse($d->purchase_date_source)->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s') : '-',
                    ];
                }
            }
        } else {
            // per-transaction summary (existing behaviour)
            foreach ($transactions as $trx) {
                // compute HPP per transaction by summing harga_beli * qty per detail
                $cost = 0;
                // reset profit accumulator per transaction
                $profit = 0;
                foreach ($trx->details as $d) {
                    // use attached harga_beli
                    $purchasePrice = $d->harga_beli ?? 0;
                    $cost += ($purchasePrice * ($d->qty ?? 0));
                    $profit += PricingService::calculateProfit($d->price ?? 0, $purchasePrice, $d->qty ?? 0);
                }
                $rows[] = [
                    'Tanggal' => $trx->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                    'Invoice' => $trx->invoice_number ?? $trx->id,
                    'Kasir' => $trx->cashier->name ?? '-',
                    'Pelanggan' => $trx->customer->name ?? '-',
                    'Harga Jual' => $trx->grand_total,
                    'Harga Beli' => $cost,
                    'Total' => $trx->grand_total,
                    'HPP' => $cost,
                    'Profit' => $profit,
                    'Metode' => $trx->payment_method,
                ];
            }
        }
        // remove debug dd in production; log rows count for debugging
        Log::info('exportExcel: preparing export rows', ['rows_count' => count($rows)]);

        // Build detailed rows (per transaction detail)
        $detailRows = [];
        foreach ($transactions as $trx) {
            foreach ($trx->details as $d) {
                $unitSell = isset($d->price) ? $d->price : 0;
                $qty = isset($d->qty) ? $d->qty : 0;
                $purchasePrice = $d->harga_beli ?? 0;
                $profitLine = PricingService::calculateProfit($unitSell, $purchasePrice, $qty);

                $detailRows[] = [
                    'Produk' => $d->product->name ?? ($d->product_name ?? '-'),
                    'Kategori' => $d->product->categoryRelation->name ?? '-',
                    'Subkategori' => $d->product->subcategory->name ?? '-',
                    'Qty' => $qty,
                    'Unit' => $d->unit->name ?? ($d->unit_name ?? ($d->satuan ?? '-')),
                    'Harga Jual' => $unitSell,
                    'HPP' => $purchasePrice,
                    'Harga Beli' => $purchasePrice,
                    'Profit' => $profitLine,
                    'Subtotal' => $unitSell * $qty,
                    // supply decimal ratio (e.g. 0.25) so Excel percentage format displays correctly
                    'Margin (%)' => $unitSell * $qty > 0 ? ($profitLine / ($unitSell * $qty)) : 0,
                ];
            }
        }

        // Summary rows already in $rows (per-transaction summary)

        // Create a Multi-sheet export using anonymous classes
        $multiExport = new class($rows, $detailRows) implements \Maatwebsite\Excel\Concerns\WithMultipleSheets {
            protected $summary;
            protected $details;
            public function __construct($summary, $details)
            {
                $this->summary = $summary;
                $this->details = $details;
            }
            public function sheets(): array
            {
                $summary = $this->summary;
                $details = $this->details;

                $sheetSummary = new class($summary) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithTitle, \Maatwebsite\Excel\Concerns\WithColumnFormatting {
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
                    public function title(): string
                    {
                        return 'Summary';
                    }
                    public function columnFormats(): array
                    {
                        // Determine column letters based on expected headings
                        // Summary columns (example): A Tanggal, B Invoice, C Kasir, D Pelanggan, E Harga Jual, F Harga Beli, G Total, H HPP, I Profit, J Metode
                        // Use Rupiah currency format with negative in red
                        $rp = '"Rp" #,##0;[Red]-"Rp" #,##0';
                        return [
                            'E' => $rp, // Harga Jual
                            'F' => $rp, // Harga Beli
                            'G' => $rp, // Total
                            'H' => $rp, // HPP
                            'I' => $rp, // Profit
                        ];
                    }
                };

                $sheetDetails = new class($details) implements \Maatwebsite\Excel\Concerns\FromCollection, \Maatwebsite\Excel\Concerns\WithHeadings, \Maatwebsite\Excel\Concerns\WithTitle, \Maatwebsite\Excel\Concerns\WithColumnFormatting {
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
                    public function title(): string
                    {
                        return 'Details';
                    }
                    public function columnFormats(): array
                    {
                        // Details columns mapping based on order used when building detailRows
                        // A Produk (text), B Qty (number), C Unit (text), D Harga Jual (rp), E HPP (rp), F Harga Beli (rp), G Profit (rp), H Subtotal (rp), I Margin (%) (percentage)
                        $rp = '"Rp" #,##0;[Red]-"Rp" #,##0';
                        return [
                            'B' => \PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_NUMBER, // Qty
                            'D' => $rp, // Harga Jual
                            'E' => $rp, // HPP
                            'F' => $rp, // Harga Beli
                            'G' => $rp, // Profit
                            'H' => $rp, // Subtotal
                            // Use custom numeric percentage (value is a ratio e.g. 0.25 for 25%) - ensure we supply percentage as decimal when building rows
                            'I' => \PhpOffice\PhpSpreadsheet\Style\NumberFormat::FORMAT_PERCENTAGE_00, // Margin (%) with 2 decimals
                        ];
                    }
                };

                return [$sheetSummary, $sheetDetails];
            }
        };

        $fileName = 'rekap-transaksi-' . now()->format('Ymd_His') . '.xlsx';
        return Excel::download($multiExport, $fileName);
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
                $purchasePrice = 0;
                if (isset($d->product) && isset($d->product->purchase_price) && $d->product->purchase_price) {
                    $purchasePrice = $d->product->purchase_price;
                } elseif (isset($d->harga_pembelian) && $d->harga_pembelian) {
                    $purchasePrice = $d->harga_pembelian;
                } elseif (isset($d->purchase_price) && $d->purchase_price) {
                    $purchasePrice = $d->purchase_price;
                } else {
                    if (isset($d->product_id) && $d->product_id) {
                        $trxDateLocal = $trx->created_at->setTimezone('Asia/Jakarta')->toDateString();
                        $lastBuy = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
                            ->where('purchase_items.product_id', $d->product_id)
                            ->whereDate('purchases.purchase_date', '<=', $trxDateLocal)
                            ->orderByDesc('purchases.purchase_date')
                            ->value('purchase_items.harga_pembelian');
                        if ($lastBuy !== null) {
                            $purchasePrice = $lastBuy;
                        }
                    }
                }
                $d->harga_beli = $purchasePrice;
                $cost += ($purchasePrice * $d->qty);
            }
            $profit = $trx->grand_total - $cost;
            $rows[] = [
                'tanggal' => $trx->created_at->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s'),
                'invoice' => $trx->invoice_number ?? $trx->id,
                'kasir' => $trx->cashier->name ?? '-',
                'pelanggan' => $trx->customer->name ?? '-',
                'harga_jual' => $trx->grand_total,
                'harga_beli' => $cost,
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
