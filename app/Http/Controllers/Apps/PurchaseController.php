<?php

namespace App\Http\Controllers\Apps;

use App\Models\Unit;
use Inertia\Inertia;
use App\Models\WarehouseStock;
use App\Models\Product;
use App\Models\Category;
use App\Models\Purchase;
use App\Models\Supplier;
use App\Models\StockCard;
use App\Models\Warehouse;
use App\Models\Subcategory;
use App\Models\StockMovement;
use Illuminate\Http\Request;
use App\Services\StockCardService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Services\StockUpdateService;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PurchaseExport;
use Barryvdh\DomPDF\Facade\Pdf;

/**
 * Purchase Controller
 * 
 * @method \App\Models\User user() Get authenticated user with hasPermissionTo method
 */
class PurchaseController extends Controller
{
    /**
     * Menampilkan daftar pembelian.
     *
     * @return \Inertia\Response
     */
    public function index(Request $request)
    {
        // Check permission
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('purchases-access')) {
            abort(403, 'Unauthorized');
        }

        $query = Purchase::with([
            'supplier',
            'warehouse',
            'toko',
            'items.product',
            'items.unit',
            'items.category',
            'items.subcategory'
        ]);

        // Apply filters
        if ($request->filled('supplier')) {
            $query->whereHas('supplier', function ($q) use ($request) {
                $q->where('name', $request->supplier);
            });
        }

        if ($request->filled('warehouse')) {
            $query->whereHas('warehouse', function ($q) use ($request) {
                $q->where('name', $request->warehouse);
            });
        }

        if ($request->filled('start_date')) {
            $query->where('purchase_date', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->where('purchase_date', '<=', $request->end_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('supplier', function ($sq) use ($search) {
                    $sq->where('name', 'like', '%' . $search . '%');
                })
                    ->orWhereHas('warehouse', function ($wq) use ($search) {
                        $wq->where('name', 'like', '%' . $search . '%');
                    })
                    ->orWhereHas('toko', function ($tq) use ($search) {
                        $tq->where('name', 'like', '%' . $search . '%');
                    })
                    ->orWhere('purchase_date', 'like', '%' . $search . '%')
                    ->orWhereHas('items.product', function ($pq) use ($search) {
                        $pq->where('name', 'like', '%' . $search . '%');
                    });
            });
        }

        $purchases = $query->latest()->paginate(50); // Paginate with 50 per page

