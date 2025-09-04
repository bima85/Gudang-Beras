<?php

namespace App\Services;

use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\DeliveryNote;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\StockMovement;
use App\Helpers\UnitConverter;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Service untuk mengelola update stok saat pembelian dan penjualan
 */
class StockUpdateService
{
    /**
     * Update stok setelah pembelian dengan distribusi ke gudang dan toko
     * 
     * @param int $productId ID produk
     * @param array $distribution ['warehouse' => ['qty' => float, 'unit' => string], 'store' => ['qty' => float, 'unit' => string]]
     * @param int $warehouseId ID gudang
     * @param int $tokoId ID toko
     * @param int $userId ID user
     * @return bool
     */
    public static function updateStockAfterPurchase($productId, $distribution, $warehouseId = null, $tokoId = null, $userId = null)
    {
        try {
            DB::beginTransaction();

            // Update stok gudang jika ada distribusi ke gudang
            if (isset($distribution['warehouse']) && $distribution['warehouse']['qty'] > 0) {
                $warehouseQtyKg = UnitConverter::toKg(
                    $distribution['warehouse']['qty'],
                    $distribution['warehouse']['unit']
                );

                if ($warehouseId) {
                    self::addWarehouseStock($productId, $warehouseId, $warehouseQtyKg, $userId);

                    Log::info('[StockUpdateService] Stok gudang ditambahkan', [
                        'product_id' => $productId,
                        'warehouse_id' => $warehouseId,
                        'qty_kg' => $warehouseQtyKg,
                        'original_qty' => $distribution['warehouse']['qty'],
                        'unit' => $distribution['warehouse']['unit']
                    ]);
                }
            }

            // Update stok toko jika ada distribusi ke toko
            if (isset($distribution['store']) && $distribution['store']['qty'] > 0) {
                $storeQtyKg = UnitConverter::toKg(
                    $distribution['store']['qty'],
                    $distribution['store']['unit']
                );

                if ($tokoId) {
                    self::addStoreStock($productId, $tokoId, $storeQtyKg, $userId);

                    Log::info('[StockUpdateService] Stok toko ditambahkan', [
                        'product_id' => $productId,
                        'toko_id' => $tokoId,
                        'qty_kg' => $storeQtyKg,
                        'original_qty' => $distribution['store']['qty'],
                        'unit' => $distribution['store']['unit']
                    ]);
                }
            }

            DB::commit();
            return true;
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('[StockUpdateService] Gagal update stok setelah pembelian', [
                'error' => $e->getMessage(),
                'product_id' => $productId,
                'distribution' => $distribution
            ]);
            return false;
        }
    }

