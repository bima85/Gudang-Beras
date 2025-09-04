<?php

namespace App\Http\Controllers;

use App\Models\SuratJalan;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class DeliveryController extends Controller
{
    /**
     * Buat surat jalan untuk transaksi tertentu (oleh gudang/admin)
     */
    public function createForTransaction(Request $request, $transactionId)
    {
        $user = $request->user();
        if (! $user || (! $this->userHasPermissionSafe($user, 'deliveries.create') && ! $user->hasRole('super-admin') && ! $user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Akses pembuatan surat jalan ditolak.'], 403);
        }
        $transaction = Transaction::findOrFail($transactionId);

        // Validasi: hanya boleh membuat surat jalan jika transaksi sudah dibayar
        // Aturan singkat: jika payment_method != 'tempo' -> anggap sudah dibayar
        if ($transaction->payment_method === 'tempo' || ($transaction->grand_total > 0 && $transaction->cash + ($transaction->deposit_amount ?? 0) < $transaction->grand_total)) {
            return response()->json(['success' => false, 'message' => 'Transaksi belum dibayar penuh, tidak boleh membuat surat jalan'], 422);
        }

        $surat = SuratJalan::create([
            'transaction_id' => $transaction->id,
            'warehouse_id' => $transaction->warehouse_id,
            'toko_id' => $request->input('toko_id') ?? $transaction->toko_id,
            'user_id' => $request->user()->id,
            'no_surat' => $request->input('no_surat') ?? 'SJ-' . now()->format('YmdHis'),
            'notes' => $request->input('notes'),
            'status' => 'pending',
        ]);

        // Load related transaction details so frontend can show product/unit/qty
        $surat->load([
            'transaction',
            'transaction.customer',
            'transaction.details',
            'transaction.details.product',
            'transaction.details.unit',
            'toko',
            'user',
        ]);

        return response()->json(['success' => true, 'surat' => $surat]);
    }

    /**
     * Tampilkan detail surat jalan
     */
    public function show($id)
    {
        $surat = SuratJalan::with([
            'transaction',
            'transaction.customer',
            'transaction.details',
            'transaction.details.product',
            'transaction.details.unit',
            'toko',
            'user',
        ])->findOrFail($id);
        // Jika permintaan Inertia (navigasi halaman), kembalikan Inertia view
        if (request()->header('X-Inertia')) {
            return Inertia::render('Dashboard/Deliveries/Show', [
                'surat' => $surat,
            ]);
        }

        return response()->json(['success' => true, 'data' => $surat]);
    }

    /**
     * Tandai surat jalan sebagai sudah diambil/picked oleh karyawan gudang
     */
    public function markPicked(Request $request, $id)
    {
        $user = $request->user();
        if (! $user || (! $this->userHasPermissionSafe($user, 'deliveries.pick') && ! $user->hasRole('super-admin') && ! $user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Akses menandai surat jalan ditolak.'], 403);
        }
        $surat = SuratJalan::findOrFail($id);
        $surat->status = 'picked';
        $surat->user_id = $request->user()->id;
        $surat->picked_at = now();
        $surat->save();

        $surat->load(['transaction', 'transaction.details', 'transaction.details.product', 'transaction.details.unit', 'toko', 'user']);

        return response()->json(['success' => true, 'surat' => $surat]);
    }

    /**
     * Daftar surat jalan (index) untuk ditampilkan di UI
     */
    public function index(Request $request)
    {
        // The Inertia page will call the `data` endpoint to fetch JSON; no need to pass surats here.
        return Inertia::render('Dashboard/Deliveries/Index');
    }

    /**
     * JSON data endpoint untuk konsumsi axios di halaman
     */
    public function data(Request $request)
    {
        $user = $request->user();
        if (! $user || (! $this->userHasPermissionSafe($user, 'deliveries.view') && ! $user->hasRole('super-admin') && ! $user->hasRole('admin'))) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
        }

        $surats = SuratJalan::with([
            'transaction',
            'transaction.customer',
            'transaction.details',
            'transaction.details.product',
            'transaction.details.unit',
            'toko',
            'user',
        ])->latest()->get();
        return response()->json(['success' => true, 'data' => $surats]);
    }

    /**
     * Safe permission check: returns false and logs a warning if permission name doesn't exist
     */
    private function userHasPermissionSafe($user, string $permissionName): bool
    {
        try {
            return $user->hasPermissionTo($permissionName);
        } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
            Log::warning("Missing permission: {$permissionName}", ['exception' => $e->getMessage()]);
            return false;
        } catch (\Throwable $e) {
            Log::warning("Permission check failed: {$permissionName}", ['exception' => $e->getMessage()]);
            return false;
        }
    }
}
