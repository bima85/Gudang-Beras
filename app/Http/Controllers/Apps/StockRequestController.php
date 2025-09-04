<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\StockRequestCreated;
use App\Notifications\StockRequestStatusChanged;
use App\Models\StockRequest;
use App\Models\WarehouseStock;
use App\Models\StoreStock;
use App\Models\Unit;
use App\Models\SuratJalan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class StockRequestController extends Controller
{
    // List requests - admin view
    public function index(Request $request)
    {
        $user = $request->user();
        if (! $user || (! $user->hasRole('super-admin') && ! $user->hasPermissionTo('warehouse.manage'))) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }
        $requests = StockRequest::with(['requester', 'product', 'fromWarehouse', 'toToko', 'unit'])->orderByDesc('created_at')->get();
        return response()->json(['success' => true, 'data' => $requests]);
    }

    // Store a new request (user)
    public function store(Request $request)
    {
        $user = $request->user();
        if (! $user) return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        $validated = $request->validate([
            'from_warehouse_id' => 'nullable|integer|exists:warehouses,id',
            'to_toko_id' => 'nullable|integer|exists:tokos,id',
            'product_id' => 'required|integer|exists:products,id',
            'unit_id' => 'nullable|integer|exists:units,id',
            'qty' => 'required|numeric|min:0.0001',
            'note' => 'nullable|string|max:1000',
        ]);

        $req = StockRequest::create([
            'requester_id' => $user->id,
            'from_warehouse_id' => $validated['from_warehouse_id'] ?? null,
            'to_toko_id' => $validated['to_toko_id'] ?? null,
            'product_id' => $validated['product_id'],
            'unit_id' => $validated['unit_id'] ?? null,
            'qty' => $validated['qty'],
            'note' => $validated['note'] ?? null,
            'status' => 'pending',
        ]);

        // Notify admins (super-admin or users with warehouse.manage permission)
        try {
            $admins = User::role('super-admin')->get();
            $permUsers = User::permission('warehouse.manage')->get();
            $notifyTo = $admins->concat($permUsers)->unique('id');
            foreach ($notifyTo as $u) {
                try {
                    $u->notify(new StockRequestCreated($req));
                } catch (\Exception $e) {
                }
            }
        } catch (\Exception $e) {
            // ignore notification failures
        }

        return response()->json(['success' => true, 'data' => $req]);
    }

    // Show single request
    public function show($id)
    {
        $req = StockRequest::with(['requester', 'product', 'fromWarehouse', 'toToko', 'unit'])->findOrFail($id);
        $user = request()->user();
        if (! $user || (! $user->hasRole('super-admin') && ! $user->hasPermissionTo('warehouse.manage'))) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }
        return response()->json(['success' => true, 'data' => $req]);
    }

    // Update (approve/reject)
    public function update(Request $request, $id)
    {
        $req = StockRequest::findOrFail($id);
        $user = $request->user();
        if (! $user || (! $user->hasRole('super-admin') && ! $user->hasPermissionTo('warehouse.manage'))) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,rejected',
            'note' => 'nullable|string|max:1000',
        ]);
        // perform approve flow inside DB transaction to ensure stock moves are atomic
        DB::beginTransaction();
        try {
            $req->status = $validated['status'];
            $req->note = $validated['note'] ?? $req->note;
            if ($validated['status'] === 'approved') {
                $req->approved_by = $request->user()->id;
                $req->approved_at = now();

                // perform stock movement: warehouse -> toko
                // require from_warehouse_id and to_toko_id and unit_id for transfer
                if (! $req->from_warehouse_id || ! $req->to_toko_id) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'from_warehouse_id and to_toko_id required to approve transfer'], 422);
                }

                if (! $req->unit_id) {
                    // try to fallback to unit named 'kg'
                    $unitKg = Unit::where('name', 'kg')->first();
                    if (! $unitKg) {
                        DB::rollBack();
                        Log::error('[StockRequestController] missing kg unit fallback when approving request', ['request_id' => $req->id]);
                        return response()->json(['success' => false, 'message' => 'Unit is required for transfer and no kg unit found'], 422);
                    }
                    $req->unit_id = $unitKg->id;
                }

                // compute available in warehouse for the requested unit
                $warehouseAvailable = WarehouseStock::where('product_id', $req->product_id)
                    ->where('warehouse_id', $req->from_warehouse_id)
                    ->where('unit_id', $req->unit_id)
                    ->sum('qty');

                if ($warehouseAvailable < $req->qty) {
                    DB::rollBack();
                    return response()->json(['success' => false, 'message' => 'Stok gudang tidak cukup untuk memenuhi permintaan'], 422);
                }

                // create warehouse out Stock entry (kg-only using helper)
                \App\Services\StockKgService::createWarehouseStock([
                    'product_id' => $req->product_id,
                    'unit_id' => $req->unit_id,
                    'warehouse_id' => $req->from_warehouse_id,
                    'qty' => $req->qty,
                    'type' => 'out',
                    'note' => 'Transfer ke toko via permintaan stok #' . $req->id,
                    'user_id' => $request->user()->id,
                ]);

                // create toko stock in (kg-only)
                \App\Services\StockKgService::createTokoStock([
                    'product_id' => $req->product_id,
                    'toko_id' => $req->to_toko_id,
                    'unit_id' => $req->unit_id,
                    'qty' => $req->qty,
                    'type' => 'in',
                    'note' => 'Transfer dari gudang via permintaan stok #' . $req->id,
                    'user_id' => $request->user()->id,
                ]);

                // create a SuratJalan record to represent the transfer (optional)
                try {
                    SuratJalan::create([
                        'transaction_id' => null,
                        'warehouse_id' => $req->from_warehouse_id,
                        'toko_id' => $req->to_toko_id,
                        'user_id' => $request->user()->id,
                        'no_surat' => 'REQ-SJ-' . now()->format('YmdHis') . '-' . $req->id,
                        'notes' => 'Auto-created dari persetujuan permintaan stok #' . $req->id,
                        'status' => 'pending',
                    ]);
                } catch (\Exception $e) {
                    // non-fatal: log and continue
                    Log::warning('Gagal membuat SuratJalan otomatis untuk stock request #' . $req->id . ': ' . $e->getMessage());
                }
            }

            $req->save();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve/transfer stock request: ' . $e->getMessage(), ['id' => $req->id]);
            return response()->json(['success' => false, 'message' => 'Gagal memproses persetujuan: ' . $e->getMessage()], 500);
        }

        // notify requester about status change
        try {
            $requester = $req->requester;
            if ($requester) {
                $requester->notify(new StockRequestStatusChanged($req));
            }
        } catch (\Exception $e) {
            // ignore
        }

        return response()->json(['success' => true, 'data' => $req]);
    }
}
