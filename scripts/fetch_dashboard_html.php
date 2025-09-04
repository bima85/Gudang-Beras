<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;

$request = Request::create('/dashboard', 'GET');
// assume admin user
$user = App\Models\User::where('email', 'admin@admin.com')->first();
if ($user) {
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
}

$response = $kernel->handle($request);
$content = $response->getContent();

file_put_contents(__DIR__ . '/dashboard_response.html', $content);

echo "Wrote dashboard_response.html (", strlen($content), " bytes)\n";
