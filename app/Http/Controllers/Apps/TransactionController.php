<?php

namespace App\Http\Controllers\Apps;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Cart;
use App\Models\Unit;
use Inertia\Inertia;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Product;
use App\Models\Category;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\DeliveryNote;
use App\Models\Toko;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Services\SuratJalanService;
use App\Helpers\UnitConverter;
use App\Services\StockUpdateService;

class TransactionController extends Controller
{
    /**
     * Tampilkan daftar transaksi penjualan.
     */
    public function list()
    {
        $user = request()->user();
        // Allow users with relevant permissions or roles (toko/gudang/super-admin)
        $allowed = false;
        if ($user) {
            $allowed = $user->hasAnyPermission(['transactions.sell', 'transactions.purchase', 'transactions.manage', 'transactions-access'])
                || $user->hasAnyRole(['super-admin', 'toko', 'gudang']);
        }

        if (! $allowed) {
            abort(403, 'Akses transaksi dibatasi.');
        }

        $transactions = Transaction::with(['customer'])
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        return \Inertia\Inertia::render('Dashboard/Transactions/List', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Generate automatic invoice number with format TRX-DD/MM/YYYY-XXX
     */
    private function generateInvoiceNumber()
    {
        // Use Asia/Jakarta timezone to match frontend behavior
        $today = \Carbon\Carbon::now('Asia/Jakarta')->format('d/m/Y');
        $prefix = "TRX-{$today}-";

        // Find the last transaction number for today
        $lastTransaction = Transaction::where('transaction_number', 'like', $prefix . '%')
            ->orderBy('transaction_number', 'desc')
            ->first();

        if ($lastTransaction) {
            // Extract the last number and increment
            $lastNumber = (int) substr($lastTransaction->transaction_number, -3);
            $nextNumber = $lastNumber + 1;
        } else {
            // First transaction of the day
            $nextNumber = 1;
        }

        // Format with leading zeros (XXX)
        $formattedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return $prefix . $formattedNumber;
    }

    /**
     * Generate automatic sequential number (no_urut) globally
     * Ensures no duplicates and thread-safe operation
     */
    private function generateNoUrut()
    {
        // Use database transaction with retry mechanism for absolute safety
        return DB::transaction(function () {
            $maxRetries = 3;
            $attempt = 0;

            while ($attempt < $maxRetries) {
                try {
                    // Find the highest no_urut with exclusive lock
                    $maxNoUrut = DB::table('transactions')
                        ->lockForUpdate()
                        ->max('no_urut');

                    $nextNumber = ($maxNoUrut ?? 0) + 1;

                    // Double-check that this number is not already used
                    $exists = Transaction::where('no_urut', $nextNumber)->exists();

                    if (!$exists) {
                        return $nextNumber;
                    } else {
                        // If somehow exists, try again with next number
                        $nextNumber++;
                        $attempt++;
                        continue;
                    }
                } catch (\Exception $e) {
                    $attempt++;
                    if ($attempt >= $maxRetries) {
                        throw new \Exception("Failed to generate unique no_urut after {$maxRetries} attempts: " . $e->getMessage());
                    }
                    // Wait a bit before retry
                    usleep(100000); // 0.1 second
                }
            }

            throw new \Exception("Failed to generate unique no_urut after maximum retries");
        });
    }

    /**
     * Cari produk pertama berdasarkan kategori dan subkategori (dan warehouse jika ada)
     */
    public function searchProductByCategorySubcategory(Request $request)
    {
        $query = Product::query();
        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->subcategory_id) {
            $query->where('subcategory_id', $request->subcategory_id);
        }
        $product = $query->first();
        // Ambil stok dari WarehouseStock jika warehouse_id dikirim
        if ($product && $request->warehouse_id) {
            $warehouseStock = WarehouseStock::getStock($product->id, $request->warehouse_id);
            $product->stock = $warehouseStock;
        }
        return response()->json(['product' => $product]);
    }

    /**
     * Display the transaction index page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $user = request()->user();
        // Allow users with relevant permissions or roles (toko/gudang/super-admin)
        $allowed = false;
        if ($user) {
            $allowed = $user->hasAnyPermission(['transactions.sell', 'transactions.purchase', 'transactions.manage', 'transactions-access'])
                || $user->hasAnyRole(['super-admin', 'Toko', 'Gudang']);
        }

        if (! $allowed) {
            abort(403, 'Akses transaksi dibatasi.');
        }

        $userId = request()->user()->id;

        $carts = Cart::with(['product.category', 'unit'])
            ->where('cashier_id', $userId)
            ->latest()
            ->get();
        $customers = Customer::latest()->get();
        $warehouses = \App\Models\Warehouse::all();
        $tokos = \App\Models\Toko::all();
        $categories = Category::select('id', 'name')->get();
        $units = Unit::all(['id', 'name', 'conversion_to_kg']);
        $subcategories = \App\Models\Subcategory::select('id', 'name', 'category_id')->get();
        $products = Product::with(['category', 'subcategory', 'unit'])->get();
        // Ambil harga pembelian terakhir dari purchase_item untuk setiap produk
        $purchasePrices = DB::table('purchase_items')
            ->select('product_id', DB::raw('MAX(id) as max_id'))
            ->groupBy('product_id')
            ->pluck('max_id', 'product_id');

        $purchaseItemPrices = [];
        if (count($purchasePrices)) {
            $purchaseItemPrices = DB::table('purchase_items')
                ->whereIn('id', $purchasePrices->values())
                ->pluck('harga_pembelian', 'product_id');
        }

        // Tambahkan purchase_price ke setiap produk
        $products->transform(function ($product) use ($purchaseItemPrices) {
            $product->purchase_price = $purchaseItemPrices[$product->id] ?? null;
            return $product;
        });

        return Inertia::render('Dashboard/Transactions/IndexShadcn', [
            'customers' => $customers,
            'products' => $products,
            'tokos' => $tokos,
            'carts' => $carts->map(function ($cart) {
                return [
                    'id' => $cart->id,
                    'product' => $cart->product,
                    'qty' => $cart->qty,
                    'price' => $cart->price,
                    'satuan' => $cart->satuan,
                    'unit' => $cart->unit,
                    'category' => $cart->product->category ?? null,
                    'subcategory' => $cart->product->subcategory ?? null,
                ];
            }),
            'carts_total' => $carts->reduce(function ($total, $cart) {
                $qty = floatval($cart->qty ?? 0);
                $konversi = floatval($cart->unit ? $cart->unit->conversion_to_kg : 1);
                $harga = floatval($cart->price ?? 0);
                $subtotal = $qty * $konversi * $harga;
                // Ensure we never return NaN
                if (is_nan($subtotal) || !is_finite($subtotal)) {
                    $subtotal = 0;
                }
                return floatval($total) + $subtotal;
            }, 0),
            'warehouses' => $warehouses,
            'categories' => $categories,
            'subcategories' => $subcategories,
            'units' => $units,
            'products' => $products,
        ]);
    }

    /**
     * Get detailed transaction information for modal display
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $transactionId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getTransactionDetails($transactionId)
    {
        $transaction = Transaction::with([
            'customer',
            'cashier',
            'warehouse',
            'details.product.category',
            'details.product.subcategory'
        ])->findOrFail($transactionId);

        // Calculate outstanding balance
        $paidAmount = ($transaction->cash ?? 0) + ($transaction->deposit_amount ?? 0);
        $outstandingBalance = $transaction->is_tempo && $paidAmount < $transaction->grand_total
            ? $transaction->grand_total - $paidAmount
            : 0;

        // Get purchase prices for products
        $productIds = $transaction->details->pluck('product_id')->unique();
        $purchasePrices = DB::table('purchase_items')
            ->select('product_id', DB::raw('MAX(id) as max_id'))
            ->whereIn('product_id', $productIds)
            ->groupBy('product_id')
            ->pluck('max_id', 'product_id');

        $purchaseItemPrices = [];
        if (count($purchasePrices)) {
            $purchaseItemPrices = DB::table('purchase_items')
                ->whereIn('id', $purchasePrices->values())
                ->pluck('harga_pembelian', 'product_id');
        }

        $details = $transaction->details->map(function ($detail) use ($purchaseItemPrices) {
            return [
                'product' => $detail->product,
                'quantity' => $detail->quantity,
                'price' => $detail->price,
                'purchase_price' => $purchaseItemPrices[$detail->product_id] ?? null,
                'subtotal' => $detail->subtotal,
            ];
        });

        return response()->json([
            'transaction' => [
                'id' => $transaction->id,
                'invoice' => $transaction->invoice,
                'transaction_number' => $transaction->transaction_number,
                'grand_total' => $transaction->grand_total,
                'cash' => $transaction->cash,
                'deposit_amount' => $transaction->deposit_amount,
                'change' => $transaction->change,
                'discount' => $transaction->discount,
                'is_tempo' => $transaction->is_tempo,
                'tempo_due_date' => $transaction->tempo_due_date,
                'created_at' => $transaction->created_at->format('d/m/Y H:i:s'),
                'customer' => $transaction->customer,
                'cashier' => $transaction->cashier,
                'warehouse' => $transaction->warehouse,
            ],
            'details' => $details,
            'outstanding_balance' => $outstandingBalance,
        ]);
    }

    /**
     * Search product by barcode or name.
     */
    public function searchProduct(Request $request)
    {
        $query = $request->barcode;
        // Log incoming search params for debugging
        try {
            Log::info('searchProduct called', [
                'barcode' => $request->barcode ?? null,
                'warehouse_id' => $request->warehouse_id ?? null,
                'toko_id' => $request->toko_id ?? null,
                'unit_id' => $request->unit_id ?? null,
            ]);
        } catch (\Throwable $e) {
            // swallow logging errors
        }
        $product = Product::where('barcode', $query)
            ->orWhere('name', 'like', "%$query%")
            ->first();

        if ($product) {
            $units = Unit::all(['id', 'name', 'conversion_to_kg']);
            $product->units = $units;
            $product->selectedUnit = $units->first();

            // Get warehouse stock
            $warehouseStockKg = 0;
            if ($request->has('warehouse_id') && $request->warehouse_id) {
                $warehouseStockKg = WarehouseStock::getStock($product->id, $request->warehouse_id);
            }

            // Set warehouse stock in kg for frontend
            $product->warehouse_stock_kg = $warehouseStockKg;
            $product->stock = $warehouseStockKg; // Keep backward compatibility

            try {
                // Compute aggregated store stock across all tokos by summing qty_in_kg
                $tokoIdParam = $request->toko_id ?? null;

                if ($tokoIdParam) {
                    $totalStoreStockKg = StoreStock::where('product_id', $product->id)
                        ->where('toko_id', $tokoIdParam)
                        ->sum('qty_in_kg');
                } else {
                    $totalStoreStockKg = StoreStock::where('product_id', $product->id)
                        ->sum('qty_in_kg');
                }

                // Set store stock in kg for frontend
                $product->store_stock_kg = $totalStoreStockKg;

                // Convert totalKg back to the product selected unit if available (so frontend sees stock in that unit)
                $selectedUnitConv = null;
                if (isset($product->selectedUnit) && isset($product->selectedUnit->conversion_to_kg)) {
                    $selectedUnitConv = (float) $product->selectedUnit->conversion_to_kg;
                }
                if ($selectedUnitConv && $selectedUnitConv > 0) {
                    $stokTokoQty = $totalStoreStockKg / $selectedUnitConv;
                } else {
                    // fallback: return total in kg
                    $stokTokoQty = $totalStoreStockKg;
                }

                Log::info('searchProduct result', [
                    'product_id' => $product->id ?? null,
                    'warehouse_stock_kg' => $warehouseStockKg,
                    'store_stock_kg' => $totalStoreStockKg,
                    'stok_toko' => $stokTokoQty,
                ]);
            } catch (\Throwable $e) {
                try {
                    Log::info('[searchProduct] failed to compute aggregated stok_toko', ['error' => $e->getMessage()]);
                } catch (\Throwable $_) {
                }
                $stokTokoQty = 0;
                $product->store_stock_kg = 0;
            }

            return response()->json([
                'success' => true,
                'product' => $product,
                'stok_toko' => $stokTokoQty,
            ]);
        }

        return response()->json([
            'success' => false,
            'data' => null,
        ]);
    }

    /**
     * Search product by name (for autocomplete).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function searchProductByName(Request $request)
    {
        $name = $request->input('name');
        $warehouse_id = $request->input('warehouse_id');

        $products = Product::where('name', 'like', '%' . $name . '%')
            ->when($warehouse_id, function ($query) use ($warehouse_id) {
                $query->where('warehouse_id', $warehouse_id);
            })
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Add product to cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function addToCart(Request $request)
    {
        $user = $request->user();
        if (! $user || (! $user->hasPermissionTo('transactions.sell') && ! $user->hasRole('super-admin') && ! $user->hasRole('Toko'))) {
            $uid = null;
            if ($user) {
                if (property_exists($user, 'id')) {
                    $uid = $user->id;
                } elseif (method_exists($user, 'getAuthIdentifier')) {
                    $uid = $user->getAuthIdentifier();
                }
            }
            Log::warning('[addToCart] access denied', ['user_id' => $uid, 'email' => $user?->email ?? null]);
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }
        $product = Product::find($request->product_id);
        $qty = (int) $request->qty;
        if ($qty < 1) {
            return response()->json(['success' => false, 'message' => 'Qty tidak boleh kosong'], 422);
        }

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Product not found.'], 404);
        }

        if (!$request->unit_id) {
            return response()->json(['success' => false, 'message' => 'Unit harus dipilih.'], 422);
        }

        $unit = Unit::find($request->unit_id);
        if (!$unit) {
            return response()->json(['success' => false, 'message' => 'Unit tidak valid.'], 422);
        }
        $conversion = $unit ? floatval($unit->conversion_to_kg) : 1;
        // Ensure conversion is never 0, NaN or negative
        if (is_nan($conversion) || !is_finite($conversion) || $conversion <= 0) {
            $conversion = 1;
        }
        $userId = request()->user()->id;

        // Convert qty to kg for comparison with store stocks
        $qtyInKg = $qty * $conversion;

        // Debug logging untuk unit conversion
        Log::info('[addToCart] Unit conversion debug', [
            'original_qty' => $qty,
            'unit_id' => $request->unit_id,
            'conversion_to_kg' => $conversion,
            'qty_in_kg' => $qtyInKg
        ]);

        // Jika memakai stok toko, cek ketersediaan stok (jangan kurangi stok di sini)
        if ($request->has('pakaiStokToko') && $request->pakaiStokToko) {
            $tokoId = $request->toko_id ?? null;

            // Check if request has valid toko_id
            if (!$tokoId) {
                $msg = 'Toko harus dipilih untuk menggunakan stok toko.';
                if ($request->header('X-Inertia')) {
                    return redirect()->back()->with('error', $msg);
                }
                return response()->json(['success' => false, 'message' => $msg], 422);
            }

            // Initialize stock variables
            $stockInsufficient = false;
            $stockData = null;

            // hitung total tersedia di stok_tokos untuk product+toko (store_stocks tidak punya warehouse_id)
            $tokoQuery = \App\Models\StoreStock::where('product_id', $request->product_id)
                ->where('toko_id', $tokoId);
            $tokoAvailable = (float) $tokoQuery->sum('qty_in_kg');

            // Debug logging untuk troubleshooting
            Log::info('[addToCart] Store stock check', [
                'product_id' => $request->product_id,
                'request_toko_id' => $tokoId,
                'requested_qty' => $qty,
                'requested_qty_in_kg' => $qtyInKg,
                'toko_available' => $tokoAvailable,
                'query_result' => $tokoQuery->get()->toArray()
            ]);

            if ($tokoAvailable < $qtyInKg) {
                // Store stock is insufficient - block cart addition completely
                Log::warning('[addToCart] Store stock insufficient - blocking cart addition', [
                    'product_id' => $request->product_id,
                    'toko_id' => $tokoId,
                    'available' => $tokoAvailable,
                    'requested' => $qtyInKg,
                    'deficit' => $qtyInKg - $tokoAvailable
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Stok toko tidak mencukupi untuk jumlah yang diminta.',
                    'stock_insufficient' => true,
                    'stock_data' => [
                        'toko_available' => $tokoAvailable,
                        'requested_qty_kg' => $qtyInKg,
                        'product_id' => $request->product_id,
                        'toko_id' => $tokoId,
                        'warehouse_id' => $request->warehouse_id,
                    ]
                ], 422);
            } else {
                $stockInsufficient = false;
                $stockData = null;
            }
        } else {
            // Not using store stock, so no stock insufficiency check needed
            $stockInsufficient = false;
            $stockData = null;
        }

        $cart = Cart::where('product_id', $request->product_id)
            ->where('cashier_id', $userId)
            ->where('unit_id', $request->unit_id)
            ->where('category_id', $product->category_id)
            ->where('subcategory_id', $product->subcategory_id)
            ->first();

        $input_price = $request->has('sell_price') && $request->input('sell_price') !== null && $request->input('sell_price') !== ''
            ? floatval($request->input('sell_price'))
            : (floatval($product->sell_price) * floatval($conversion));

        // Ensure price is never NaN
        if (is_nan($input_price) || !is_finite($input_price) || $input_price < 0) {
            $input_price = 0;
        }

        if ($cart) {
            $cart->qty = $cart->qty + $qty;
            $cart->price = $input_price;
            // update toko and pakai flag if provided
            if ($request->has('toko_id')) {
                $cart->toko_id = $request->toko_id;
            }
            if ($request->has('pakaiStokToko')) {
                $cart->pakai_stok_toko = $request->pakaiStokToko ? true : false;
            }
            // Don't mark as consumed during addToCart - will be consumed during transaction processing
            $cart->toko_consumed = false;
            $cart->save();
        } else {
            $createData = [
                'cashier_id' => $userId,
                'product_id' => $request->product_id,
                'qty' => $qty,
                'unit_id' => $request->unit_id,
                'price' => $input_price,
                'category_id' => $product->category_id,
                'subcategory_id' => $product->subcategory_id,
                'toko_id' => $request->toko_id ?? null,
                'pakai_stok_toko' => $request->pakaiStokToko ? true : false,
                // Don't mark as consumed during addToCart - will be consumed during transaction processing
                'toko_consumed' => false,
            ];
            Cart::create($createData);
        }

        $carts = Cart::with(['product.category', 'unit', 'category', 'subcategory'])
            ->where('cashier_id', $userId)
            ->latest()
            ->get();
        $cartsData = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'product' => $cart->product,
                'qty' => $cart->qty,
                'price' => $cart->price,
                'satuan' => $cart->satuan,
                'unit' => $cart->unit,
                'category' => $cart->category,
                'subcategory' => $cart->subcategory,
                'category_id' => $cart->category_id,
                'subcategory_id' => $cart->subcategory_id,
                'toko_id' => $cart->toko_id ?? null,
                'pakai_stok_toko' => (bool) ($cart->pakai_stok_toko ?? false),
                'toko_consumed' => (bool) ($cart->toko_consumed ?? false),
            ];
        });
        $carts_total = $carts->reduce(function ($total, $cart) {
            $qty = $cart->qty ?? 0;
            $konversi = $cart->unit ? $cart->unit->conversion_to_kg : 1;
            $harga = $cart->price ?? 0;
            return $total + ($qty * $konversi * $harga);
        }, 0);

        Log::info('[addToCart] cart created/updated', [
            'userId' => $userId,
            'product_id' => $request->product_id,
            'qty' => $qty,
            'unit_id' => $request->unit_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product Added Successfully!',
            'carts' => $cartsData,
            'carts_total' => $carts_total,
            'stock_insufficient' => $stockInsufficient ?? false,
            'stock_data' => $stockData,
        ]);
    }

    /**
     * Remove cart item.
     *
     * @param  int  $cart_id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroyCart($cart_id)
    {
        $cart = Cart::find($cart_id);

        if ($cart) {
            // If this cart previously consumed toko stock at addToCart, roll it back by
            // inserting a StokToko IN entry to return the qty back to toko.
            try {
                if (!empty($cart->toko_consumed) && $cart->toko_consumed) {
                    // Prefer to rollback the specific stok_toko row created at addToCart
                    if (!empty($cart->stok_toko_id)) {
                        $outRow = \App\Models\StoreStock::find($cart->stok_toko_id);
                        if ($outRow) {
                            // compute new sisa based on last known sisa
                            $last = \App\Models\StoreStock::where('product_id', $cart->product_id)
                                ->where('unit_id', $cart->unit_id)
                                ->when($outRow->toko_id, function ($q) use ($outRow) {
                                    return $q->where('toko_id', $outRow->toko_id);
                                })
                                ->orderByDesc('id')
                                ->first();
                            $old_sisa = $last ? ($last->sisa_stok ?? $last->qty) : 0;
                            $new_sisa = $old_sisa + $cart->qty;
                            $stokTokoRow = \App\Services\StockKgService::createTokoStock([
                                'product_id' => $cart->product_id,
                                'toko_id' => $outRow->toko_id,
                                'unit_id' => $cart->unit_id,
                                'qty' => $cart->qty,
                                'type' => 'in',
                                'note' => 'Rollback: dikembalikan karena item keranjang dihapus',
                                'user_id' => request()->user()->id,
                            ]);
                            Log::info('[destroyCart] rolled back stok_toko for cart via stok_toko_id', [
                                'cart_id' => $cart->id,
                                'product_id' => $cart->product_id,
                                'toko_id' => $outRow->toko_id,
                                'qty' => $cart->qty,
                                'new_sisa' => $new_sisa,
                                'reverted_from_id' => $outRow->id,
                            ]);
                        }
                    } else {
                        // fallback: add a generic IN entry (previous behavior)
                        $tokoId = $cart->toko_id ?? null;
                        $last = \App\Models\StoreStock::where('product_id', $cart->product_id)
                            ->where('unit_id', $cart->unit_id)
                            ->when($tokoId, function ($q) use ($tokoId) {
                                return $q->where('toko_id', $tokoId);
                            })
                            ->orderByDesc('id')
                            ->first();

                        $old_sisa = $last ? ($last->sisa_stok ?? $last->qty) : 0;
                        $new_sisa = $old_sisa + $cart->qty;

                        \App\Services\StockKgService::createTokoStock([
                            'product_id' => $cart->product_id,
                            'toko_id' => $tokoId,
                            'unit_id' => $cart->unit_id,
                            'qty' => $cart->qty,
                            'type' => 'in',
                            'note' => 'Rollback: dikembalikan karena item keranjang dihapus',
                            'user_id' => request()->user()->id,
                        ]);

                        Log::info('[destroyCart] rolled back stok_toko for cart (fallback)', [
                            'cart_id' => $cart->id,
                            'product_id' => $cart->product_id,
                            'toko_id' => $tokoId,
                            'qty' => $cart->qty,
                            'new_sisa' => $new_sisa,
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('[destroyCart] failed to rollback stok_toko', ['error' => $e->getMessage(), 'cart_id' => $cart->id]);
                // proceed with deleting cart to avoid blocking UX; admin can investigate logs
            }

            $cart->delete();
        }

        $userId = request()->user()->id;
        $carts = Cart::with(['product.category', 'unit'])
            ->where('cashier_id', $userId)
            ->latest()
            ->get();
        $cartsData = $carts->map(function ($cart) {
            return [
                'id' => $cart->id,
                'product' => $cart->product,
                'qty' => $cart->qty,
                'price' => $cart->price,
                'unit_id' => $cart->unit_id,
                'unit' => $cart->unit,
            ];
        });
        $carts_total = $carts->reduce(function ($total, $cart) {
            $qty = $cart->qty ?? 0;
            $konversi = $cart->unit ? $cart->unit->conversion_to_kg : 1;
            $harga = $cart->price ?? 0;
            return $total + ($qty * $konversi * $harga);
        }, 0);

        return response()->json([
            'success' => true,
            'carts' => $cartsData,
            'carts_total' => $carts_total,
        ]);
    }

    /**
     * Store a new transaction.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $user = $request->user();

        // Debug logging untuk troubleshooting
        Log::info('[TransactionController::store] Permission check', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'has_transactions_sell' => $user ? $user->hasPermissionTo('transactions.sell') : false,
            'has_transactions_purchase' => $user ? $user->hasPermissionTo('transactions.purchase') : false,
            'is_super_admin' => $user ? $user->hasRole('super-admin') : false,
            'user_roles' => $user ? $user->roles->pluck('name')->toArray() : [],
        ]);

        if (! $user || (! $user->hasPermissionTo('transactions.sell') && ! $user->hasPermissionTo('transactions.purchase') && ! $user->hasRole('super-admin') && ! $user->hasRole('Toko') && ! $user->hasRole('Gudang'))) {
            Log::warning('[TransactionController::store] Access denied for user', [
                'user_id' => $user?->id,
                'user_email' => $user?->email,
            ]);
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }
        try {
            // Pastikan no_urut tidak dikirim dari frontend (auto-generated only)
            if ($request->has('no_urut')) {
                return response()->json([
                    'message' => 'Field no_urut tidak boleh dikirim dari frontend. Field ini akan di-generate otomatis.'
                ], 422);
            }

            // Validasi input
            try {
                $validated = $request->validate([
                    'warehouse_id' => 'required|integer|exists:warehouses,id',
                    // allow nullable customer (frontend may send null for walk-in customers)
                    'customer_id' => 'nullable|integer|exists:customers,id',
                    'cash' => 'required|numeric|min:0',
                    'change' => 'required|numeric|min:0',
                    'discount' => 'nullable|numeric|min:0',
                    'grand_total' => 'required|numeric|min:0',
                    'payment_method' => 'required|in:cash,tempo,deposit',
                    'is_tempo' => 'nullable|boolean',
                    'tempo_due_date' => 'nullable|date|required_if:is_tempo,1',
                    'is_deposit' => 'nullable|boolean',
                    'deposit_amount' => 'nullable|numeric|min:0',
                    'add_change_to_deposit' => 'nullable|boolean',
                    'change_to_deposit_amount' => 'nullable|numeric|min:0',
                    'items' => 'required|array',
                    'items.*.product_id' => 'required|integer|exists:products,id',
                    'items.*.qty' => 'required|numeric|min:1',
                    'items.*.unit_id' => 'required|integer|exists:units,id',
                    'items.*.price' => 'required|numeric|min:0',
                ]);
            } catch (\Illuminate\Validation\ValidationException $e) {
                Log::error('[TransactionController::store] Validation failed', [
                    'errors' => $e->errors(),
                    'request_data' => $request->all(),
                ]);
                return response()->json([
                    'message' => 'Validasi gagal',
                    'errors' => $e->errors()
                ], 422);
            }

            // Log successful validation
            Log::info('[TransactionController::store] Validation passed', [
                'warehouse_id' => $validated['warehouse_id'],
                'customer_id' => $validated['customer_id'],
                'grand_total' => $validated['grand_total'],
                'payment_method' => $validated['payment_method'],
                'items_count' => count($validated['items']),
            ]);

            // Check for pending delivery notes that need approval before allowing transaction
            $pendingDeliveryNotes = [];
            foreach ($request->items as $item) {
                // Get toko_id for this item (use provided toko_id or default)
                $tokoId = $item['toko_id'] ?? $request->toko_id ?? Toko::first()->id;

                Log::info('[TransactionController::store] Checking delivery notes', [
                    'product_id' => $item['product_id'],
                    'toko_id' => $tokoId,
                    'item_toko_id' => $item['toko_id'] ?? 'not provided',
                    'request_toko_id' => $request->toko_id ?? 'not provided',
                ]);

                // Check if there are pending delivery notes for this product and toko
                $pendingNotes = DeliveryNote::where('product_id', $item['product_id'])
                    ->where('toko_id', $tokoId)
                    ->where('status', 'pending')
                    ->get();

                if ($pendingNotes->count() > 0) {
                    $pendingDeliveryNotes = array_merge($pendingDeliveryNotes, $pendingNotes->toArray());
                    Log::info('[TransactionController::store] Found pending delivery notes', [
                        'product_id' => $item['product_id'],
                        'toko_id' => $tokoId,
                        'pending_count' => $pendingNotes->count(),
                    ]);
                }
            }

            // If there are pending delivery notes, block the transaction
            if (!empty($pendingDeliveryNotes)) {
                $pendingNumbers = collect($pendingDeliveryNotes)->pluck('delivery_number')->join(', ');
                Log::warning('[TransactionController::store] Transaction blocked by pending delivery notes', [
                    'pending_numbers' => $pendingNumbers,
                    'pending_count' => count($pendingDeliveryNotes),
                ]);
                return response()->json([
                    'message' => 'Transaksi tidak dapat diproses karena ada surat jalan yang belum disetujui. Nomor surat jalan: ' . $pendingNumbers . '. Harap setujui surat jalan terlebih dahulu.',
                    'pending_delivery_notes' => $pendingDeliveryNotes
                ], 422);
            }

            // Mulai transaksi database
            DB::beginTransaction();

            // Cari pelanggan. Jika tidak disediakan, gunakan pelanggan 'Umum' (walk-in)
            if ($request->customer_id) {
                $customer = Customer::findOrFail($request->customer_id);
            } else {
                // Pastikan ada record pelanggan 'Umum' untuk transaksi walk-in
                // Use empty strings for no_telp/address to satisfy NOT NULL DB constraints
                $customer = Customer::firstOrCreate(
                    ['name' => 'Umum'],
                    // `no_telp` is a bigInteger NOT NULL in the migration; use 0 as safe default
                    ['no_telp' => 0, 'address' => '']
                );
            }

            // Validasi saldo deposit jika menggunakan deposit
            if ($request->is_deposit && $request->deposit_amount > 0) {
                if ($customer->deposit < $request->deposit_amount) {
                    return response()->json([
                        'message' => 'Saldo deposit tidak cukup',
                    ], 422);
                }
            }

            // Hitung total pembayaran (tunai + deposit)
            $totalPayment = ($validated['cash'] ?? 0) + ($request->is_deposit ? ($validated['deposit_amount'] ?? 0) : 0);

            // Validasi pembayaran cukup untuk grand_total (jika bukan tempo)
            if ($request->payment_method !== 'tempo' && $totalPayment < $validated['grand_total']) {
                return response()->json([
                    'message' => 'Total pembayaran (tunai + deposit) kurang dari grand total',
                ], 422);
            }

            // Validasi kembalian jika ditambahkan ke deposit
            if ($request->add_change_to_deposit && $request->change_to_deposit_amount <= 0) {
                return response()->json([
                    'message' => 'Tidak ada kembalian untuk ditambahkan ke deposit',
                ], 422);
            }

            // Generate nomor invoice otomatis
            $invoice = $this->generateInvoiceNumber();

            // Generate nomor urut otomatis
            $noUrut = $this->generateNoUrut();

            // Simpan transaksi
            $transaction = Transaction::create([
                'cashier_id' => $request->user()->id,
                'customer_id' => $request->customer_id,
                'warehouse_id' => $request->warehouse_id,
                'invoice' => $invoice,
                'transaction_number' => $invoice,
                'no_urut' => $noUrut,
                'cash' => $validated['cash'] ?? 0,
                'change' => $request->add_change_to_deposit ? 0 : ($validated['change'] ?? 0),
                'discount' => $validated['discount'] ?? 0,
                'grand_total' => $validated['grand_total'] ?? 0,
                'payment_method' => $request->payment_method ?? 'cash',
                'is_tempo' => $request->is_tempo ?? false,
                'tempo_due_date' => $request->tempo_due_date ?? null,
                'is_deposit' => $request->is_deposit ?? false,
                'deposit_amount' => $request->is_deposit ? ($validated['deposit_amount'] ?? 0) : 0,
                'add_change_to_deposit' => $request->add_change_to_deposit ?? false,
                'change_to_deposit_amount' => $request->add_change_to_deposit ? ($validated['change_to_deposit_amount'] ?? 0) : 0,
            ]);

            $consumptions = []; // map detail_id => consumption info
            // Proses item transaksi
            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                // Validate unit existence to avoid FK issues later
                $unit = Unit::find($item['unit_id']);
                if (! $unit) {
                    DB::rollBack();
                    Log::error('[store] missing unit for transaction item', ['item' => $item]);
                    return response()->json(['message' => 'Unit tidak ditemukan untuk salah satu item.'], 422);
                }
                $conversion = floatval($unit->conversion_to_kg ?? 1);
                // Ensure conversion is safe
                if (is_nan($conversion) || !is_finite($conversion) || $conversion <= 0) {
                    $conversion = 1;
                }
                $qty_kg = floatval($item['qty']) * $conversion;

                // Simpan detail transaksi
                $detailModel = $transaction->details()->create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'unit_id' => $item['unit_id'],
                    'qty' => $item['qty'],
                    'price' => $item['price'],
                    'warehouse_id' => $request->warehouse_id,
                    'subtotal' => $item['qty'] * $item['price'],
                ]);

                // Hitung keuntungan
                $total_buy_price = $product->buy_price * $qty_kg;
                $total_sell_price = $item['price'] * $qty_kg;
                $profits = $total_sell_price - $total_buy_price;

                $transaction->profits()->create([
                    'transaction_id' => $transaction->id,
                    'total' => $profits,
                ]);

                // Integrasikan StockUpdateService untuk pengecekan dan update stok penjualan
                try {
                    // Dapatkan unit untuk konversi
                    $unit = Unit::find($item['unit_id']);
                    $unitSymbol = $unit && $unit->symbol ? $unit->symbol : ($unit ? $unit->name : 'kg');

                    // Tentukan toko_id yang akan digunakan
                    $tokoId = $item['toko_id'] ?? $request->toko_id ?? \App\Models\Toko::first()->id;

                    // Gunakan StockUpdateService untuk update stok penjualan
                    $stockUpdateResult = StockUpdateService::updateStockAfterSale(
                        $item['product_id'],
                        $item['qty'],
                        $unitSymbol,
                        $tokoId,
                        $request->warehouse_id,
                        $transaction->id,
                        $request->user()->id
                    );

                    if (!$stockUpdateResult['success']) {
                        DB::rollBack();
                        Log::error('[TransactionController] Gagal update stok penjualan', [
                            'product_id' => $item['product_id'],
                            'error' => $stockUpdateResult['message']
                        ]);
                        return response()->json([
                            'message' => 'Stok tidak mencukupi untuk produk ID ' . $item['product_id'] . '. ' . $stockUpdateResult['message'],
                            'stock_error' => true,
                            'product_id' => $item['product_id']
                        ], 422);
                    }

                    // Save consumption map for this detail so StockCardService knows source
                    $consumptions[$detailModel->id] = [
                        'consumed_store_kg' => $stockUpdateResult['consumed_store_kg'] ?? 0,
                        'consumed_warehouse_kg' => $stockUpdateResult['consumed_warehouse_kg'] ?? 0,
                        'toko_id' => $stockUpdateResult['toko_id'] ?? $tokoId,
                        'warehouse_id' => $stockUpdateResult['warehouse_id'] ?? $request->warehouse_id,
                        'unit_symbol' => $unitSymbol,
                    ];

                    // Log delivery note jika dibuat otomatis karena stok toko habis
                    if (!empty($stockUpdateResult['delivery_note_id'])) {
                        Log::info('[TransactionController] ⚠️ STOK TOKO HABIS - Delivery note otomatis dibuat', [
                            'delivery_note_id' => $stockUpdateResult['delivery_note_id'],
                            'transaction_id' => $transaction->id,
                            'product_id' => $item['product_id'],
                            'message' => 'Stok toko tidak mencukupi, mengambil dari gudang via surat jalan'
                        ]);

                        // Tambahkan ke response agar frontend bisa tampilkan warning
                        $transaction->delivery_note_created = true;
                        $transaction->delivery_note_message = $stockUpdateResult['message'];
                    }
                } catch (\Exception $e) {
                    DB::rollBack();
                    Log::error('[TransactionController] Exception saat update stok penjualan', [
                        'product_id' => $item['product_id'],
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    return response()->json(['message' => 'Gagal memproses stok untuk produk ID ' . $item['product_id'] . ': ' . $e->getMessage()], 500);
                }
            }

            // Update saldo deposit pelanggan
            if ($request->is_deposit && $request->deposit_amount > 0) {
                Log::info('Mengurangi deposit', [
                    'customer_id' => $customer->id,
                    'deposit_amount' => $request->deposit_amount,
                    'current_deposit' => $customer->deposit,
                ]);
                $customer->deposit -= $request->deposit_amount;
                if ($customer->deposit < 0) {
                    DB::rollBack();
                    return response()->json([
                        'message' => 'Saldo deposit tidak cukup setelah pengurangan',
                    ], 422);
                }
            }
            if ($request->add_change_to_deposit && $request->change_to_deposit_amount > 0) {
                Log::info('Menambahkan kembalian ke deposit', [
                    'customer_id' => $customer->id,
                    'change_to_deposit_amount' => $request->change_to_deposit_amount,
                    'current_deposit' => $customer->deposit,
                ]);
                $customer->deposit += $request->change_to_deposit_amount;
            }

            // Force save customer changes
            $customer->save();

            Log::info('[TransactionController] Customer saved with deposit changes', [
                'customer_id' => $customer->id,
                'final_deposit' => $customer->deposit,
                'transaction_id' => $transaction->id
            ]);

            // Hapus keranjang setelah transaksi
            Cart::where('cashier_id', $request->user()->id)->delete();

            // Record StockMovement entries for sales (new integration)
            try {
                $transaction->load('details');
                foreach ($transaction->details as $detail) {
                    $unit = Unit::find($detail->unit_id);
                    $quantityInKg = $detail->qty * ($unit->conversion_to_kg ?? 1);

                    // Record stock movement for warehouse sale (if applicable)
                    if ($unit && $transaction->warehouse_id) {
                        \App\Models\StockMovement::recordMovement(
                            $detail->product_id,
                            $transaction->warehouse_id,
                            'sale',
                            -$quantityInKg, // negative for sale (stock out)
                            null, // balance will be calculated by the method
                            'Transaction',
                            $transaction->id,
                            "Penjualan #{$transaction->invoice} (Gudang)",
                            $request->user()->id
                        );

                        Log::info('[TransactionController] Recorded Warehouse StockMovement for sale', [
                            'transaction_id' => $transaction->id,
                            'product_id' => $detail->product_id,
                            'warehouse_id' => $transaction->warehouse_id,
                            'quantity_kg' => -$quantityInKg
                        ]);
                    }

                    // Record stock movement for toko sale (if applicable)
                    if ($unit && $transaction->toko_id) {
                        \App\Models\StockMovement::recordTokoMovement(
                            $detail->product_id,
                            $transaction->toko_id,
                            'sale',
                            -$quantityInKg, // negative for sale (stock out)
                            'Transaction',
                            $transaction->id,
                            "Penjualan #{$transaction->invoice} (Toko)",
                            $request->user()->id
                        );

                        Log::info('[TransactionController] Recorded Toko StockMovement for sale', [
                            'transaction_id' => $transaction->id,
                            'product_id' => $detail->product_id,
                            'toko_id' => $transaction->toko_id,
                            'quantity_kg' => -$quantityInKg
                        ]);
                    }
                }
            } catch (\Exception $e) {
                Log::error('[TransactionController] Failed to record StockMovement for sale', [
                    'error' => $e->getMessage(),
                    'transaction_id' => $transaction->id
                ]);
                // Don't fail the transaction, just log the error
            }

            // Record stock-card entries (out) so sales appear in Kartu Stok
            try {
                \App\Services\StockCardService::recordOutFromTransaction($transaction, $consumptions);
                Log::info('[TransactionController] StockCardService::recordOutFromTransaction executed', ['transaction_id' => $transaction->id]);
            } catch (\Exception $e) {
                Log::error('[TransactionController] Failed to record StockCard entries for sale', [
                    'transaction_id' => $transaction->id ?? null,
                    'error' => $e->getMessage()
                ]);
                // non-fatal
            }

            // Record TransactionHistory entries for this transaction (per detail)
            try {
                foreach ($transaction->details as $detail) {
                    $product = Product::find($detail->product_id);
                    $unit = Unit::find($detail->unit_id);
                    $unitName = $unit ? $unit->name : null;

                    // try to get stock before/after from product->stock if present
                    $stockBefore = $product ? ($product->stock ?? null) : null;
                    // approximate stock_after: if transaction consumed stock, subtract qty in kg
                    $stockAfter = $stockBefore;
                    try {
                        if ($stockBefore !== null && $unit && $unit->conversion_to_kg) {
                            $stockAfter = $stockBefore - ($detail->qty * $unit->conversion_to_kg);
                        }
                    } catch (\Throwable $_) {
                        // ignore
                    }

                    // prefer client-provided transaction_time if present (validated loosely here),
                    // otherwise use server now()
                    $trxTime = null;
                    try {
                        $trxTime = $request->input('transaction_time');
                        // if provided but empty/invalid, reset to null
                        if ($trxTime && !preg_match('/^\d{1,2}:\d{2}(:\d{2})?$/', $trxTime)) {
                            $trxTime = null;
                        } else if ($trxTime) {
                            // normalize provided time to H:i:s in Asia/Jakarta
                            try {
                                $trxTime = \Carbon\Carbon::createFromFormat('H:i:s', strlen($trxTime) === 8 ? $trxTime : ($trxTime . ':00'), 'Asia/Jakarta')->format('H:i:s');
                            } catch (\Throwable $_) {
                                try {
                                    $trxTime = \Carbon\Carbon::parse($trxTime, 'Asia/Jakarta')->format('H:i:s');
                                } catch (\Throwable $_) {
                                    $trxTime = null;
                                }
                            }
                        }
                    } catch (\Throwable $_) {
                        $trxTime = null;
                    }

                    $th = \App\Models\TransactionHistory::create([
                        'transaction_number' => $transaction->invoice,
                        'transaction_type' => 'sale',
                        'transaction_date' => \Carbon\Carbon::now('Asia/Jakarta')->format('Y-m-d'),
                        // use client-provided normalized trxTime if available, otherwise server now in Asia/Jakarta
                        'transaction_time' => $trxTime ? $trxTime : \Carbon\Carbon::now('Asia/Jakarta')->format('H:i:s'),
                        'related_party' => $customer ? $customer->name : null,
                        // warehouse_id column was removed from schema; store toko_id if applicable
                        'toko_id' => null,
                        'product_id' => $detail->product_id,
                        'quantity' => $detail->qty,
                        'unit' => $unitName,
                        'price' => $detail->price,
                        'subtotal' => $detail->subtotal ?? ($detail->qty * $detail->price),
                        'discount' => $transaction->discount ?? 0,
                        'deposit_amount' => $transaction->deposit_amount ?? 0,
                        'stock_before' => $stockBefore ?? 0,
                        'stock_after' => $stockAfter ?? 0,
                        // Ensure payment_status matches allowed enum values for transaction_histories
                        // Map payment_method -> payment_status: 'tempo' => 'unpaid', 'cash'|'deposit' => 'paid'
                        'payment_status' => (
                            $transaction->payment_method === 'tempo' ? 'unpaid' : 'paid'
                        ),
                        'notes' => 'Auto-recorded from Transaction #' . $transaction->id,
                        'created_by' => $request->user()->id,
                    ]);
                    try {
                        event(new \App\Events\TransactionHistoryCreated($th));
                    } catch (\Throwable $e) {
                        Log::warning('Failed to broadcast TransactionHistoryCreated: ' . $e->getMessage());
                    }
                }
            } catch (\Exception $e) {
                Log::error('Failed to record TransactionHistory for sale', ['error' => $e->getMessage(), 'transaction_id' => $transaction->id ?? null]);
                // non-fatal
            }

            DB::commit();

            // Auto-create SuratJalan if transaction is considered paid: dispatch event so listeners can handle it
            try {
                // determine paid status same way as service
                $paidAmount = ($transaction->cash ?? 0) + ($transaction->deposit_amount ?? 0);
                $isPaid = ($transaction->payment_method !== 'tempo' && ($transaction->grand_total <= 0 || $paidAmount >= $transaction->grand_total));
                if ($isPaid) {
                    event(new \App\Events\TransactionPaid($transaction));
                }
            } catch (\Exception $e) {
                Log::error('Failed to dispatch TransactionPaid event: ' . $e->getMessage(), ['transaction_id' => $transaction->id]);
            }

            // Persiapkan response dengan informasi delivery note jika ada
            $responseData = [
                'success' => true,
                'message' => 'Transaksi berhasil disimpan.',
                'transaction_id' => $transaction->id,
                'invoice' => $transaction->invoice,
            ];

            // Tambahkan informasi delivery note jika ada yang dibuat
            if (isset($transaction->delivery_note_created) && $transaction->delivery_note_created) {
                $responseData['warning'] = [
                    'type' => 'stock_warning',
                    'message' => 'PERINGATAN: ' . ($transaction->delivery_note_message ?? 'Stok toko tidak mencukupi, surat jalan otomatis telah dibuat untuk mengambil barang dari gudang.'),
                    'delivery_note_created' => true
                ];
            }

            // Return JSON response untuk AJAX requests
            if ($request->expectsJson() || $request->ajax() || $request->wantsJson()) {
                return response()->json($responseData);
            }

            // Setelah simpan, redirect tergantung flag `print` pada request.
            $shouldPrint = $request->input('print', true);
            if ($shouldPrint) {
                return redirect()->route('transactions.print', ['invoice' => $transaction->invoice])
                    ->with('success', 'Transaksi berhasil disimpan.')
                    ->with('lastTransactionId', $transaction->invoice);
            }

            // Jika tidak ingin mencetak, kembalikan ke index setelah simpan
            return redirect()->route('transactions.index')
                ->with('success', 'Transaksi berhasil disimpan.')
                ->with('lastTransactionId', $transaction->invoice);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            Log::error('Validasi transaksi gagal', [
                'input' => $request->all(),
                'errors' => $e->errors(),
            ]);
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gagal simpan transaksi', [
                'input' => $request->all(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'message' => 'Terjadi kesalahan server: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Print transaction.
     *
     * @param  string  $invoice
     * @return \Inertia\Response
     */
    public function print($invoice)
    {
        $transaction = Transaction::with([
            'details.product.category',
            'details.product.subcategory',
            'details.unit',
            'cashier',
            'customer',
            'warehouse',
        ])->where('invoice', $invoice)->firstOrFail();

        // Generate dynamic store information based on user role and transaction context
        $storeInfo = $this->getStoreInfo($transaction);

        return Inertia::render('Dashboard/Transactions/Print', [
            'transaction' => $transaction,
            'store' => $storeInfo,
        ]);
    }

    /**
     * Print transaction by ID.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function printById($id)
    {
        $transaction = Transaction::with([
            'details.product.category',
            'details.product.subcategory',
            'details.unit',
            'cashier',
            'customer',
            'warehouse',
        ])->findOrFail($id);

        // Generate dynamic store information based on user role and transaction context
        $storeInfo = $this->getStoreInfo($transaction);

        return Inertia::render('Dashboard/Transactions/Print', [
            'transaction' => $transaction,
            'store' => $storeInfo,
        ]);
    }

    /**
     * Get dynamic store information based on user role and transaction context.
     *
     * @param  \App\Models\Transaction  $transaction
     * @return array
     */
    private function getStoreInfo($transaction)
    {
        $user = request()->user();
        $storeInfo = [
            'name' => 'Toko88',
            'code' => '',
            'phone' => '',
            'address' => '',
            'location' => '',
        ];

        try {
            // Priority 1: Determine based on user role and associated location
            if ($user) {
                // Check if user has role Gudang - show warehouse info
                if ($user->hasRole('Gudang') || $user->hasRole('gudang')) {
                    // Try to get warehouse associated with user or first warehouse
                    $warehouse = null;

                    // Check if user has warehouse_id in users table
                    if (isset($user->warehouse_id) && $user->warehouse_id) {
                        $warehouse = \App\Models\Warehouse::find($user->warehouse_id);
                    }

                    // Fallback to first warehouse
                    if (!$warehouse) {
                        $warehouse = \App\Models\Warehouse::first();
                    }

                    if ($warehouse) {
                        $storeInfo['name'] = $warehouse->name;
                        $storeInfo['code'] = $warehouse->code ?? '';
                        $storeInfo['phone'] = $warehouse->phone ?? '';
                        $storeInfo['address'] = $warehouse->address ?? '';
                        $storeInfo['location'] = $warehouse->location ?? '';
                        return $storeInfo;
                    } else {
                        $storeInfo['name'] = 'Gudang Utama';
                        $storeInfo['location'] = 'Lokasi Gudang';
                        return $storeInfo;
                    }
                }

                // Check if user has role Toko - show toko info
                elseif ($user->hasRole('Toko') || $user->hasRole('toko')) {
                    // Try to get toko associated with user or first toko
                    $toko = null;

                    // Check if user has toko_id in users table
                    if (isset($user->toko_id) && $user->toko_id) {
                        $toko = Toko::find($user->toko_id);
                    }

                    // Fallback to first toko
                    if (!$toko) {
                        $toko = \App\Models\Toko::first();
                    }

                    if ($toko) {
                        $storeInfo['name'] = $toko->name;
                        $storeInfo['code'] = $toko->code ?? '';
                        $storeInfo['phone'] = $toko->phone ?? '';
                        $storeInfo['address'] = $toko->address ?? '';
                        $storeInfo['location'] = $toko->address ?? ''; // Use address as location for tokos
                        return $storeInfo;
                    } else {
                        $storeInfo['name'] = 'Toko Cabang';
                        $storeInfo['location'] = 'Lokasi Toko';
                        return $storeInfo;
                    }
                }

                // Super admin - use company info or default warehouse
                elseif ($user->hasRole('super-admin')) {
                    // For super admin, try to use main warehouse or company info
                    $mainWarehouse = \App\Models\Warehouse::where('is_main', true)->first()
                        ?? \App\Models\Warehouse::first();

                    if ($mainWarehouse) {
                        $storeInfo['name'] = $mainWarehouse->name;
                        $storeInfo['code'] = $mainWarehouse->code ?? '';
                        $storeInfo['phone'] = $mainWarehouse->phone ?? '';
                        $storeInfo['address'] = $mainWarehouse->address ?? '';
                        $storeInfo['location'] = $mainWarehouse->location ?? '';
                        return $storeInfo;
                    } else {
                        $storeInfo['name'] = 'Toko88 - Pusat';
                        $storeInfo['location'] = 'Kantor Pusat';
                        return $storeInfo;
                    }
                }
            }

            // Priority 2: Use warehouse from transaction if available (fallback)
            if ($transaction->warehouse) {
                $storeInfo['name'] = $transaction->warehouse->name;
                $storeInfo['code'] = $transaction->warehouse->code ?? '';
                $storeInfo['phone'] = $transaction->warehouse->phone ?? '';
                $storeInfo['address'] = $transaction->warehouse->address ?? '';
                $storeInfo['location'] = $transaction->warehouse->location ?? '';
                return $storeInfo;
            }

            // Priority 3: Final fallback - try to use any available warehouse/toko data
            if ($storeInfo['name'] === 'Toko88') {
                $warehouse = \App\Models\Warehouse::first();
                if ($warehouse) {
                    $storeInfo['name'] = $warehouse->name;
                    $storeInfo['code'] = $warehouse->code ?? '';
                    $storeInfo['phone'] = $warehouse->phone ?? '';
                    $storeInfo['address'] = $warehouse->address ?? '';
                    $storeInfo['location'] = $warehouse->location ?? '';
                }
            }
        } catch (\Exception $e) {
            // Fallback to default if any error occurs
            Log::warning('Error getting store info for print: ' . $e->getMessage());
        }

        return $storeInfo;
    }

    /**
     * Delete a transaction and its details.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $transaction = Transaction::with(['details', 'profits'])->find($id);
        if (!$transaction) {
            return back()->withErrors(['message' => 'Transaksi tidak ditemukan']);
        }
        if ($transaction->details) {
            $transaction->details()->delete();
        }
        if ($transaction->profits) {
            $transaction->profits()->delete();
        }
        $transaction->delete();
        return back()->with('success', 'Transaksi berhasil dihapus.');
    }

    /**
     * Bulk delete transactions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function bulkDestroy(Request $request)
    {
        $ids = $request->input('ids', []);
        if (!is_array($ids) || empty($ids)) {
            return back()->withErrors(['message' => 'Tidak ada transaksi yang dipilih.']);
        }
        $transactions = Transaction::with(['details', 'profits'])->whereIn('id', $ids)->get();
        foreach ($transactions as $transaction) {
            if ($transaction->details) {
                $transaction->details()->delete();
            }
            if ($transaction->profits) {
                $transaction->profits()->delete();
            }
            $transaction->delete();
        }
        return back()->with('success', 'Transaksi terpilih berhasil dihapus.');
    }

    /**
     * Remove item from cart by index
     */
    public function removeFromCart(Request $request, $index)
    {
        try {
            $userId = $request->user()->id;

            Log::info('[removeFromCart] Called with', [
                'index' => $index,
                'user_id' => $userId
            ]);

            // Get all carts for this user
            $carts = Cart::where('cashier_id', $userId)->orderBy('id')->get();

            Log::info('[removeFromCart] Found carts', [
                'count' => $carts->count(),
                'requested_index' => $index
            ]);

            // Check if index is valid
            if (!isset($carts[$index])) {
                Log::warning('[removeFromCart] Invalid index', [
                    'index' => $index,
                    'available_count' => $carts->count()
                ]);
                return response()->json(['message' => 'Cart item not found'], 404);
            }

            $cart = $carts[$index];

            // Delete the cart item
            $cart->delete();

            Log::info('[removeFromCart] Successfully deleted cart item', [
                'cart_id' => $cart->id
            ]);

            return response()->json(['message' => 'Item removed from cart successfully']);
        } catch (\Exception $e) {
            Log::error('[removeFromCart] Error removing cart item', [
                'error' => $e->getMessage(),
                'index' => $index,
                'user_id' => $request->user()->id ?? null
            ]);

            return response()->json(['message' => 'Failed to remove item from cart'], 500);
        }
    }

    /**
     * Get next transaction sequence number for given date
     */
    public function getNextSequence(Request $request)
    {
        $datePattern = $request->query('date_pattern');

        if (!$datePattern) {
            // Use Asia/Jakarta timezone to match frontend behavior
            $datePattern = \Carbon\Carbon::now('Asia/Jakarta')->format('d/m/Y');
        }

        $prefix = "TRX-{$datePattern}-";

        // Find the last transaction number for the given date
        $lastTransaction = Transaction::where('transaction_number', 'like', $prefix . '%')
            ->orderBy('transaction_number', 'desc')
            ->first();

        if ($lastTransaction) {
            // Extract the last number and increment
            $lastNumber = (int) substr($lastTransaction->transaction_number, -3);
            $nextNumber = $lastNumber + 1;
        } else {
            // First transaction of the day
            $nextNumber = 1;
        }

        Log::info('[TransactionController::getNextSequence] Generated sequence', [
            'date_pattern' => $datePattern,
            'prefix' => $prefix,
            'last_transaction' => $lastTransaction ? $lastTransaction->transaction_number : 'None',
            'last_number' => $lastTransaction ? (int) substr($lastTransaction->transaction_number, -3) : 0,
            'next_number' => $nextNumber,
            'preview_number' => $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT),
        ]);

        return response()->json([
            'next_sequence' => $nextNumber,
            'date_pattern' => $datePattern,
            'preview_number' => $prefix . str_pad($nextNumber, 3, '0', STR_PAD_LEFT)
        ]);
    }