    /**
     * Update stok setelah penjualan dengan pengecekan stok toko dan gudang
     * 
     * @param int $productId ID produk
     * @param float $qtyNeeded Qty yang dibutuhkan (dalam unit asli)
     * @param string $unit Unit qty
     * @param int $tokoId ID toko
     * @param int $warehouseId ID gudang backup
     * @param int $saleId ID transaksi penjualan
     * @param int $userId ID user
     * @return array ['success' => bool, 'message' => string, 'delivery_note' => DeliveryNote|null]
     */
    public static function updateStockAfterSale($productId, $qtyNeeded, $unit, $tokoId, $warehouseId, $saleId, $userId)
    {
        try {
            $qtyNeededKg = UnitConverter::toKg($qtyNeeded, $unit);

            // Cek stok toko yang tersedia
            $storeStockKg = self::getStoreStockInKg($productId, $tokoId);

            Log::info('[StockUpdateService] Cek stok untuk penjualan', [
                'product_id' => $productId,
                'qty_needed_kg' => $qtyNeededKg,
                'store_stock_kg' => $storeStockKg,
                'toko_id' => $tokoId
            ]);

            DB::beginTransaction();
            // track how much consumed from each source
            $consumedStoreKg = 0;
            $consumedWarehouseKg = 0;

            // Jika stok toko cukup
            if ($storeStockKg >= $qtyNeededKg) {
                self::reduceStoreStock($productId, $tokoId, $qtyNeededKg, $userId, 'Transaction', $saleId);
                $consumedStoreKg = $qtyNeededKg;

                DB::commit();
                return [
                    'success' => true,
                    'message' => 'Stok toko mencukupi, penjualan berhasil',
                    'delivery_note_id' => null,
                    'delivery_note' => null,
                    'consumed_store_kg' => $consumedStoreKg,
                    'consumed_warehouse_kg' => $consumedWarehouseKg,
                    'toko_id' => $tokoId,
                    'warehouse_id' => $warehouseId
                ];
            }

            // Stok toko tidak cukup, cek stok gudang
            $warehouseStockKg = self::getWarehouseStockInKg($productId, $warehouseId);
            $shortageKg = $qtyNeededKg - $storeStockKg;

            Log::info('[StockUpdateService] Stok toko tidak cukup, cek gudang', [
                'shortage_kg' => $shortageKg,
                'warehouse_stock_kg' => $warehouseStockKg,
                'warehouse_id' => $warehouseId
            ]);

            // Jika gudang juga tidak cukup
            if ($warehouseStockKg < $shortageKg) {
                DB::rollback();
                return [
                    'success' => false,
                    'message' => 'Stok tidak mencukupi. Stok toko: ' . number_format($storeStockKg, 2) . ' kg, Stok gudang: ' . number_format($warehouseStockKg, 2) . ' kg. Dibutuhkan: ' . number_format($qtyNeededKg, 2) . ' kg',
                    'delivery_note_id' => null,
                    'delivery_note' => null
                ];
            }

            // Kurangi seluruh stok toko yang ada
            if ($storeStockKg > 0) {
                // consume available store stock
                self::reduceStoreStock($productId, $tokoId, $storeStockKg, $userId, 'Transaction', $saleId);
                $consumedStoreKg = $storeStockKg;
            }

            // Kurangi stok gudang untuk kekurangan
            self::reduceWarehouseStock($productId, $warehouseId, $shortageKg, $userId, 'Transaction', $saleId);
            $consumedWarehouseKg = $shortageKg;

            // Buat delivery note otomatis
            $deliveryNote = DeliveryNote::create([
                'delivery_number' => DeliveryNote::generateDeliveryNumber(),
                'transaction_id' => $saleId,
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'toko_id' => $tokoId,
                'qty_transferred' => UnitConverter::fromKg($shortageKg, $unit), // Qty dalam unit asli
                'unit' => $unit,
                'qty_kg' => $shortageKg,
                'status' => 'pending',
                'notes' => 'Surat jalan otomatis karena stok toko tidak mencukupi',
                'created_by' => $userId,
            ]);

            DB::commit();

            Log::info('[StockUpdateService] Surat jalan otomatis dibuat', [
                'delivery_note_id' => $deliveryNote->id,
                'shortage_kg' => $shortageKg,
                'from_warehouse' => $warehouseId,
                'to_toko' => $tokoId
            ]);

            return [
                'success' => true,
                'message' => 'Penjualan berhasil. Surat jalan otomatis dibuat untuk kekurangan stok dari gudang',
                'delivery_note_id' => $deliveryNote->id,
                'delivery_note' => $deliveryNote,
                'consumed_store_kg' => $consumedStoreKg,
                'consumed_warehouse_kg' => $consumedWarehouseKg,
                'toko_id' => $tokoId,
                'warehouse_id' => $warehouseId
            ];
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('[StockUpdateService] Gagal update stok setelah penjualan', [
                'error' => $e->getMessage(),
                'product_id' => $productId,
                'qty_needed_kg' => $qtyNeededKg ?? 0
            ]);

            return [
                'success' => false,
                'message' => 'Terjadi kesalahan saat memproses stok: ' . $e->getMessage(),
                'delivery_note_id' => null,
                'delivery_note' => null,
                'consumed_store_kg' => $consumedStoreKg ?? 0,
                'consumed_warehouse_kg' => $consumedWarehouseKg ?? 0,
                'toko_id' => $tokoId ?? null,
                'warehouse_id' => $warehouseId ?? null
            ];
        }
    }

    /**
     * Tambah stok gudang
     */
    private static function addWarehouseStock($productId, $warehouseId, $qtyKg, $userId)
    {
        // Gunakan model WarehouseStock yang baru
        $warehouseStock = WarehouseStock::addStock($productId, $warehouseId, $qtyKg, $userId);

        // Update juga total stok produk
        $product = Product::find($productId);
        if ($product) {
            $product->increment('stock', $qtyKg);
        }

        return $warehouseStock;
    }

    /**
     * Tambah stok toko
     */
    private static function addStoreStock($productId, $tokoId, $qtyKg, $userId)
    {
        // Gunakan model StoreStock yang baru untuk tracking per toko
        $storeStock = StoreStock::addStock($productId, $tokoId, $qtyKg, $userId);

        // Update juga total stok produk
        $product = Product::find($productId);
        if ($product) {
            $product->increment('stock', $qtyKg);
        }

        Log::info('[StockUpdateService] Stok toko berhasil ditambahkan', [
            'product_id' => $productId,
            'toko_id' => $tokoId,
            'qty_kg' => $qtyKg,
            'new_store_stock' => $storeStock->qty_in_kg
        ]);

        return $storeStock;
    }

