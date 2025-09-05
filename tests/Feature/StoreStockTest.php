<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\StoreStock;
use App\Models\WarehouseStock;
use App\Models\Product;
use App\Models\Toko;
use App\Models\Warehouse;
use App\Models\User;

class StoreStockTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function stok_toko_index_returns_only_store_stock()
    {
        // Arrange: create product, toko, warehouse, and stocks
        $user = User::factory()->create();

        $product = Product::factory()->create();
        $toko = Toko::factory()->create();
        $warehouse = Warehouse::factory()->create();

        // Create one store stock and one warehouse stock for same product
        StoreStock::create([
            'product_id' => $product->id,
            'toko_id' => $toko->id,
            'qty_in_kg' => 5,
        ]);

        WarehouseStock::create([
            'product_id' => $product->id,
            'warehouse_id' => $warehouse->id,
            'qty_in_kg' => 10,
        ]);

        // Act: hit the stok-toko.index route as an authenticated user
        $response = $this->actingAs($user)->get(route('stok-toko.index'));

        // Assert: response should contain store stock data and not contain warehouse stock entries
        $response->assertStatus(200);
        $response->assertViewHas('storeStocks');

        $viewStocks = $response->original->getData()['storeStocks'];
        $this->assertCount(1, $viewStocks);
        $this->assertEquals($toko->id, $viewStocks->first()->toko_id);
        $this->assertEquals($product->id, $viewStocks->first()->product_id);
    }
}
