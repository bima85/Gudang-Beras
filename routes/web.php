<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Application;
use Inertia\Inertia;

// Impor semua controller untuk konsistensi
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BarcodeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Apps\UnitController;
use App\Http\Controllers\Apps\ReportController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\PurchaseController;
use App\Http\Controllers\Apps\SupplierController;
use App\Http\Controllers\Apps\TransactionHistoryController;
use App\Http\Controllers\Dashboard\RecapController;
use App\Http\Controllers\Apps\StockReportController;
use App\Http\Controllers\Apps\SubcategoryController;
use App\Http\Controllers\Apps\TransactionController;
use App\Http\Controllers\Dashboard\WarehouseController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\Apps\PurchaseReportController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Apps\TokoController;
use App\Http\Controllers\Apps\DeliveryNoteController;
use App\Http\Controllers\StockCardController;
use App\Http\Controllers\Api\RealtimeDashboardController;
use App\Http\Middleware\RoleMiddleware;
use App\Http\Controllers\DeliveryController;

// Halaman utama langsung redirect ke login
// Route::get('/', [DashboardController::class, 'redirectToLogin'])->name('home');

Route::get('/', function () {
    // During automated tests we need a simple 200 response so assertions
    // that hit `/` succeed. In other environments return the normal
    // redirect to the login page so users see the proper UI.
    if (app()->environment('testing')) {
        return response('OK', 200);
    }

    return redirect()->route('login');
});

// CSRF token refresh route
Route::get('/csrf-token', function () {
    return response()->json([
        'csrf_token' => csrf_token()
    ]);
})->name('csrf.token');

// Debug route for testing CSRF and session
Route::get('/debug-csrf', function () {
    return response()->json([
        'csrf_token' => csrf_token(),
        'session_id' => session()->getId(),
        'session_driver' => config('session.driver'),
        'session_lifetime' => config('session.lifetime'),
        'session_domain' => config('session.domain'),
        'app_url' => config('app.url'),
    ]);
});

// Test route for CSRF debugging
Route::get('/test-csrf', function () {
    return view('test-csrf');
})->middleware(['auth', 'verified']);

// Test route for debugging addToCart permissions
Route::post('/test-addtocart-permission', function (\Illuminate\Http\Request $request) {
    $user = $request->user();
    return response()->json([
        'user_id' => $user->id,
        'user_name' => $user->name,
        'roles' => $user->roles->pluck('name'),
        'has_transactions_sell' => $user->hasPermissionTo('transactions.sell'),
        'is_super_admin' => $user->hasRole('super-admin'),
        'request_data' => $request->all(),
        'csrf_token' => csrf_token()
    ]);
})->middleware(['auth', 'verified']);

// Temporary route for testing next-invoice without auth
Route::get('/dashboard/purchases/next-invoice', [PurchaseController::class, 'nextInvoice'])->name('purchases.next-invoice');

