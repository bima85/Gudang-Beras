<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// find current toko available for product 28, unit 3, toko 2
$controller = app()->make(\App\Http\Controllers\Apps\TransactionController::class);
$tokoAvailable = (float) \App\Models\StoreStock::where('product_id', 28)->where('unit_id', 3)->where('toko_id', 2)->sum('qty');
$qty = max(1, intval($tokoAvailable) + 10);
$req = Illuminate\Http\Request::create('/', 'POST', ['product_id' => 28, 'unit_id' => 3, 'qty' => $qty, 'pakaiStokToko' => true, 'toko_id' => 2]);
// Resolve to an admin-like user for the simulation. Try id=1 first, then fallback to id=2.
// For testing, force a permissive fake user so permission checks pass.
$req->setUserResolver(function () {
    return new class {
        public $id = 999999;
        public function hasPermissionTo($p)
        {
            return true;
        }
        public function hasRole($r)
        {
            return true;
        }
    };
});
// print which user will be used (for debugging)
$resolved = $req->getUserResolver()();
echo "SIM_USER_ID:" . ($resolved ? ($resolved->id ?? 'obj') : 'null') . PHP_EOL;
// Bind this request into the container so request() helper returns it inside controller
app()->instance('request', $req);
try {
    $resp = $controller->addToCart($req);
    if (is_object($resp) && method_exists($resp, 'getContent')) {
        echo "RESPONSE:\n" . $resp->getContent() . PHP_EOL;
    } else {
        echo "RESPONSE_RAW:\n";
        var_dump($resp);
    }
} catch (\Throwable $e) {
    echo "EXCEPTION: " . get_class($e) . " - " . $e->getMessage() . PHP_EOL;
    echo $e->getTraceAsString() . PHP_EOL;
}
echo "SIM_DONE\n";
