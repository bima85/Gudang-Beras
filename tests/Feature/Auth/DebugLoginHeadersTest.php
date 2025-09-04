<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DebugLoginHeadersTest extends TestCase
{
    use RefreshDatabase;

    public function test_debug_login_headers_and_session(): void
    {
        $user = User::factory()->create();

        // First GET the login page to start a session and receive CSRF token
        $this->get('/login');

        $token = $this->app['session']->token();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            '_token' => $token,
        ]);

        // Log response headers and cookies for debugging
        try {
            $headers = $response->headers->all();
            $setCookies = $response->headers->get('set-cookie');
            Log::info('DebugLoginHeadersTest: response headers', ['headers' => $headers, 'set_cookie' => $setCookies]);
        } catch (\Throwable $e) {
            Log::warning('DebugLoginHeadersTest: failed to log response headers', ['error' => $e->getMessage()]);
        }

        // Log session driver and id if available
        try {
            $driver = config('session.driver');
            $sessionId = $this->app['session']->getId();
            $sessionKeys = $this->app['session']->all();
            Log::info('DebugLoginHeadersTest: session info', ['driver' => $driver, 'id' => $sessionId, 'keys' => array_keys($sessionKeys)]);
        } catch (\Throwable $e) {
            Log::warning('DebugLoginHeadersTest: failed to log session info', ['error' => $e->getMessage()]);
        }

        // Keep the test simple: assert we received a redirect (normal login flow)
        $response->assertRedirect();
    }
}