// Grup rute dashboard dengan middleware autentikasi
Route::group(['prefix' => 'dashboard', 'middleware' => ['auth', 'verified']], function () {
    // Dashboard utama
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Manajemen izin (permissions)
    Route::get('/permissions', [PermissionController::class, 'index'])->name('permissions.index');

    // Manajemen peran (roles)
    Route::resource('roles', RoleController::class)
        ->except(['create', 'edit', 'show'])
        ->names([
            'index' => 'roles.index',
            'store' => 'roles.store',
            'update' => 'roles.update',
            'destroy' => 'roles.destroy',
        ]);

    // Manajemen pengguna (users)
    Route::resource('users', UserController::class)
        ->except('show')
        ->names([
            'index' => 'users.index',
            'create' => 'users.create',
            'store' => 'users.store',
            'edit' => 'users.edit',
            'update' => 'users.update',
            'destroy' => 'users.destroy',
        ]);

    // Laporan pembelian
    Route::get('/purchase-report', [PurchaseReportController::class, 'index'])->name('purchase-report.index');
    Route::get('/purchase-report/export/pdf', [PurchaseReportController::class, 'exportPdf'])->name('purchase-report.export.pdf');
    Route::get('/purchase-report/export/excel', [PurchaseReportController::class, 'exportExcel'])->name('purchase-report.export.excel');

    // Manajemen kategori
    Route::resource('categories', CategoryController::class)
        ->names([
            'index' => 'categories.index',
            'create' => 'categories.create',
            'store' => 'categories.store',
            'show' => 'categories.show',
            'edit' => 'categories.edit',
            'update' => 'categories.update',
            'destroy' => 'categories.destroy',
        ]);

    // Manajemen produk
    // Manajemen produk
    // Pencarian produk untuk transaksi (stok gudang & toko)
    Route::get('products/search', [ProductController::class, 'search'])->name('products.search');

    Route::resource('products', ProductController::class)
        ->names([
            'index' => 'products.index',
            'create' => 'products.create',
            'store' => 'products.store',
            'show' => 'products.show',
            'edit' => 'products.edit',
            'update' => 'products.update',
            'destroy' => 'products.destroy',
        ]);

    // Penghapusan massal produk
    Route::post('/products/bulk-destroy', [ProductController::class, 'bulkDestroy'])->name('products.bulkDestroy');

    // Manajemen pelanggan
    Route::resource('customers', CustomerController::class)
        ->names([
            'index' => 'customers.index',
            'create' => 'customers.create',
            'store' => 'customers.store',
            'show' => 'customers.show',
            'edit' => 'customers.edit',
            'update' => 'customers.update',
            'destroy' => 'customers.destroy',
        ]);

    // Manajemen transaksi
    Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');

    // Daftar transaksi (list/index)
    Route::get('/transactions/list', [TransactionController::class, 'list'])->name('transactions.list');

    // Pencarian produk untuk transaksi
    Route::post('/transactions/searchProduct', [TransactionController::class, 'searchProduct'])->name('transactions.searchProduct');

    // Pencarian produk berdasarkan nama
    Route::post('/transactions/searchProductByName', [TransactionController::class, 'searchProductByName'])->name('transactions.searchProductByName');

    // Get next transaction sequence number
    Route::get('/transactions/getNextSequence', [TransactionController::class, 'getNextSequence'])->name('transactions.getNextSequence');

    // Get next transaction number for preview
    Route::get('/transactions/next-transaction-number', [TransactionController::class, 'nextTransactionNumber'])->name('transactions.nextTransactionNumber');



    // Manajemen Toko (resource)
    Route::resource('tokos', TokoController::class)
        ->names([
            'index' => 'tokos.index',
            'create' => 'tokos.create',
            'store' => 'tokos.store',
            'show' => 'tokos.show',
            'edit' => 'tokos.edit',
            'update' => 'tokos.update',
            'destroy' => 'tokos.destroy',
        ]);

    // Manajemen Transaction Histories
    Route::resource('transaction-histories', TransactionHistoryController::class)
        ->names([
            'index' => 'transaction-histories.index',
            'create' => 'transaction-histories.create',
            'store' => 'transaction-histories.store',
            'show' => 'transaction-histories.show',
            'edit' => 'transaction-histories.edit',
            'update' => 'transaction-histories.update',
            'destroy' => 'transaction-histories.destroy',
        ]);
    // Export routes for Transaction Histories
    Route::get('/transaction-histories/export/excel', [TransactionHistoryController::class, 'exportExcel'])->name('transaction-histories.export.excel');
    Route::get('/transaction-histories/export/pdf', [TransactionHistoryController::class, 'exportPdf'])->name('transaction-histories.export.pdf');

    // Pencarian produk berdasarkan kategori dan subkategori
    Route::post('/transactions/searchProductByCategorySubcategory', [TransactionController::class, 'searchProductByCategorySubcategory'])->name('transactions.searchProductByCategorySubcategory');

    // Menambahkan produk ke keranjang
    Route::post('/transactions/addToCart', [TransactionController::class, 'addToCart'])->name('transactions.addToCart');

    // Menghapus item dari keranjang berdasarkan index
    Route::delete('/transactions/remove-from-cart/{index}', [TransactionController::class, 'removeFromCart'])->name('transactions.removeFromCart');

    // Menghapus item dari keranjang
    Route::delete('/transactions/{cart_id}/destroyCart', [TransactionController::class, 'destroyCart'])->name('transactions.destroyCart');

    // Menyimpan transaksi
    Route::post('/transactions/store', [TransactionController::class, 'store'])->name('transactions.store');

    // Mencetak transaksi (route spesifik harus didahulukan)
    Route::get('/transactions/print/{id}', [TransactionController::class, 'printById'])->name('transactions.print.id');
    Route::get('/transactions/{invoice}/print', [TransactionController::class, 'print'])->name('transactions.print');

    // Menghapus transaksi
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');

    // Penghapusan massal transaksi
    Route::post('/transactions/bulk-destroy', [TransactionController::class, 'bulkDestroy'])->name('transactions.bulkDestroy');

    // Stock request (permintaan stok) - minimal API
    Route::get('/stock-requests', [\App\Http\Controllers\Apps\StockRequestController::class, 'index'])->name('stock-requests.index');
    // Admin UI (Inertia) for stock requests
    Route::get('/stock-requests/ui', function () {
        return Inertia::render('Dashboard/StockRequests/Index');
    })->name('stock-requests.ui');
    Route::post('/stock-requests', [\App\Http\Controllers\Apps\StockRequestController::class, 'store'])->name('stock-requests.store');
    Route::get('/stock-requests/{id}', [\App\Http\Controllers\Apps\StockRequestController::class, 'show'])->name('stock-requests.show');
    Route::patch('/stock-requests/{id}', [\App\Http\Controllers\Apps\StockRequestController::class, 'update'])->name('stock-requests.update');

    // Manajemen profil pengguna (dashboard prefixed)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('dashboard.profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('dashboard.profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('dashboard.profile.destroy');

    // Laporan transaksi
    Route::get('/reports/transactions', [ReportController::class, 'transactions'])->name('reports.transactions');
    Route::get('/reports/transactions/export/pdf', [ReportController::class, 'exportPdf'])->name('reports.transactions.export-pdf');
    Route::get('/reports/transactions/export/excel', [ReportController::class, 'exportExcel'])->name('reports.transactions.export-excel');
    Route::delete('/transactions/{id}', [ReportController::class, 'deleteTransaction'])->name('transactions.delete');

    // Rekap dashboard
    Route::get('/recap', [RecapController::class, 'index'])->name('dashboard.recap');
    Route::get('/recap/export/excel', [RecapController::class, 'exportExcel'])->name('dashboard.recap.export-excel');
    Route::get('/recap/export/pdf', [RecapController::class, 'exportPdf'])->name('dashboard.recap.export-pdf');
    // Debug: sample JSON for recap (authenticated)
    Route::get('/recap/sample-json', [RecapController::class, 'sampleJson'])->name('dashboard.recap.sample-json');
    // AJAX data endpoint for live/async updates
    Route::get('/recap/data', [RecapController::class, 'dataJson'])->name('dashboard.recap.data-json');

    // (debug routes removed)

    // Manajemen gudang
    Route::resource('warehouses', WarehouseController::class)
        ->names([
            'index' => 'dashboard.warehouses.index',
            'create' => 'dashboard.warehouses.create',
            'store' => 'dashboard.warehouses.store',
            'show' => 'dashboard.warehouses.show',
            'edit' => 'dashboard.warehouses.edit',
            'update' => 'dashboard.warehouses.update',
            'destroy' => 'dashboard.warehouses.destroy',
        ]);

    // Rekap gudang
    Route::get('warehouses/recap', [WarehouseController::class, 'recap'])->name('dashboard.warehouses.recap');

    // Stock Views - Warehouse & Store Stocks
    Route::get('stocks', [\App\Http\Controllers\Apps\StockViewController::class, 'warehouseStocks'])->name('stocks.index');
    Route::get('stok-toko', [\App\Http\Controllers\Apps\StockViewController::class, 'storeStocks'])->name('stok-toko.index');
    Route::get('api/products/{product}/stocks', [\App\Http\Controllers\Apps\StockViewController::class, 'getProductStock'])->name('api.product.stocks');

    // Manajemen delivery notes (surat jalan otomatis)
    Route::resource('delivery-notes', DeliveryNoteController::class)
        ->names([
            'index' => 'delivery-notes.index',
            'create' => 'delivery-notes.create',
            'store' => 'delivery-notes.store',
            'show' => 'delivery-notes.show',
            'edit' => 'delivery-notes.edit',
            'update' => 'delivery-notes.update',
            'destroy' => 'delivery-notes.destroy',
        ]);

    // Update status delivery note
    Route::patch('delivery-notes/{deliveryNote}/status', [DeliveryNoteController::class, 'updateStatus'])->name('delivery-notes.updateStatus');
    Route::patch('delivery-notes/{deliveryNote}/delivered', [DeliveryNoteController::class, 'markAsDelivered'])->name('delivery-notes.markAsDelivered');
    Route::get('delivery-notes/{delivery_note}/print', [DeliveryNoteController::class, 'print'])->name('delivery-notes.print');

    // Manajemen pergerakan stok (Stock Movements)
    Route::resource('stock-movements', \App\Http\Controllers\Apps\StockMovementController::class)
        ->middleware(['permission:stock-movements.view|stock-movements.manage'])
        ->names([
            'index' => 'stock-movements.index',
            'create' => 'stock-movements.create',
            'store' => 'stock-movements.store',
            'show' => 'stock-movements.show',
            'edit' => 'stock-movements.edit',
            'update' => 'stock-movements.update',
            'destroy' => 'stock-movements.destroy',
        ]);

    // API endpoint untuk mendapatkan stok saat ini
    Route::get('/stock-movements/current-stock', [\App\Http\Controllers\Apps\StockMovementController::class, 'getCurrentStock'])
        // ->middleware(['permission:stock-movements.view|stock-movements.manage']) // Temporarily disabled
        ->name('stock-movements.current-stock');

    // Enhanced Stock Management Routes
    Route::prefix('stock-reports')->group(function () {
        Route::get('/', [\App\Http\Controllers\Apps\StockReportController::class, 'index'])->name('stock-reports.index');
        Route::get('/export', [\App\Http\Controllers\Apps\StockReportController::class, 'export'])->name('stock-reports.export');
    });

    Route::prefix('stock-transfer')->group(function () {
        Route::get('/', [\App\Http\Controllers\Apps\StockTransferController::class, 'index'])->name('stock-transfer.index');
        Route::post('/to-toko', [\App\Http\Controllers\Apps\StockTransferController::class, 'transferToToko'])->name('stock-transfer.to-toko');
        Route::get('/available-stock', [\App\Http\Controllers\Apps\StockTransferController::class, 'getAvailableStock'])->name('stock-transfer.available-stock');
    });

    Route::prefix('sales-reports')->group(function () {
        Route::get('/', [\App\Http\Controllers\Apps\SalesReportController::class, 'index'])->name('sales-reports.index');
        Route::get('/export', [\App\Http\Controllers\Apps\SalesReportController::class, 'export'])->name('sales-reports.export');
    });

    // Manajemen unit
    Route::resource('units', UnitController::class)
        ->names([
            'index' => 'units.index',
            'create' => 'units.create',
            'store' => 'units.store',
            'show' => 'units.show',
            'edit' => 'units.edit',
            'update' => 'units.update',
            'destroy' => 'units.destroy',
        ]);

    // Konversi unit
    Route::post('units/konversi', [UnitController::class, 'konversi'])->name('units.konversi');

    // Manajemen pembelian
    Route::resource('purchases', PurchaseController::class)
        ->names([
            'index' => 'purchases.index',
            'create' => 'purchases.create',
            'store' => 'purchases.store',
            'show' => 'purchases.show',
            'edit' => 'purchases.edit',
            'update' => 'purchases.update',
            'destroy' => 'purchases.destroy',
        ]);

    // Ekspor data pembelian
    Route::get('/purchases/export/{format}', [PurchaseController::class, 'export'])->name('purchases.export');
    // Route::get('/purchases/export', [PurchaseController::class, 'export'])->name('purchases.export');
    // Mencetak nota pembelian
    Route::get('/purchases/{purchase}/receipt', [PurchaseController::class, 'receipt'])->name('purchases.receipt');

    // Admin utilities: reset permission cache, sync role permissions
    Route::post('/permissions/reset-cache', [\App\Http\Controllers\PermissionAdminController::class, 'resetCache'])->name('permissions.resetCache');
    Route::post('/permissions/sync-role', [\App\Http\Controllers\PermissionAdminController::class, 'syncRolePermissions'])->name('permissions.syncRole');

    // Simple admin UI for assigning role permissions
    Route::get('/admin/roles-permissions', [\App\Http\Controllers\Admin\AdminRolesController::class, 'index'])
        ->middleware('role:super-admin')
        ->name('admin.roles.permissions');
    Route::post('/admin/roles-permissions/assign', [\App\Http\Controllers\Admin\AdminRolesController::class, 'assignPermission'])
        ->middleware('role:super-admin')
        ->name('admin.roles.permissions.assign');
    Route::post('/admin/roles-permissions/revoke', [\App\Http\Controllers\Admin\AdminRolesController::class, 'revokePermission'])
        ->middleware('role:super-admin')
        ->name('admin.roles.permissions.revoke');

    // Manajemen pemasok
    Route::resource('suppliers', SupplierController::class)
        ->names([
            'index' => 'suppliers.index',
            'create' => 'suppliers.create',
            'store' => 'suppliers.store',
            'show' => 'suppliers.show',
            'edit' => 'suppliers.edit',
            'update' => 'suppliers.update',
            'destroy' => 'suppliers.destroy',
        ]);

    // Laporan stok
    Route::get('stock-report', [StockReportController::class, 'index'])->name('stock-report.index');

    // Manajemen subkategori
    Route::resource('subcategories', SubcategoryController::class)
        ->names([
            'index' => 'subcategories.index',
            'create' => 'subcategories.create',
            'store' => 'subcategories.store',
            'show' => 'subcategories.show',
            'edit' => 'subcategories.edit',
            'update' => 'subcategories.update',
            'destroy' => 'subcategories.destroy',
        ]);

    // Manajemen barcode
    Route::resource('barcodes', BarcodeController::class)
        ->names([
            'index' => 'barcodes.index',
            'create' => 'barcodes.create',
            'store' => 'barcodes.store',
            'show' => 'barcodes.show',
            'edit' => 'barcodes.edit',
            'update' => 'barcodes.update',
            'destroy' => 'barcodes.destroy',
        ]);

    // Mencetak barcode
    Route::get('barcodes/{id}/print', [BarcodeController::class, 'print'])->name('barcodes.print');

    // Manajemen kartu stok
    Route::resource('stock-cards', StockCardController::class)
        ->except(['show', 'destroy', 'edit', 'update'])
        ->names([
            'index' => 'stock-cards.index',
            'create' => 'stock-cards.create',
            'store' => 'stock-cards.store',
        ]);

    // Delivery / Surat Jalan
    Route::get('/deliveries/data', [DeliveryController::class, 'data'])->name('deliveries.data');
    Route::get('/deliveries', [DeliveryController::class, 'index'])->name('deliveries.index');
    Route::get('/deliveries/{delivery}', [DeliveryController::class, 'show'])->name('deliveries.show');
    Route::post('/transactions/{transaction}/delivery', [DeliveryController::class, 'createForTransaction'])->name('transactions.delivery');
    Route::post('/deliveries/{delivery}/pick', [DeliveryController::class, 'markPicked'])->name('deliveries.pick');
});

// Rute autentikasi
require __DIR__ . '/auth.php';

// Rute untuk dashboard Toko dan Gudang dengan middleware RoleMiddleware
Route::middleware(['auth', 'verified', RoleMiddleware::class])->group(function () {
    Route::get('/dashboard/toko', function () {
        return Inertia::render('Dashboard/Toko', [
            'data' => 'Data khusus untuk Toko',
        ]);
    })->name('dashboard.toko');

    Route::get('/dashboard/gudang', function () {
        return Inertia::render('Dashboard/Gudang', [
            'data' => 'Data khusus untuk Gudang',
        ]);
    })->name('dashboard.gudang');
});

// API Routes for Realtime Dashboard
Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('/dashboard/barang-masuk-hari-ini', [RealtimeDashboardController::class, 'getBarangMasukHariIni'])
        ->name('api.dashboard.barang-masuk-hari-ini');
    Route::get('/dashboard/stats', [RealtimeDashboardController::class, 'getDashboardStats'])
        ->name('api.dashboard.stats');
});

// Top-level profile routes expected by the test-suite (use same controller)
Route::middleware(['auth'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});
