<?php

namespace App\Services;


use App\Models\StockCard;
use Carbon\Carbon;
use App\Models\Purchase;
use Illuminate\Support\Facades\Log;

class StockCardService
{
    /**
     * Catat pergerakan stok masuk berdasarkan pembelian
     */
    public static function recordInFromPurchase(Purchase $purchase)
    {
        try {
            Log::info('[StockCardService] recordInFromPurchase called', [
                'purchase_id' => $purchase->id,
                'toko_id' => $purchase->toko_id,
                'warehouse_id' => $purchase->warehouse_id,
                'items' => $purchase->items->toArray(),
            ]);
            foreach ($purchase->items as $item) {
                $unit = $item->unit;
                $conversion = $unit?->conversion_to_kg ?? 1; // fallback ke 1 jika null

                $inserted = false;
                // Jika ada warehouse_id, catat untuk gudang dengan qty_gudang
                if ($purchase->warehouse_id && isset($item->qty_gudang) && $item->qty_gudang > 0) {
                    $qtyGudangKg = $item->qty_gudang * $conversion;

                    $lastCard = StockCard::where('product_id', $item->product_id)
                        ->where('warehouse_id', $purchase->warehouse_id)
                        ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                    $saldoLama = $lastCard?->saldo ?? 0;
                    $saldoBaru = $saldoLama + $qtyGudangKg;
                    $dateValue = $purchase->purchase_date ? Carbon::parse($purchase->purchase_date)->format('Y-m-d H:i:s') : Carbon::now()->format('Y-m-d H:i:s');
                    $dataInsertGudang = [
                        'product_id' => $item->product_id,
                        'warehouse_id' => $purchase->warehouse_id,
                        'toko_id' => null,
                        'unit_id' => $item->unit_id,
                        'date' => $dateValue,
                        'type' => StockCard::TYPE_IN,
                        'qty' => $qtyGudangKg,
                        'saldo' => $saldoBaru,
                        'note' => 'Pembelian #' . $purchase->id,
                        'user_id' => $purchase->user_id,
                    ];
                    Log::info('[StockCardService] Insert StockCard Gudang', $dataInsertGudang);
                    StockCard::create($dataInsertGudang);
                    $inserted = true;
                }
                // Jika ada toko_id, catat untuk toko dengan qty_toko
                if ($purchase->toko_id && isset($item->qty_toko) && $item->qty_toko > 0) {
                    $qtyTokoKg = $item->qty_toko * $conversion;

                    Log::debug('[StockCardService] Debug toko_id sebelum insert', [
                        'purchase_id' => $purchase->id,
                        'toko_id' => $purchase->toko_id,
                        'qty_toko' => $item->qty_toko
                    ]);
                    $lastCard = StockCard::where('product_id', $item->product_id)
                        ->where('toko_id', $purchase->toko_id)
                        ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                    $saldoLama = $lastCard?->saldo ?? 0;
                    $saldoBaru = $saldoLama + $qtyTokoKg;
                    $dataInsertToko = [
                        'product_id' => $item->product_id,
                        'warehouse_id' => null,
                        'toko_id' => $purchase->toko_id,
                        'unit_id' => $item->unit_id,
                        'date' => $dateValue,
                        'type' => StockCard::TYPE_IN,
                        'qty' => $qtyTokoKg,
                        'saldo' => $saldoBaru,
                        'note' => 'Pembelian #' . $purchase->id,
                        'user_id' => $purchase->user_id,
                    ];
                    Log::info('[StockCardService] Insert StockCard Toko', $dataInsertToko);
                    StockCard::create($dataInsertToko);
                    $inserted = true;
                }
                if (!$inserted) {
                    Log::warning('[StockCardService] Tidak ada toko_id atau warehouse_id pada purchase', [
                        'purchase_id' => $purchase->id
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Gagal mencatat kartu stok dari pembelian', [
                'purchase_id' => $purchase->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Catat pergerakan stok keluar berdasarkan transaksi penjualan
     */
    public static function recordOutFromTransaction($transaction, $consumptions = [])
    {
        try {
            Log::info('[StockCardService] recordOutFromTransaction called', [
                'transaction_id' => $transaction->id,
                'warehouse_id' => $transaction->warehouse_id,
                'toko_id' => $transaction->toko_id,
                'items' => $transaction->details->toArray(),
            ]);

            foreach ($transaction->details as $detail) {
                $unit = $detail->unit;
                $conversion = $unit?->conversion_to_kg ?? 1;
                $qtyKg = $detail->qty * $conversion;

                $inserted = false;

                // Prefer toko if we can infer a toko_id from consumptions, otherwise fallback to transaction/detail/stockmovement
                $consKey = $detail->id;
                $consInfo = $consumptions[$consKey] ?? null;
                $tokoCandidate = $consInfo['toko_id'] ?? ($transaction->toko_id ?? ($detail->toko_id ?? null));
                if (!$tokoCandidate) {
                    // try to infer from StockMovement records linked to this transaction and product
                    try {
                        $tokoCandidate = \App\Models\StockMovement::where('reference_type', 'Transaction')
                            ->where('reference_id', $transaction->id)
                            ->where('product_id', $detail->product_id)
                            ->whereNotNull('toko_id')
                            ->orderBy('id', 'desc')
                            ->value('toko_id');
                    } catch (\Throwable $_) {
                        $tokoCandidate = null;
                    }
                }

                $dateValue = $transaction->created_at ? Carbon::parse($transaction->created_at)->format('Y-m-d H:i:s') : Carbon::now()->format('Y-m-d H:i:s');

                // If consumption info indicates split source (store and warehouse), create two StockCard rows
                if ($consInfo) {
                    $consStoreKg = floatval($consInfo['consumed_store_kg'] ?? 0);
                    $consWarehouseKg = floatval($consInfo['consumed_warehouse_kg'] ?? 0);
                    // store part
                    if ($consStoreKg > 0) {
                        $lastCard = StockCard::where('product_id', $detail->product_id)
                            ->where('toko_id', $consInfo['toko_id'])
                            ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                        $saldoLama = $lastCard?->saldo ?? 0;
                        $saldoBaru = $saldoLama - $consStoreKg;
                        $dataStore = [
                            'product_id' => $detail->product_id,
                            'warehouse_id' => null,
                            'toko_id' => $consInfo['toko_id'],
                            'unit_id' => $detail->unit_id,
                            'date' => $dateValue,
                            'type' => StockCard::TYPE_OUT,
                            'qty' => $consStoreKg,
                            'saldo' => $saldoBaru,
                            'note' => 'Penjualan #' . $transaction->id,
                            'user_id' => $transaction->created_by ?? $transaction->user_id ?? null,
                        ];
                        Log::info('[StockCardService] Insert StockCard Toko (out) from consumption', $dataStore);
                        StockCard::create($dataStore);
                        $inserted = true;
                    }
                    // warehouse part
                    if ($consWarehouseKg > 0) {
                        $lastCard = StockCard::where('product_id', $detail->product_id)
                            ->where('warehouse_id', $consInfo['warehouse_id'])
                            ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                        $saldoLama = $lastCard?->saldo ?? 0;
                        $saldoBaru = $saldoLama - $consWarehouseKg;
                        $dataWh = [
                            'product_id' => $detail->product_id,
                            'warehouse_id' => $consInfo['warehouse_id'],
                            'toko_id' => null,
                            'unit_id' => $detail->unit_id,
                            'date' => $dateValue,
                            'type' => StockCard::TYPE_OUT,
                            'qty' => $consWarehouseKg,
                            'saldo' => $saldoBaru,
                            'note' => 'Penjualan #' . $transaction->id,
                            'user_id' => $transaction->created_by ?? $transaction->user_id ?? null,
                        ];
                        Log::info('[StockCardService] Insert StockCard Gudang (out) from consumption', $dataWh);
                        StockCard::create($dataWh);
                        $inserted = true;
                    }
                } else {
                    // fallback behavior if no consumption info: use tokoCandidate or warehouse
                    if ($tokoCandidate) {
                        $lastCard = StockCard::where('product_id', $detail->product_id)
                            ->where('toko_id', $tokoCandidate)
                            ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                        $saldoLama = $lastCard?->saldo ?? 0;
                        $saldoBaru = $saldoLama - $qtyKg;
                        $dataInsertToko = [
                            'product_id' => $detail->product_id,
                            'warehouse_id' => null,
                            'toko_id' => $tokoCandidate,
                            'unit_id' => $detail->unit_id,
                            'date' => $dateValue,
                            'type' => StockCard::TYPE_OUT,
                            'qty' => $qtyKg,
                            'saldo' => $saldoBaru,
                            'note' => 'Penjualan #' . $transaction->id,
                            'user_id' => $transaction->created_by ?? $transaction->user_id ?? null,
                        ];
                        Log::info('[StockCardService] Insert StockCard Toko (out) inferred', $dataInsertToko);
                        StockCard::create($dataInsertToko);
                        $inserted = true;
                    } elseif ($transaction->warehouse_id) {
                        $lastCard = StockCard::where('product_id', $detail->product_id)
                            ->where('warehouse_id', $transaction->warehouse_id)
                            ->orderBy('created_at', 'desc')->orderBy('id', 'desc')->first();
                        $saldoLama = $lastCard?->saldo ?? 0;
                        $saldoBaru = $saldoLama - $qtyKg;
                        $dataInsertGudang = [
                            'product_id' => $detail->product_id,
                            'warehouse_id' => $transaction->warehouse_id,
                            'toko_id' => null,
                            'unit_id' => $detail->unit_id,
                            'date' => $dateValue,
                            'type' => StockCard::TYPE_OUT,
                            'qty' => $qtyKg,
                            'saldo' => $saldoBaru,
                            'note' => 'Penjualan #' . $transaction->id,
                            'user_id' => $transaction->created_by ?? $transaction->user_id ?? null,
                        ];
                        Log::info('[StockCardService] Insert StockCard Gudang (out) fallback', $dataInsertGudang);
                        StockCard::create($dataInsertGudang);
                        $inserted = true;
                    }
                }

                if (!$inserted) {
                    Log::warning('[StockCardService] Tidak ada toko_id atau warehouse_id pada transaction', [
                        'transaction_id' => $transaction->id
                    ]);
                }
            }
        } catch (\Exception $e) {
            Log::error('Gagal mencatat kartu stok dari transaksi', [
                'transaction_id' => $transaction->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
