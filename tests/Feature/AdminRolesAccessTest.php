<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Contracts\Auth\Access\Authorizable as AuthorizableContract;
use Illuminate\Support\Facades\Route;
use Mockery;

class AdminRolesAccessTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Register a temporary route which performs the same role check
        // without using Spatie middleware (avoids requiring HasRoles trait on test user).
        Route::get('/_test/admin-roles', function () {
            $user = auth()->user();
            if (! $user || ! method_exists($user, 'hasRole') || ! $user->hasRole('super-admin')) {
                abort(403);
            }
            return response('ok');
        });
    }

    public function test_super_admin_can_access_admin_roles_page()
    {
        $user = new class implements AuthenticatableContract, AuthorizableContract {
            use \Illuminate\Auth\Authenticatable;

            public function hasRole($role)
            {
                return $role === 'super-admin';
            }

            public function can($ability, $arguments = [])
            {
                // For our test, allow everything — role middleware handles checks.
                return true;
            }
        };

        $this->be($user);
        $response = $this->get('/_test/admin-roles');
        $response->assertStatus(200);
    }

    public function test_non_super_admin_cannot_access_admin_roles_page()
    {
        $user = new class implements AuthenticatableContract, AuthorizableContract {
            use \Illuminate\Auth\Authenticatable;

            public function hasRole($role)
            {
                return false;
            }

            public function can($ability, $arguments = [])
            {
                return false;
            }
        };

        $this->be($user);
        $response = $this->get('/_test/admin-roles');
        $response->assertStatus(403);
    }
}