        return Inertia::render('Dashboard/Purchases/Index', [
            'purchases' => $purchases
        ]);
    }

    /**
     * Menampilkan form untuk membuat pembelian baru.
     *
     * @return \Inertia\Response
     */
    public function create()
    {
        // Check permission
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('purchases-access')) {
            abort(403, 'Unauthorized');
        }

        $categories = Category::select('id', 'name')->get();
        $subcategories = Subcategory::select('id', 'name', 'category_id')->get();

        if (session()->has('subcategory')) {
            $newSub = session('subcategory');
            if (!$subcategories->contains('id', $newSub->id)) {
                $subcategories->push($newSub);
            }
        }

        return Inertia::render('Dashboard/Purchases/Create', [
            'suppliers' => Supplier::select('id', 'name', 'phone', 'address')->get(),
            'warehouses' => Warehouse::select('id', 'name', 'address', 'phone')->get(),
            'products' => Product::select('id', 'name', 'category_id', 'subcategory_id')->get(),
            'units' => Unit::select('id', 'name', 'conversion_to_kg')->get(),
            'categories' => $categories,
            'subcategories' => $subcategories,
            'tokos' => \App\Models\Toko::select('id', 'name', 'address', 'phone')->get(),
            'lastPurchaseId' => session('lastPurchaseId'),
            'successMessage' => session('successMessage'),
        ]);
    }

    /**
     * Menampilkan form untuk mengedit pembelian.
     *
     * @param int $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        // Check permission
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('purchases-access')) {
            abort(403, 'Unauthorized');
        }

        $purchase = Purchase::with([
            'supplier',
            'warehouse',
            'toko',
            'items.product',
            'items.unit',
            'items.category',
            'items.subcategory'
        ])->findOrFail($id);

        return Inertia::render('Dashboard/Purchases/Edit', [
            'purchase' => $purchase,
            'suppliers' => Supplier::select('id', 'name', 'phone', 'address')->get(),
            'warehouses' => Warehouse::select('id', 'name')->get(),
            'products' => Product::select('id', 'name', 'category_id', 'subcategory_id')->get(),
            'units' => Unit::select('id', 'name', 'conversion_to_kg')->get(),
            'categories' => Category::select('id', 'name')->get(),
            'subcategories' => Subcategory::select('id', 'name', 'category_id')->get(),
        ]);
    }

    /**
     * Menampilkan detail pembelian.
     *
     * @param int $id
     * @return \Inertia\Response
     */
    public function show($id)
    {
        $purchase = Purchase::with([
            'supplier',
            'warehouse',
            'toko',
            'items.product',
            'items.unit',
            'items.category',
            'items.subcategory'
        ])->findOrFail($id);

        return Inertia::render('Dashboard/Purchases/Show', [
            'purchase' => $purchase
        ]);
    }

    /**
     * Menyimpan pembelian baru.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\RedirectResponse|\Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Check permission
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('purchases-access')) {
            abort(403, 'Unauthorized');
        }

        // dd($request->all());
        Log::info('Payload pembelian diterima:', $request->all());

        $filteredItems = collect($request->input('items', []))
            ->filter(
                fn($item) => isset($item['product_id'], $item['unit_id'], $item['category_id'])
                    && $item['product_id']
                    && $item['unit_id']
                    && $item['category_id']
                    && intval($item['qty']) > 0
            )
            ->values()
            ->all();
        $request->merge(['items' => $filteredItems]);

        try {
            $validated = $request->validate([
                'invoice_number' => 'required|string|max:255',
                'supplier_name' => 'nullable|string|max:255',
                'toko_id' => 'nullable|exists:tokos,id',
                'toko_name' => 'nullable|string|max:255',
                'toko_address' => 'nullable|string|max:255',
                'toko_phone' => 'nullable|string|max:50',
                'warehouse_id' => 'nullable|exists:warehouses,id',
                'purchase_date' => 'required|date',
                'phone' => 'nullable|string|max:50',
                'address' => 'nullable|string|max:255',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.unit_id' => 'required|exists:units,id',
                'items.*.category_id' => 'required|exists:categories,id',
                'items.*.subcategory_id' => 'nullable|exists:subcategories,id',
                'items.*.qty' => 'required|numeric|min:1',
                'items.*.qty_gudang' => 'nullable|numeric|min:0',
                'items.*.qty_toko' => 'nullable|numeric|min:0',
                'items.*.harga_pembelian' => 'required|numeric|min:0',
                'items.*.kuli_fee' => 'required|numeric|min:0',
                'items.*.timbangan' => 'nullable|numeric|min:0',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Validasi gagal:', ['errors' => $e->errors(), 'payload' => $request->all()]);
            throw $e;
        }

        // PERBAIKAN: Tambah logika alokasi otomatis jika qty_gudang dan qty_toko kosong
        foreach ($validated['items'] as $key => $item) {
            $totalQty = floatval($item['qty']);
            $qtyGudang = floatval($item['qty_gudang'] ?? 0);
            $qtyToko = floatval($item['qty_toko'] ?? 0);

            // Jika alokasi belum diatur (keduanya 0), buat alokasi otomatis
            if ($qtyGudang == 0 && $qtyToko == 0) {
                // Default: 50% ke gudang, 50% ke toko (sesuai permintaan user: 100 unit sak → 100 masuk toko, 100 masuk gudang)
                $qtyGudang = round($totalQty * 0.5, 2);
                $qtyToko = round($totalQty * 0.5, 2);

                // Pastikan total alokasi sama dengan qty total
                $totalAlokasi = $qtyGudang + $qtyToko;
                if (abs($totalAlokasi - $totalQty) > 0.01) { // Toleransi untuk floating point
                    $qtyGudang = $totalQty - $qtyToko; // Adjust gudang
                }

                $validated['items'][$key]['qty_gudang'] = $qtyGudang;
                $validated['items'][$key]['qty_toko'] = $qtyToko;

                Log::info('[PurchaseController] Alokasi otomatis 50%-50% dibuat', [
                    'product_id' => $item['product_id'],
                    'total_qty' => $totalQty,
                    'qty_gudang' => $qtyGudang,
                    'qty_toko' => $qtyToko
                ]);
            } else {
                // Validasi alokasi manual, adjust jika tidak sesuai
                $totalAlokasi = $qtyGudang + $qtyToko;
                if (abs($totalAlokasi - $totalQty) > 0.01) { // Toleransi untuk floating point
                    // Adjust qty_toko agar total sesuai
                    $qtyToko = $totalQty - $qtyGudang;
                    if ($qtyToko < 0) {
                        $qtyGudang = $totalQty;
                        $qtyToko = 0;
                    }
                    $validated['items'][$key]['qty_gudang'] = $qtyGudang;
                    $validated['items'][$key]['qty_toko'] = $qtyToko;

                    Log::info('[PurchaseController] Alokasi disesuaikan otomatis', [
                        'product_id' => $item['product_id'],
                        'original_qty_gudang' => $item['qty_gudang'],
                        'original_qty_toko' => $item['qty_toko'],
                        'adjusted_qty_gudang' => $qtyGudang,
                        'adjusted_qty_toko' => $qtyToko,
                        'total_qty' => $totalQty
                    ]);
                }
            }
        }

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Supplier logic
                $supplier = null;
                if (!empty($validated['supplier_name'])) {
                    $supplier = Supplier::where('name', $validated['supplier_name'])->first();
                    if (!$supplier) {
                        $supplier = Supplier::create([
                            'name' => $validated['supplier_name'],
                            'phone' => $validated['phone'] ?? null,
                            'address' => $validated['address'] ?? null,
                        ]);
                    } else {
                        if (
                            (isset($validated['phone']) && $validated['phone'] && $supplier->phone !== $validated['phone']) ||
                            (isset($validated['address']) && $validated['address'] && $supplier->address !== $validated['address'])
                        ) {
                            $supplier->update([
                                'phone' => $validated['phone'] ?? $supplier->phone,
                                'address' => $validated['address'] ?? $supplier->address,
                            ]);
                        }
                    }
                }

                // Gudang logic - Readonly, hanya menggunakan warehouse yang sudah ada
                $warehouse = null;
                if (!empty($validated['warehouse_id'])) {
                    $warehouse = Warehouse::find($validated['warehouse_id']);
                }

                $totalPembelian = 0;
                $itemSubtotals = [];
                $totalQtyKg = 0; // untuk perhitungan fee kuli dan timbangan

                // Hitung total qty kg terlebih dahulu
                foreach ($validated['items'] as $item) {
                    $unit = Unit::find($item['unit_id']);
                    $conversion = $unit ? $unit->conversion_to_kg : 1;
                    $totalQtyKg += $item['qty'] * $conversion;
                }

                // Fee kuli dan timbangan (flat rate berdasarkan total qty kg)
                $kuliFeeRate = 0;
                if (count($validated['items']) > 0 && isset($validated['items'][0]['kuli_fee'])) {
                    $kuliFeeRate = floatval($validated['items'][0]['kuli_fee']);
                }
                $kuliFee = $totalQtyKg * $kuliFeeRate;

                // Perubahan: anggap input 'timbangan' dari frontend adalah total nominal (Rp total)
                // bukan tarif per-kg. Jadi baca langsung nilai total yang dikirim.
                $totalTimbangan = 0;
                if (count($validated['items']) > 0 && isset($validated['items'][0]['timbangan'])) {
                    // Frontend mengirimkan 'timbangan' di setiap item sebagai nilai total (sama untuk semua item),
                    // ambil nilai tersebut sebagai total timbangan.
                    $totalTimbangan = floatval($validated['items'][0]['timbangan']);
                }

                // Hitung subtotal per item dengan proporsi fee kuli dan timbangan
                foreach ($validated['items'] as $item) {
                    $unit = Unit::find($item['unit_id']);
                    $conversion = $unit ? $unit->conversion_to_kg : 1;
                    $itemQtyKg = $item['qty'] * $conversion;

                    // Subtotal dasar (qty * harga)
                    $baseSubtotal = $itemQtyKg * $item['harga_pembelian'];

                    // Proporsi fee kuli dan timbangan untuk item ini
                    $itemKuliFee = $totalQtyKg > 0 ? ($itemQtyKg / $totalQtyKg) * $kuliFee : 0;
                    $itemTimbangan = $totalQtyKg > 0 ? ($itemQtyKg / $totalQtyKg) * $totalTimbangan : 0;

                    // Subtotal final termasuk fee kuli dan timbangan
                    $finalSubtotal = $baseSubtotal + $itemKuliFee + $itemTimbangan;

                    $itemSubtotals[] = [
                        'item' => $item,
                        'subtotal' => $finalSubtotal, // sudah termasuk proporsi fee kuli dan timbangan
                        'conversion' => $conversion,
                        'base_subtotal' => $baseSubtotal,
                        'item_kuli_fee' => $itemKuliFee,
                        'item_timbangan' => $itemTimbangan,
                    ];
                    $totalPembelian += $baseSubtotal;
                }

                $totalFinal = $totalPembelian + $kuliFee + $totalTimbangan;

                Log::info('Total subtotal pembelian:', ['total_subtotal' => $totalPembelian]);
                Log::info('Total qty dalam kg:', ['total_qty_kg' => $totalQtyKg]);
                Log::info('Fee kuli rate:', ['kuli_fee_rate' => $kuliFeeRate]);
                Log::info('Fee kuli total:', ['fee_kuli_total' => $kuliFee]);
                Log::info('Total timbangan (nominal):', ['total_timbangan' => $totalTimbangan]);
                Log::info('Total akhir pembelian:', ['total_final' => $totalFinal]);

                $today = date('Y/m/d', strtotime($validated['purchase_date']));
                // Ambil last purchase untuk tanggal yang sama dengan SELECT ... FOR UPDATE
                // agar concurrent request tidak menghasilkan nomor invoice yang sama.
                $lastTodayPurchase = DB::table('purchases')
                    ->whereDate('purchase_date', $validated['purchase_date'])
                    ->orderBy('id', 'desc')
                    ->lockForUpdate()
                    ->first();

                $nextTodayNumber = 1;
                if ($lastTodayPurchase && isset($lastTodayPurchase->invoice_number)) {
                    preg_match('/PB-\d{4}\/\d{2}\/\d{2}-(\d{3})/', $lastTodayPurchase->invoice_number, $matches);
                    $lastSeq = isset($matches[1]) ? intval($matches[1]) : 0;
                    $nextTodayNumber = $lastSeq + 1;
                }
                $invoiceNumber = 'PB-' . $today . '-' . str_pad($nextTodayNumber, 3, '0', STR_PAD_LEFT);

                $purchase = Purchase::create([
                    'invoice_number' => $invoiceNumber,
                    'supplier_id' => $supplier ? $supplier->id : null,
                    'warehouse_id' => $warehouse ? $warehouse->id : null,
                    'toko_id' => $validated['toko_id'] ?? null,
                    'purchase_date' => $validated['purchase_date'],
                    'total' => $totalFinal, // Total termasuk fee kuli dan timbangan
                    'user_id' => Auth::id(),
                ]);

                // Integrasikan StockUpdateService untuk distribusi stok
                $toko = null;
                foreach ($itemSubtotals as $itemData) {
                    $item = $itemData['item'];
                    $subtotal = $itemData['subtotal'];

                    // Simpan item pembelian
                    $purchaseItem = $purchase->items()->create([
                        'user_id' => Auth::id(),
                        'product_id' => $item['product_id'],
                        'unit_id' => $item['unit_id'],
                        'category_id' => $item['category_id'],
                        'subcategory_id' => $item['subcategory_id'] ?? null,
                        'qty' => $item['qty'],
                        'qty_gudang' => $item['qty_gudang'] ?? 0,
                        'qty_toko' => $item['qty_toko'] ?? 0,
                        'harga_pembelian' => $item['harga_pembelian'],
                        'subtotal' => $subtotal, // sudah termasuk proporsi fee kuli dan timbangan
                        'kuli_fee' => $itemData['item_kuli_fee'], // porsi kuli fee untuk item ini
                        'timbangan' => $itemData['item_timbangan'], // porsi timbangan untuk item ini
                    ]);

                    // Siapkan distribusi stok menggunakan helper baru
                    $distribution = [];

                    // Distribusi ke gudang
                    if (!empty($item['qty_gudang']) && $item['qty_gudang'] > 0) {
                        $unit = Unit::find($item['unit_id']);
                        if (!$unit) {
                            throw new \Exception("Unit not found for id: " . $item['unit_id']);
                        }
                        $distribution['warehouse'] = [
                            'qty' => $item['qty_gudang'],
                            'unit' => $unit
                        ];
                    }

                    // Distribusi ke toko
                    if (!empty($item['qty_toko']) && $item['qty_toko'] > 0) {
                        $unit = Unit::find($item['unit_id']);
                        if (!$unit) {
                            throw new \Exception("Unit not found for id: " . $item['unit_id']);
                        }
                        $distribution['store'] = [
                            'qty' => $item['qty_toko'],
                            'unit' => $unit
                        ];

                        // Cari atau buat data toko
                        $toko = \App\Models\Toko::firstOrCreate([
                            'name' => $validated['toko_name'] ?? 'Toko',
                        ], [
                            'address' => $validated['toko_address'] ?? null,
                            'phone' => $validated['toko_phone'] ?? null,
                            'description' => 'Auto created from pembelian',
                        ]);

                        // Set toko_id pada purchase
                        if (empty($purchase->toko_id)) {
                            $purchase->toko_id = $toko->id;
                        }
                    }

                    // Update stok menggunakan service baru
                    if (!empty($distribution)) {
                        $tokoId = isset($toko) && isset($toko->id) ? $toko->id : null;
                        $stockUpdateResult = StockUpdateService::updateStockAfterPurchase(
                            $item['product_id'],
                            $distribution,
                            $warehouse ? $warehouse->id : null,
                            $tokoId,
                            Auth::id()
                        );

                        if (!$stockUpdateResult) {
                            Log::error('[PurchaseController] Gagal update stok setelah pembelian', [
                                'product_id' => $item['product_id'],
                                'distribution' => $distribution
                            ]);
                            throw new \Exception('Gagal mengupdate stok untuk produk ID: ' . $item['product_id']);
                        }

                        Log::info('[PurchaseController] Stok berhasil diupdate dengan StockUpdateService', [
                            'product_id' => $item['product_id'],
                            'warehouse_qty' => $distribution['warehouse']['qty'] ?? 0,
                            'store_qty' => $distribution['store']['qty'] ?? 0
                        ]);

                        // Record stock movements untuk tracking
                        try {
                            // Record movement untuk gudang jika ada
                            if (isset($distribution['warehouse']) && $distribution['warehouse']['qty'] > 0) {
                                $unit = $distribution['warehouse']['unit'];
                                $qtyInKg = $distribution['warehouse']['qty'] * ($unit ? $unit->conversion_to_kg : 1);

                                StockMovement::recordMovement(
                                    $item['product_id'],
                                    $warehouse ? $warehouse->id : null,
                                    'purchase',
                                    $qtyInKg,
                                    null, // balance will be calculated
                                    'purchase',
                                    $purchase->id,
                                    'Pembelian - ' . $purchase->invoice_number,
                                    Auth::id()
                                );

                                Log::info('[PurchaseController] Stock movement gudang tercatat', [
                                    'product_id' => $item['product_id'],
                                    'warehouse_id' => $warehouse ? $warehouse->id : null,
                                    'qty_kg' => $qtyInKg
                                ]);
                            }

                            // Record movement untuk toko jika ada
                            if (isset($distribution['store']) && $distribution['store']['qty'] > 0) {
                                $unit = $distribution['store']['unit'];
                                $qtyInKg = $distribution['store']['qty'] * ($unit ? $unit->conversion_to_kg : 1);

                                StockMovement::recordTokoMovement(
                                    $item['product_id'],
                                    $toko->id ?? null,
                                    'purchase',
                                    $qtyInKg,
                                    'purchase',
                                    $purchase->id,
                                    'Pembelian - ' . $purchase->invoice_number,
                                    Auth::id()
                                );

                                Log::info('[PurchaseController] Stock movement toko tercatat', [
                                    'product_id' => $item['product_id'],
                                    'toko_id' => $toko->id ?? null,
                                    'qty_kg' => $qtyInKg
                                ]);
                            }
                        } catch (\Exception $e) {
                            Log::error('[PurchaseController] Gagal mencatat stock movement', [
                                'error' => $e->getMessage(),
                                'product_id' => $item['product_id']
                            ]);
                            // Tidak throw exception karena stock sudah terupdate, ini hanya untuk tracking
                        }
                    }
                }

                // Simpan purchase jika toko_id baru saja diisi sehingga StockCardService bisa melihatnya
                if ($purchase->isDirty('toko_id')) {
                    $purchase->save();
                }

                StockCardService::recordInFromPurchase($purchase);

                // Record TransactionHistory entries for this purchase (one per item)
                try {
                    foreach ($purchase->items as $pItem) {
                        $unit = Unit::find($pItem->unit_id);
                        $unitName = $unit ? $unit->name : null;

                        // attempt to derive stock_before/after from product->stock (stored in kg canonical)
                        $product = Product::find($pItem->product_id);
                        $stockBefore = $product ? ($product->stock ?? null) : null;

                        // quantity in original unit
                        $qty = $pItem->qty;

                        // compute subtotal if not present
                        $subtotal = $pItem->subtotal ?? ($qty * ($pItem->harga_pembelian ?? 0));

                        // Ensure transaction_number is unique per history row by appending the purchase item id
                        // This prevents duplicate-key errors when a purchase has multiple items but the
                        // transaction_histories.transaction_number column is declared UNIQUE.
                        $thNumber = $purchase->invoice_number . '-' . $pItem->id;
                        Log::debug('[TransactionHistory] creating', ['transaction_number' => $thNumber, 'purchase_id' => $purchase->id, 'purchase_item_id' => $pItem->id]);

                        $th = \App\Models\TransactionHistory::create([
                            'transaction_number' => $thNumber,
                            'transaction_type' => 'purchase',
                            'transaction_date' => $purchase->purchase_date,
                            // record the actual time the purchase was saved in WIB
                            'transaction_time' => \Carbon\Carbon::now('Asia/Jakarta')->format('H:i:s'),
                            'related_party' => $purchase->supplier ? $purchase->supplier->name : ($purchase->toko ? $purchase->toko->name : null),
                            'toko_id' => $purchase->toko_id,
                            // warehouse_id column removed from schema; omit it
                            'product_id' => $pItem->product_id,
                            'quantity' => $qty,
                            'unit' => $unitName,
                            'price' => $pItem->harga_pembelian ?? 0,
                            'subtotal' => $subtotal,
                            'kuli_fee' => $pItem->kuli_fee ?? 0,
                            'timbangan' => $pItem->timbangan ?? null,
                            'stock_before' => $stockBefore ?? 0,
                            'stock_after' => $product ? ($product->stock ?? 0) : 0,
                            'payment_status' => null,
                            'notes' => 'Auto-recorded from Purchase #' . $purchase->id,
                            'created_by' => Auth::id(),
                        ]);
                        try {
                            event(new \App\Events\TransactionHistoryCreated($th));
                        } catch (\Throwable $e) {
                            Log::warning('Failed to broadcast TransactionHistoryCreated (purchase): ' . $e->getMessage());
                        }
                    }
                } catch (\Exception $e) {
                    Log::error('Failed to record TransactionHistory for purchase', ['error' => $e->getMessage(), 'purchase_id' => $purchase->id]);
                    // let transaction continue; history is best-effort
                }

                if ($request->hasHeader('X-Inertia')) {
                    // Untuk request Inertia, redirect ke halaman create dengan flash message.
                    session()->flash('lastPurchaseId', $purchase->id);
                    session()->flash('successMessage', 'Pembelian berhasil disimpan dengan nomor invoice ' . $invoiceNumber . '. Form telah direset untuk transaksi baru.');
                    return redirect()->route('purchases.create');
                }

                // If the client explicitly expects JSON but it's NOT an Inertia request,
                // return JSON. Do not return plain JSON for Inertia requests.
                if (($request->wantsJson() || $request->ajax()) && !$request->hasHeader('X-Inertia')) {
                    return response()->json([
                        'success' => true,
                        'lastPurchaseId' => $purchase->id,
                    ]);
                }

                return redirect()->route('purchases.receipt', $purchase->id);
            });
        } catch (\Exception $e) {
            Log::error('Error in purchase store transaction', ['error' => $e->getMessage()]);
            return redirect()->route('purchases.create')->withErrors(['error' => 'Failed to save purchase: ' . $e->getMessage()]);
        }
    }

    /**
     * Memperbarui data pembelian.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        // Check permission
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('purchases-access')) {
            abort(403, 'Unauthorized');
        }

        Log::info('Payload update:', $request->all());
        $validated = $request->validate([
            'invoice_number' => 'required|string|max:255',
            'supplier_id' => 'required|exists:suppliers,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'purchase_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.unit_id' => 'required|exists:units,id',
            'items.*.category_id' => 'required|exists:categories,id',
            'items.*.subcategory_id' => 'nullable|exists:subcategories,id',
            'items.*.qty' => 'required|numeric|min:1',
            'items.*.harga_pembelian' => 'required|numeric|min:0',
            'items.*.kuli_fee' => 'required|numeric|min:0',
        ]);

        $purchase = Purchase::findOrFail($id);
        $purchase->update([
            'invoice_number' => $validated['invoice_number'],
            'supplier_id' => $validated['supplier_id'],
            'warehouse_id' => $validated['warehouse_id'],
            'purchase_date' => $validated['purchase_date'],
        ]);

        $purchase->items()->delete();

        foreach ($validated['items'] as $item) {
            $createdItem = $purchase->items()->create([
                'product_id' => $item['product_id'],
                'unit_id' => $item['unit_id'],
                'category_id' => $item['category_id'],
                'subcategory_id' => $item['subcategory_id'] ?? null,
                'qty' => $item['qty'],
                'harga_pembelian' => $item['harga_pembelian'],
                'subtotal' => ($item['qty'] * $item['harga_pembelian']),
                'kuli_fee' => $item['kuli_fee'] ?? 0,
            ]);
            Log::info('Item created:', $createdItem->toArray());
        }

        StockCardService::recordInFromPurchase($purchase);

        return redirect()->route('purchases.index')->with('success', 'Data pembelian berhasil diubah.');
    }

    /**
     * Menghapus pembelian.
     *
     * @param int $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        // Check permission
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user || ! $user->hasPermissionTo('purchases-access')) {
            abort(403, 'Unauthorized');
        }

        $purchase = Purchase::findOrFail($id);
        $purchase->items()->delete();
        $purchase->delete();
        StockCard::where('note', 'like', '%Pembelian #' . $purchase->id . '%')->delete();

        return redirect()->route('purchases.index')->with('success', 'Pembelian berhasil dihapus');
    }

    /**
     * Mencetak nota pembelian.
     *
     * @param int $id
     * @return \Illuminate\View\View
     */
    public function receipt($id)
    {
        Log::debug('[RECEIPT] Masuk method receipt', ['id' => $id]);
        $purchase = Purchase::with([
            'supplier',
            'warehouse',
            'items.product',
            'items.unit',
            'items.category',
            'items.subcategory'
        ])->find($id);

        if (!$purchase) {
            Log::error('[RECEIPT] Purchase tidak ditemukan', ['id' => $id]);
            abort(404, 'Purchase not found');
        }

        Log::info('[RECEIPT] Purchase ditemukan', ['purchase_id' => $purchase->id, 'invoice_number' => $purchase->invoice_number]);
        Log::debug('[RECEIPT] Selesai method receipt', ['id' => $id]);

        return view('receipts.purchase', compact('purchase'));
    }

    /**
     * Mengekspor data pembelian ke Excel atau PDF.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse|\Illuminate\Http\Response
     */
    public function export(Request $request)
    {
        $format = $request->get('format', 'excel');

        try {
            if ($format === 'pdf') {
                $purchases = Purchase::with([
                    'supplier',
                    'warehouse',
                    'items.product',
                    'items.unit',
                    'items.category',
                    'items.subcategory'
                ])->latest()->get();
                $pdf = Pdf::loadView('exports.purchases_pdf', compact('purchases'));
                return $pdf->download('purchases.pdf');
            }
            if ($format === 'excel') {

                return Excel::download(new PurchaseExport, 'purchases.xlsx');
            }
        } catch (\Exception $e) {
            Log::error('Gagal mengekspor data pembelian:', ['error' => $e->getMessage()]);
            return redirect()->back()->with('error', 'Gagal mengekspor data. Silakan coba lagi.');
        }
    }

    /**
     * Generate next invoice number for a given date
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function nextInvoice(Request $request)
    {
        try {
            $date = $request->query('date');

            if (!$date) {
                return response()->json(['error' => 'Date parameter is required'], 400);
            }

            // Validate date format
            if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
                return response()->json(['error' => 'Invalid date format. Use YYYY-MM-DD'], 400);
            }

            // Format date for invoice number (YYYY/MM/DD)
            $formattedDate = str_replace('-', '/', $date);

            // Find existing invoice numbers for this date
            $existingInvoices = Purchase::where('invoice_number', 'like', "PB-{$formattedDate}-%")
                ->pluck('invoice_number')
                ->toArray();

            // Extract sequence numbers
            $sequences = [];
            foreach ($existingInvoices as $invoice) {
                $parts = explode('-', $invoice);
                if (count($parts) === 3) {
                    $seq = (int) $parts[2];
                    $sequences[] = $seq;
                }
            }

            // Get next sequence number
            $nextSeq = empty($sequences) ? 1 : max($sequences) + 1;
            $nextSeqFormatted = str_pad($nextSeq, 3, '0', STR_PAD_LEFT);

            // Generate invoice number
            $invoiceNumber = "PB-{$formattedDate}-{$nextSeqFormatted}";

            return response()->json([
                'invoice_number' => $invoiceNumber,
                'invoice_seq' => $nextSeqFormatted
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating next invoice number', [
                'date' => $date ?? null,
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json(['error' => 'Failed to generate invoice number'], 500);
        }
    }

    /**
     * Memperbarui stok berdasarkan data pembelian.
     *
     * @param int $productId
     * @param int $warehouseId
     * @param string $purchaseDate
     * @param array $konversi
     * @return void
     */
    private function updateStock($productId, $warehouseId, $purchaseDate, $konversi)
    {
        // Resolve unit ids dynamically by unit name to avoid hardcoded numeric ids.
        $unitNames = array_keys($konversi);
        $units = Unit::whereIn('name', $unitNames)->get()->keyBy('name');

        foreach ($konversi as $key => $qty) {
            // skip zero or negative quantities
            if (empty($qty) || floatval($qty) <= 0) {
                continue;
            }

            if (!isset($units[$key])) {
                Log::error('Missing unit when updating stock', [
                    'missing_unit' => $key,
                    'product_id' => $productId,
                    'warehouse_id' => $warehouseId,
                    'purchase_date' => $purchaseDate,
                    'user_id' => Auth::id(),
                ]);

                // Fail fast so the transaction rolls back and caller gets a clear validation error.
                throw \Illuminate\Validation\ValidationException::withMessages([
                    "items" => ["Unit '" . $key . "' not found in units table."],
                ]);
            }

            $unitId = $units[$key]->id;

            $stock = WarehouseStock::firstOrCreate([
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'unit_id' => $unitId,
                'purchase_date' => $purchaseDate,
                'user_id' => Auth::id(),
            ]);

            $stock->update([
                'qty' => ($stock->qty ?? 0) + $qty,
                'purchase_date' => $purchaseDate,
                'user_id' => Auth::id(),
            ]);
        }
    }
}
