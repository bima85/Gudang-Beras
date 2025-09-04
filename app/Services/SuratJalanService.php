<?php

namespace App\Services;

use App\Models\Transaction;
use App\Models\SuratJalan;

class SuratJalanService
{
    /**
     * Create surat jalan for single transaction if it meets the paid rule and none exists.
     * Returns the created SuratJalan or null if none created.
     *
     * @param Transaction $transaction
     * @return SuratJalan|null
     */
    public function createForTransactionIfMissing(Transaction $transaction)
    {
        $paidAmount = ($transaction->cash ?? 0) + ($transaction->deposit_amount ?? 0);
        $isPaid = ($transaction->payment_method !== 'tempo' && ($transaction->grand_total <= 0 || $paidAmount >= $transaction->grand_total));

        $existing = SuratJalan::where('transaction_id', $transaction->id)->first();
        if ($isPaid && !$existing) {
            $surat = SuratJalan::create([
                'transaction_id' => $transaction->id,
                'warehouse_id' => $transaction->warehouse_id,
                'toko_id' => $transaction->toko_id ?? null,
                'user_id' => $transaction->cashier_id ?? 1,
                'no_surat' => 'AUTO-SJ-' . now()->format('YmdHis') . '-' . $transaction->id,
                'notes' => 'Auto-created by SuratJalanService',
                'status' => 'pending',
            ]);
            return $surat;
        }

        return null;
    }

    /**
     * Scan recent transactions and create missing surat jalan where applicable.
     * Returns number of created surat jalan.
     *
     * @param int|null $limit
     * @return int
     */
    public function createMissingForRecentTransactions(?int $limit = null)
    {
        $query = Transaction::with(['customer', 'cashier'])->latest();
        if ($limit) {
            $query->limit($limit);
        }
        $transactions = $query->get();
        $created = 0;
        foreach ($transactions as $t) {
            $res = $this->createForTransactionIfMissing($t);
            if ($res) $created++;
        }
        return $created;
    }
}
