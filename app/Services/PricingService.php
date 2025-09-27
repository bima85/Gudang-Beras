<?php

namespace App\Services;

use App\Models\PurchaseItem;
use Illuminate\Support\Collection;

class PricingService
{
   /**
    * Get purchase price for a product from purchase_items last before transaction date.
    * If none found, fall back to provided defaultPurchasePrice.
    *
    * @param int|null $productId
    * @param string|\DateTime $transactionDate Local date string (Y-m-d)
    * @param float|int $defaultPurchasePrice
    * @return float|int
    */
   public static function getPurchasePrice($productId, $transactionDate, $defaultPurchasePrice = 0)
   {
      if (! $productId) {
         return $defaultPurchasePrice;
      }

      // Normalize transaction date: accept null, string Y-m-d, or DateTime/Carbon
      if ($transactionDate instanceof \DateTime) {
         $transactionDate = $transactionDate->format('Y-m-d');
      }

      // Build base query
      $query = PurchaseItem::join('purchases', 'purchase_items.purchase_id', '=', 'purchases.id')
         ->where('purchase_items.product_id', $productId);

      // If a transaction date was provided, try to find the last purchase on or before that date
      if ($transactionDate) {
         $query = $query->whereDate('purchases.purchase_date', '<=', $transactionDate);
      }

      // Order by purchase date descending to get the latest applicable price
      $last = $query->orderByDesc('purchases.purchase_date')
         ->value('purchase_items.harga_pembelian');

      // If found and not empty, return it (cast to numeric). Otherwise return default.
      if ($last !== null && $last !== '') {
         return is_numeric($last) ? ($last + 0) : $defaultPurchasePrice;
      }

      return $defaultPurchasePrice;
   }

   /**
    * Calculate profit per line or aggregated
    */
   public static function calculateProfit($sellingPrice, $purchasePrice, $qty)
   {
      $selling = $sellingPrice ?? 0;
      $buy = $purchasePrice ?? 0;
      $q = $qty ?? 0;
      return (($selling - $buy) * $q);
   }

   /**
    * Calculate margin percentage
    */
   public static function calculateMargin($profit, $grandTotal)
   {
      $g = $grandTotal ?? 0;
      if ($g == 0) return 0;
      return ($profit / $g) * 100;
   }
}
