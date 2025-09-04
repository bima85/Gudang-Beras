<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\User;

// load user
$user = User::where('email', 'admin@admin.com')->first();
if (!$user) {
    echo "admin@admin.com not found\n";
    exit(1);
}

// set session role to 'toko' (simulate user selected toko)
$app['session.store']->put('role', 'toko');
// create a request and bind user resolver
$request = Request::create('/dashboard', 'GET');
$request->setUserResolver(function () use ($user) {
    return $user;
});
$app->instance('request', $request);

// call controller
$controller = new App\Http\Controllers\Dashboard\DashboardController();
$response = $controller->index();

// Helper: inspect response type
if ($response instanceof Illuminate\Http\RedirectResponse) {
    echo "Controller returned Redirect: " . $response->getTargetUrl() . "\n";
    exit(0);
}

// Inertia responses are instances of \Inertia\Response
if ($response instanceof Inertia\Response) {
    // attempt to get name and props
    $name = method_exists($response, 'getName') ? $response->getName() : (method_exists($response, 'name') ? $response->name() : 'unknown');
    $props = method_exists($response, 'getProps') ? $response->getProps() : (method_exists($response, 'props') ? $response->props() : null);
    echo "Inertia component: " . $name . "\n";
    echo "Controller props:\n";
    echo json_encode($props, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
} else {
    // Some setups return a Symfony Response with content
    echo "Response class: " . get_class($response) . "\n";
    if (method_exists($response, 'getContent')) {
        echo "Content (truncated):\n" . substr($response->getContent(), 0, 2000) . "\n";
    }
}

// Also show what Inertia shared 'auth' would be
$user->load('roles', 'permissions');
$shared = [
    'user' => $user,
    'permissions' => $user->getPermissions(),
    'super' => $user->isSuperAdmin(),
    'location' => $app['session.store']->get('role'),
];

echo "\nShared auth props (approx):\n";
echo json_encode($shared, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
