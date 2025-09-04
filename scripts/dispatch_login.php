<?php

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';

// Bootstrap the framework (loads config, DB connections, etc.)
$consoleKernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$consoleKernel->bootstrap();

// Create the HTTP kernel to handle the request
$httpKernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

// Prepare testing DB user - ensure fresh users
User::query()->delete();
$user = User::create([
    'name' => 'Script User',
    'email' => 'script@example.com',
    'email_verified_at' => now(),
    'password' => Hash::make('password'),
]);

// Start session and set CSRF token to avoid VerifyCsrfToken middleware rejecting the POST
$session = $app['session.store'];
$session->start();
$token = bin2hex(random_bytes(16));
$session->put('_token', $token);

// Build request with CSRF token and attach Laravel session
$request = Request::create('/login', 'POST', [
    'email' => 'script@example.com',
    'password' => 'password',
    '_token' => $token,
]);

// Attach the session instance and cookie to the request so middleware recognizes it
$request->setLaravelSession($session);
$request->cookies->set($session->getName(), $session->getId());

$response = $httpKernel->handle($request);

echo "Response status: " . $response->getStatusCode() . "\n";
$body = $response->getContent();
echo "Body length: " . strlen($body) . "\n";

// Dump last 50 lines of log
echo "---- last log lines ----\n";
$lines = array_slice(file('storage/logs/laravel.log'), -50);
foreach ($lines as $l) echo $l;

$httpKernel->terminate($request, $response);
