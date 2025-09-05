<?php
// tmp tinker script to approve latest stock_request
$app = require __DIR__ . '/vendor/autoload.php';
// Use artisan tinker style bootstrap
// But we will run this file through `php artisan tinker < tmp_tinker_approve.php` so it shares the framework context

$r = DB::table('stock_requests')->orderByDesc('id')->first();
if (!$r) {
    echo "NO_REQUEST\n";
    exit;
}
$user = App\Models\User::first();
$controller = app()->make(App\Http\Controllers\Apps\StockRequestController::class);
$req = new Illuminate\Http\Request(['status' => 'approved', 'note' => 'approved via tmp script']);
$req->setUserResolver(function () use ($user) {
    return $user;
});
$res = $controller->update($req, $r->id);
echo $res->getContent() . "\n";

// show last stocks and stok_tokos and surat_jalans summary
echo "STOCKS:" . json_encode(DB::table('stocks')->orderByDesc('id')->limit(3)->get()) . "\n";
echo "STOK_TOKOS:" . json_encode(DB::table('stok_tokos')->orderByDesc('id')->limit(3)->get()) . "\n";
echo "SURAT_JALANS:" . json_encode(DB::table('surat_jalans')->orderByDesc('id')->limit(3)->get()) . "\n";
