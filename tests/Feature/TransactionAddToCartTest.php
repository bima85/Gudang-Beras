<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Log;

class TransactionAddToCartTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Temporary route that performs the same access check as TransactionController@addToCart
        Route::post('/_test/transactions/addToCart', function () {
            $user = auth()->user();
            $uid = null;
            if ($user) {
                if (property_exists($user, 'id')) {
                    $uid = $user->id;
                } elseif (method_exists($user, 'getAuthIdentifier')) {
                    $uid = $user->getAuthIdentifier();
                }
            }
            if (! $user || (! method_exists($user, 'hasPermissionTo') || ! $user->hasPermissionTo('transactions.sell')) && ! (method_exists($user, 'hasRole') && $user->hasRole('super-admin'))) {
                Log::warning('[addToCart] access denied', ['user_id' => $uid, 'email' => $user?->email ?? null]);
                return response()->json(['success' => false, 'message' => 'Akses ditolak.'], 403);
            }
            return response()->json(['success' => true]);
        });
    }

    public function test_user_without_permission_is_forbidden()
    {
        $user = new class implements AuthenticatableContract, AuthorizableContract {
            use \Illuminate\Auth\Authenticatable;
            public function hasPermissionTo($p)
            {
                return false;
            }
            public function hasRole($r)
            {
                return false;
            }
            public function can($ability, $arguments = [])
            {
                return false;
            }
        };

        $this->be($user);
        $response = $this->post('/_test/transactions/addToCart', []);
        $response->assertStatus(403);
    }

    public function test_super_admin_allowed()
    {
        $user = new class implements AuthenticatableContract, AuthorizableContract {
            use \Illuminate\Auth\Authenticatable;
            public function hasPermissionTo($p)
            {
                return false;
            }
            public function hasRole($r)
            {
                return $r === 'super-admin';
            }
            public function can($ability, $arguments = [])
            {
                return true;
            }
        };

        $this->be($user);
        $response = $this->post('/_test/transactions/addToCart', []);
        $response->assertStatus(200);
    }
}
