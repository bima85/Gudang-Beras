<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\Customer;
use App\Models\Category;
use App\Models\TransactionDetail;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function index()
    {
        $role = session('role');
        // normalize
        $roleNormalized = is_string($role) ? strtolower($role) : null;

        // keep only debug-level logging for role (reduced verbosity)
        Log::debug('DashboardController: role in session', ['role' => $role]);

        // If the logged-in user is a super-admin, always show the standard dashboard
        // regardless of the chosen session role. This ensures super-admins see the
        // full, standard dashboard UI.
        $user = request()->user();
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('super-admin')) {
            $today = Carbon::today();

            $totalTransaksi = Transaction::whereDate('created_at', $today)->count();
            $totalOmzet = Transaction::whereDate('created_at', $today)->sum('grand_total');
            $totalPelanggan = Customer::count();
            $totalProduk = Product::count();

            $omzet7Hari = Transaction::select(DB::raw('DATE(created_at) as tanggal'), DB::raw('SUM(grand_total) as omzet'))
                ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('tanggal')
                ->get();

            $transaksiTerakhir = Transaction::with(['cashier', 'customer'])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();

            $kategoriProduk = [];
            $todayTrx = Transaction::with('details.product.category')
                ->whereDate('created_at', now())
                ->get();
            foreach ($todayTrx as $trx) {
                foreach ($trx->details as $detail) {
                    $cat = $detail->product->category->name ?? '-';
                    if (!isset($kategoriProduk[$cat])) $kategoriProduk[$cat] = 0;
                    $kategoriProduk[$cat] += $detail->qty;
                }
            }

            return inertia('Dashboard/Index', [
                'summary' => [
                    'totalTransaksi' => $totalTransaksi,
                    'totalOmzet' => $totalOmzet,
                    'totalPelanggan' => $totalPelanggan,
                    'totalProduk' => $totalProduk,
                ],
                'omzet7Hari' => $omzet7Hari,
                'transaksiTerakhir' => $transaksiTerakhir,
                'kategoriProduk' => $kategoriProduk,
                'location' => $role,
                'pageTitle' => 'Dashboard',
            ]);
        }

        $today = Carbon::today();

        if ($roleNormalized === 'gudang') {
            // Gudang: Only show incoming goods and stock
            $barangMasukHariIni = TransactionDetail::whereHas('transaction', function ($query) use ($today) {
                $query->whereDate('created_at', $today)->where('type', 'incoming');
            })->get();

            $stokBerasGudang = Product::where('category', 'Beras')->where('location', 'Gudang')->sum('stock');
            $stokBerasToko = Product::where('category', 'Beras')->where('location', 'Toko')->sum('stock');

            // Add logging for debugging
            Log::info('Data Gudang:', [
                'barangMasukHariIni' => $barangMasukHariIni,
                'stokBerasGudang' => $stokBerasGudang,
                'stokBerasToko' => $stokBerasToko,
            ]);

            $warehouses = \App\Models\Warehouse::all();

            return inertia('Dashboard/Gudang', [
                'barangMasukHariIni' => $barangMasukHariIni,
                'stokBerasGudang' => $stokBerasGudang,
                'stokBerasToko' => $stokBerasToko,
                // expose session role so frontend can show the chosen location explicitly
                'location' => $role,
                'warehouses' => $warehouses,
                'pageTitle' => 'Dashboard Gudang',
            ]);
        } elseif ($roleNormalized === 'toko') {
            // Special override: if the logged-in user is a specific admin email,
            // show the Gudang dashboard even if session role is 'toko'. This
            // ensures admin_user@example.test (and admin@example.test) see
            // the gudang-style UI when they select toko.
            $userEmailRaw = request()->user()?->email ?? null;
            $userEmail = is_string($userEmailRaw) ? strtolower(trim($userEmailRaw)) : '';

            // do not log user email by default (privacy); only log when override triggers

            // Use permission/role to decide override. This allows DB/seeders or UI
            // to grant the 'force-gudang-view' permission instead of hardcoding emails.
            $user = request()->user();
            $shouldForceGudang = false;
            if ($user) {
                try {
                    if ($user->hasPermissionTo('force-gudang-view') || $user->hasRole('super-admin')) {
                        $shouldForceGudang = true;
                    }
                } catch (\Exception $e) {
                    // If permission package isn't ready or user model doesn't have trait,
                    // fallback to no override but log for debugging.
                    Log::warning('DashboardController: error checking permissions for override', ['error' => $e->getMessage()]);
                }
            }

            if ($shouldForceGudang) {
                Log::info('DashboardController: overriding toko view for user', ['email' => $userEmail]);
                // reuse gudang data fetch
                $barangMasukHariIni = TransactionDetail::whereHas('transaction', function ($query) use ($today) {
                    $query->whereDate('created_at', $today)->where('type', 'incoming');
                })->get();

                $stokBerasGudang = Product::where('category', 'Beras')->where('location', 'Gudang')->sum('stock');
                $stokBerasToko = Product::where('category', 'Beras')->where('location', 'Toko')->sum('stock');

                $warehouses = \App\Models\Warehouse::all();

                return inertia('Dashboard/Gudang', [
                    'barangMasukHariIni' => $barangMasukHariIni,
                    'stokBerasGudang' => $stokBerasGudang,
                    'stokBerasToko' => $stokBerasToko,
                    'location' => $role,
                    'warehouses' => $warehouses,
                    'pageTitle' => 'Dashboard Toko',
                ]);
            }

            // Toko: Full access to transactions and purchases
            $totalTransaksi = Transaction::whereDate('created_at', $today)->count();
            $totalOmzet = Transaction::whereDate('created_at', $today)->sum('grand_total');
            $totalPelanggan = Customer::count();
            $totalProduk = Product::count();

            // 2. Grafik omzet 7 hari terakhir
            $omzet7Hari = Transaction::select(DB::raw('DATE(created_at) as tanggal'), DB::raw('SUM(grand_total) as omzet'))
                ->where('created_at', '>=', Carbon::now()->subDays(6)->startOfDay())
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy('tanggal')
                ->get();

            // 3. Transaksi terakhir
            $transaksiTerakhir = Transaction::with(['cashier', 'customer'])
                ->orderByDesc('created_at')
                ->limit(10)
                ->get();

            // Kategori produk realtime: hitung jumlah produk per kategori dari transaksi hari ini
            $kategoriProduk = [];
            $todayTrx = Transaction::with('details.product.category')
                ->whereDate('created_at', now())
                ->get();
            foreach ($todayTrx as $trx) {
                foreach ($trx->details as $detail) {
                    $cat = $detail->product->category->name ?? '-';
                    if (!isset($kategoriProduk[$cat])) $kategoriProduk[$cat] = 0;
                    $kategoriProduk[$cat] += $detail->qty;
                }
            }

            return inertia('Dashboard/Index', [
                'summary' => [
                    'totalTransaksi' => $totalTransaksi,
                    'totalOmzet' => $totalOmzet,
                    'totalPelanggan' => $totalPelanggan,
                    'totalProduk' => $totalProduk,
                ],
                'omzet7Hari' => $omzet7Hari,
                'transaksiTerakhir' => $transaksiTerakhir,
                'kategoriProduk' => $kategoriProduk,
                'location' => $role,
                'pageTitle' => 'Dashboard Toko',
            ]);
        }

        return redirect()->route('login')->withErrors(['role' => 'Invalid role.']);
    }
}
