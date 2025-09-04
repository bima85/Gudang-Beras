<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LoginLocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_selecting_toko_on_login_sets_session_and_shows_toko_dashboard()
    {
        $user = User::factory()->create([
            'email' => 'admintoko@toko.com',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'Toko',
        ]);

        $this->assertAuthenticatedAs($user);

        // Follow redirect to dashboard and assert successful load and session
        $dashboard = $this->get(route('dashboard', absolute: false));
        $dashboard->assertStatus(200);
        $this->assertEquals('Toko', session('role'));
    }

    public function test_selecting_gudang_on_login_sets_session_and_shows_gudang_dashboard()
    {
        $user = User::factory()->create([
            'email' => 'admin_gudang@example.test',
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'role' => 'Gudang',
        ]);

        $this->assertAuthenticatedAs($user);

        $dashboard = $this->get(route('dashboard', absolute: false));
        $dashboard->assertStatus(200);
        $this->assertEquals('Gudang', session('role'));
    }
}
