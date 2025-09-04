<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\Product;
use App\Models\Unit;
use App\Models\WarehouseStock;
use App\Models\StockRequest;

class StockRequestApprovalTest extends TestCase
{
    use RefreshDatabase;

    public function test_approve_creates_transfer_entries()
    {
        // create necessary records without relying on model factories
        $user = User::create(['name' => 'Admin', 'email' => 'admin@example.com', 'password' => bcrypt('password')]);
        // Ensure spatie permission/role exist to allow authorization checks in controller
        if (class_exists(\Spatie\Permission\Models\Permission::class)) {
            try {
                \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'warehouse.manage']);
            } catch (\Exception $e) {
            }
        }
        if (class_exists(\Spatie\Permission\Models\Role::class)) {
            try {
                \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'super-admin']);
            } catch (\Exception $e) {
            }
            try {
                if (method_exists($user, 'assignRole')) $user->assignRole('super-admin');
            } catch (\Exception $e) {
            }
        }

        $warehouse = Warehouse::create(['name' => 'WH1']);
        $toko = Toko::create(['name' => 'Toko 1']);
        $product = Product::create(['name' => 'P1', 'barcode' => 'P1', 'sell_price' => 100, 'buy_price' => 50]);
        $unit = Unit::first();
        if (! $unit) {
            $unit = Unit::create(['name' => 'kg', 'conversion_to_kg' => 1]);
        }

        // seed warehouse stock for product
        WarehouseStock::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'qty_in_kg' => 100,
            'updated_by' => $user->id,
        ]);

        // create a pending stock request
        $req = StockRequest::create([
            'requester_id' => $user->id,
            'from_warehouse_id' => $warehouse->id,
            'to_toko_id' => $toko->id,
            'product_id' => $product->id,
            'unit_id' => $unit->id,
            'qty' => 5,
            'status' => 'pending',
        ]);

        // act as admin and approve via patch route
        $response = $this->actingAs($user)->patchJson(route('stock-requests.update', $req->id), [
            'status' => 'approved',
            'note' => 'approve test',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('stock_requests', ['id' => $req->id, 'status' => 'approved']);
        $this->assertDatabaseHas('stocks', ['product_id' => $product->id, 'warehouse_id' => $warehouse->id, 'qty' => -5]);
        $this->assertDatabaseHas('stok_tokos', ['product_id' => $product->id, 'toko_id' => $toko->id, 'qty' => 5]);
        $this->assertDatabaseHas('surat_jalans', ['warehouse_id' => $warehouse->id, 'toko_id' => $toko->id]);
    }
}
