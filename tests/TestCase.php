<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    protected function setUp(): void
    {
        parent::setUp();

        // Disable CSRF verification for feature tests so POST requests in tests
        // don't get rejected with 419 while keeping session and other middleware.
        $this->withoutMiddleware(\Illuminate\Foundation\Http\Middleware\VerifyCsrfToken::class);

        // Also disable the custom StoreRoleMiddleware during tests because it
        // mutates session/request lifecycle and can interfere with auth-based
        // assertions in feature tests.
        $this->withoutMiddleware(\App\Http\Middleware\StoreRoleMiddleware::class);

        // Start the session for tests so controllers can call $request->session()
        // without encountering "Session store not set on request." runtime errors.
        if (method_exists($this, 'startSession')) {
            $this->startSession();
        }

        // Ensure tests use the file session driver so session data is written
        // to disk during the test lifecycle. This helps assertions that rely
        // on session persistence across requests.
        config(['session.driver' => 'file']);

        // Clear any existing session files to avoid stale data between tests.
        try {
            $sessionDir = storage_path('framework/sessions');
            if (is_dir($sessionDir)) {
                foreach (glob($sessionDir . '/*') as $file) {
                    // keep .gitignore
                    if (basename($file) === '.gitignore') {
                        continue;
                    }

                    if (is_file($file)) {
                        @unlink($file);
                    }
                }
            }
        } catch (\Throwable $e) {
            // Don't fail tests due to cleanup errors; log for debugging.
            \Illuminate\Support\Facades\Log::warning('TestCase: failed to clear session files', ['error' => $e->getMessage()]);
        }
    }
}