    /**
     * Return next transaction number for preview (without creating transaction)
     * Used by frontend to display auto-generated transaction number on the Create form
     */
    public function nextTransactionNumber(Request $request)
    {
        // Use Asia/Jakarta timezone to match frontend behavior
        $today = \Carbon\Carbon::now('Asia/Jakarta')->format('d/m/Y');
        $prefix = "TRX-{$today}-";

        // Find the last transaction number for today
        $lastTransaction = Transaction::where('transaction_number', 'like', $prefix . '%')
            ->orderBy('transaction_number', 'desc')
            ->first();

        if ($lastTransaction) {
            // Extract the last number and increment
            $lastNumber = (int) substr($lastTransaction->transaction_number, -3);
            $nextNumber = $lastNumber + 1;
        } else {
            // First transaction of the day
            $nextNumber = 1;
        }

        // Format with leading zeros (XXX)
        $formattedNumber = str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
        $transactionNumber = $prefix . $formattedNumber;

        return response()->json([
            'transaction_number' => $transactionNumber,
            'next_sequence' => $nextNumber,
        ]);
    }

    /**
     * Get customer transaction history for payment section
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCustomerTransactionHistory(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer|exists:customers,id',
            'limit' => 'nullable|integer|min:1|max:50',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date',
        ]);

        $customerId = $request->customer_id;
        $limit = $request->limit ?? 10;
        $dateFrom = $request->date_from;
        $dateTo = $request->date_to;

        $query = Transaction::with(['customer', 'details.product'])
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'desc');

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $transactions = $query->limit($limit)->get();

        // Calculate outstanding balance (capital) - amount still owed by customer
        $outstandingBalance = 0;
        foreach ($transactions as $transaction) {
            $paidAmount = ($transaction->cash ?? 0) + ($transaction->deposit_amount ?? 0);
            if ($transaction->is_tempo && $paidAmount < $transaction->grand_total) {
                $outstandingBalance += ($transaction->grand_total - $paidAmount);
            }
        }

        // Calculate summary statistics
        $totalTransactions = $transactions->count();
        $totalAmount = $transactions->sum('grand_total');
        $totalPaid = $transactions->sum(function ($transaction) {
            return ($transaction->cash ?? 0) + ($transaction->deposit_amount ?? 0);
        });
        $totalDepositUsed = $transactions->sum('deposit_amount');

        return response()->json([
            'transactions' => $transactions->map(function ($transaction) {
                return [
                    'id' => $transaction->id,
                    'invoice' => $transaction->invoice,
                    'transaction_number' => $transaction->transaction_number,
                    'grand_total' => $transaction->grand_total,
                    'deposit_amount' => $transaction->deposit_amount,
                    'cash' => $transaction->cash,
                    'change' => $transaction->change,
                    'discount' => $transaction->discount,
                    'created_at' => $transaction->created_at->format('Y-m-d H:i:s'),
                    'date' => $transaction->created_at->format('d/m/Y'),
                    'time' => $transaction->created_at->format('H:i'),
                    'is_tempo' => $transaction->is_tempo,
                    'tempo_due_date' => $transaction->tempo_due_date,
                    'details' => $transaction->details->map(function ($detail) {
                        return [
                            'product_name' => $detail->product->name ?? 'Unknown Product',
                            'quantity' => $detail->quantity,
                            'price' => $detail->price,
                            'subtotal' => $detail->subtotal,
                        ];
                    }),
                ];
            }),
            'summary' => [
                'total_transactions' => $totalTransactions,
                'total_amount' => $totalAmount,
                'total_paid' => $totalPaid,
                'total_deposit_used' => $totalDepositUsed,
                'outstanding_balance' => $outstandingBalance,
            ],
        ]);
    }
}
