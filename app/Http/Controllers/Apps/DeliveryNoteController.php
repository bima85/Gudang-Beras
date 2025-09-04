<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\DeliveryNote;
use App\Models\Product;
use App\Models\Warehouse;
use App\Models\Toko;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

/**
 * Controller untuk mengelola surat jalan (Delivery Notes)
 */
class DeliveryNoteController extends Controller
{
    /**
     * Menampilkan daftar surat jalan dengan filter dan pencarian
     */
    public function index(Request $request)
    {
        // Permission check - mengikuti pattern DeliveryController
        $user = $request->user();
        if (!$user || (!$user->hasPermissionTo('deliveries-access') && !$user->hasRole('super-admin') && !$user->hasAnyRole(['toko', 'gudang']))) {
            abort(403, 'Akses surat jalan otomatis ditolak.');
        }

        $query = DeliveryNote::with([
            'sale:id,invoice,created_at',
            'product:id,name,barcode',
            'warehouse:id,name',
            'toko:id,name',
            'user:id,name'
        ]);

        // Filter berdasarkan status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter berdasarkan tanggal
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        // Filter berdasarkan gudang
        if ($request->filled('warehouse_id')) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        // Filter berdasarkan toko
        if ($request->filled('toko_id')) {
            $query->where('toko_id', $request->toko_id);
        }

        // Pencarian
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('product', function ($subQ) use ($search) {
                    $subQ->where('name', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                })->orWhereHas('sale', function ($subQ) use ($search) {
                    $subQ->where('invoice', 'like', "%{$search}%");
                })->orWhere('notes', 'like', "%{$search}%");
            });
        }

        $deliveryNotes = $query->latest()->paginate(20)->withQueryString();

        // Data untuk filter dropdown
        $warehouses = Warehouse::select('id', 'name')->orderBy('name')->get();
        $tokos = Toko::select('id', 'name')->orderBy('name')->get();
        $statuses = [
            ['value' => 'pending', 'label' => 'Menunggu'],
            ['value' => 'in_transit', 'label' => 'Dalam Perjalanan'],
            ['value' => 'delivered', 'label' => 'Terkirim'],
            ['value' => 'cancelled', 'label' => 'Dibatalkan'],
        ];

        return Inertia::render('Dashboard/DeliveryNotes/Index', [
            'deliveryNotes' => $deliveryNotes,
            'filters' => $request->only(['status', 'date_from', 'date_to', 'warehouse_id', 'toko_id', 'search']),
            'warehouses' => $warehouses,
            'tokos' => $tokos,
            'statuses' => $statuses,
        ]);
    }

    /**
     * Menampilkan detail surat jalan
     */
    public function show(Request $request, DeliveryNote $deliveryNote)
    {
        // Permission check - mengikuti pattern DeliveryController
        $user = $request->user();
        if (!$user || (!$user->hasPermissionTo('deliveries-access') && !$user->hasRole('super-admin') && !$user->hasAnyRole(['toko', 'gudang']))) {
            abort(403, 'Akses surat jalan otomatis ditolak.');
        }

        $deliveryNote->load([
            'sale:id,invoice,created_at,cashier_id,customer_id,grand_total',
            'sale.customer:id,name,no_telp',
            'sale.cashier:id,name',
            'product:id,name,barcode,sell_price',
            'warehouse:id,name,address',
            'toko:id,name,address,phone',
            'user:id,name'
        ]);

        return Inertia::render('Dashboard/DeliveryNotes/Show', [
            'deliveryNote' => $deliveryNote,
        ]);
    }

    /**
     * Update status surat jalan
     */
    public function updateStatus(Request $request, DeliveryNote $deliveryNote)
    {
        // Permission check - mengikuti pattern DeliveryController
        $user = $request->user();
        if (!$user || (!$user->hasPermissionTo('deliveries-access') && !$user->hasRole('super-admin') && !$user->hasAnyRole(['toko', 'gudang']))) {
            abort(403, 'Akses surat jalan otomatis ditolak.');
        }

        $request->validate([
            'status' => 'required|in:pending,in_transit,delivered,cancelled',
            'notes' => 'nullable|string|max:1000',
        ]);

        $updateData = [
            'status' => $request->status,
        ];

        // Jika status diubah ke delivered, set tanggal pengiriman
        if ($request->status === 'delivered') {
            $updateData['delivered_at'] = now();
        }

        // Update notes jika ada
        if ($request->filled('notes')) {
            $updateData['notes'] = $request->notes;
        }

        $deliveryNote->update($updateData);

        return back()->with('success', 'Status surat jalan berhasil diperbarui');
    }

    /**
     * Tandai surat jalan sebagai terkirim
     */
    public function markAsDelivered(Request $request, DeliveryNote $deliveryNote)
    {
        // Permission check - mengikuti pattern DeliveryController
        $user = $request->user();
        if (!$user || (!$user->hasPermissionTo('deliveries-access') && !$user->hasRole('super-admin') && !$user->hasAnyRole(['toko', 'gudang']))) {
            abort(403, 'Akses surat jalan otomatis ditolak.');
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        $deliveryNote->markAsDelivered($request->notes);

        return back()->with('success', 'Surat jalan berhasil ditandai sebagai terkirim');
    }

    /**
     * Hapus surat jalan
     */
    public function destroy(DeliveryNote $deliveryNote)
    {
        // Hanya bisa hapus jika status masih pending
        if ($deliveryNote->status !== 'pending') {
            return back()->with('error', 'Hanya surat jalan dengan status "Menunggu" yang bisa dihapus');
        }

        $deliveryNote->delete();

        return redirect()->route('delivery-notes.index')
            ->with('success', 'Surat jalan berhasil dihapus');
    }

    /**
     * Dashboard/ringkasan surat jalan
     */
    public function dashboard()
    {
        $today = today();

        $stats = [
            'today_total' => DeliveryNote::today()->count(),
            'pending' => DeliveryNote::byStatus('pending')->count(),
            'in_transit' => DeliveryNote::byStatus('in_transit')->count(),
            'delivered_today' => DeliveryNote::byStatus('delivered')->today()->count(),
        ];

        $recentDeliveries = DeliveryNote::with([
            'sale:id,invoice',
            'product:id,name',
            'warehouse:id,name',
            'toko:id,name'
        ])->latest()->limit(10)->get();

        return Inertia::render('Dashboard/DeliveryNotes/Dashboard', [
            'stats' => $stats,
            'recentDeliveries' => $recentDeliveries,
        ]);
    }

    /**
     * Export data surat jalan
     */
    public function export(Request $request)
    {
        // Implementasi export bisa ditambahkan di sini
        // Menggunakan Laravel Excel atau format lainnya

        return back()->with('info', 'Fitur export sedang dalam pengembangan');
    }
}