    /**
     * Kurangi stok gudang
     */
    private static function reduceWarehouseStock($productId, $warehouseId, $qtyKg, $userId, $referenceType = null, $referenceId = null)
    {
        // Gunakan model WarehouseStock yang baru
        $warehouseStock = WarehouseStock::reduceStock($productId, $warehouseId, $qtyKg, $userId);

        if (!$warehouseStock) {
            Log::error('[StockUpdateService] Gagal mengurangi stok gudang - stok tidak cukup', [
                'product_id' => $productId,
                'warehouse_id' => $warehouseId,
                'qty_needed' => $qtyKg,
                'available_stock' => WarehouseStock::getStock($productId, $warehouseId)
            ]);
            return false;
        }

        // Update juga total stok produk
        $product = Product::find($productId);
        if ($product) {
            $product->decrement('stock', $qtyKg);
        }

        // Record stock movement for warehouse with optional reference
        try {
            StockMovement::recordMovement(
                $productId,
                $warehouseId,
                'sale',
                -$qtyKg,
                null,
                $referenceType ?? 'Transaction',
                $referenceId ?? null,
                "Penjualan dari stok gudang",
                $userId
            );
        } catch (\Exception $e) {
            Log::error('[StockUpdateService] Gagal mencatat stock movement untuk penjualan gudang', [
                'error' => $e->getMessage(),
                'product_id' => $productId,
                'warehouse_id' => $warehouseId
            ]);
        }

        return $warehouseStock;
    }

    /**
     * Kurangi stok toko
     */
    private static function reduceStoreStock($productId, $tokoId, $qtyKg, $userId, $referenceType = null, $referenceId = null)
    {
        // Gunakan model StoreStock yang baru
        $storeStock = StoreStock::reduceStock($productId, $tokoId, $qtyKg, $userId);

        if (!$storeStock) {
            Log::error('[StockUpdateService] Gagal mengurangi stok toko - stok tidak cukup', [
                'product_id' => $productId,
                'toko_id' => $tokoId,
                'qty_needed' => $qtyKg,
                'available_stock' => StoreStock::getStock($productId, $tokoId)
            ]);
            return false;
        }

        // Update juga total stok produk
        $product = Product::find($productId);
        if ($product) {
            $product->decrement('stock', $qtyKg);
        }

        Log::info('[StockUpdateService] Stok toko berhasil dikurangi', [
            'product_id' => $productId,
            'toko_id' => $tokoId,
            'qty_kg' => $qtyKg,
            'remaining_store_stock' => $storeStock->qty_in_kg
        ]);

        // Record stock movement untuk penjualan dari toko with optional reference
        try {
            StockMovement::recordTokoMovement(
                $productId,
                $tokoId,
                'sale',
                -$qtyKg, // Negative karena pengurangan
                $referenceType ?? 'Transaction',
                $referenceId ?? null,
                'Penjualan dari stok toko',
                $userId
            );
        } catch (\Exception $e) {
            Log::error('[StockUpdateService] Gagal mencatat stock movement untuk penjualan toko', [
                'error' => $e->getMessage(),
                'product_id' => $productId,
                'toko_id' => $tokoId
            ]);
        }

        return $storeStock;
    }

    /**
     * Dapatkan stok gudang dalam kg
     */
    private static function getWarehouseStockInKg($productId, $warehouseId)
    {
        return WarehouseStock::getStock($productId, $warehouseId);
    }

    /**
     * Dapatkan stok toko dalam kg
     */
    private static function getStoreStockInKg($productId, $tokoId)
    {
        return StoreStock::getStock($productId, $tokoId);
    }

    /**
     * Cek ketersediaan stok untuk penjualan
     */
    public static function checkStockAvailability($productId, $qtyNeeded, $unit, $tokoId, $warehouseId)
    {
        $qtyNeededKg = UnitConverter::toKg($qtyNeeded, $unit);
        $storeStockKg = self::getStoreStockInKg($productId, $tokoId);
        $warehouseStockKg = self::getWarehouseStockInKg($productId, $warehouseId);
        $totalAvailable = $storeStockKg + $warehouseStockKg;

        return [
            'available' => $totalAvailable >= $qtyNeededKg,
            'store_stock_kg' => $storeStockKg,
            'warehouse_stock_kg' => $warehouseStockKg,
            'total_available_kg' => $totalAvailable,
            'needed_kg' => $qtyNeededKg,
            'shortage_kg' => max(0, $qtyNeededKg - $totalAvailable),
        ];
    }
}
