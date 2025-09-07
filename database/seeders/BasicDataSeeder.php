<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BasicDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates basic data needed for testing the delivery note system
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Create Categories
            $category = Category::firstOrCreate([
                'name' => 'Beras',
                'image' => 'default-category.jpg',
                'description' => 'Kategori untuk semua jenis beras'
            ]);

            // 2. Create Suppliers
            $supplier = Supplier::firstOrCreate([
                'name' => 'CV. Sumber Beras Utama',
                'phone' => '08123456789',
                'address' => 'Jl. Raya Beras No. 123, Jakarta'
            ]);

            // 3. Create Warehouses
            $warehouse = Warehouse::firstOrCreate([
                'name' => 'Gudang Utama',
                'address' => 'Jl. Industri No. 45, Jakarta Utara',
                'phone' => '021-12345678'
            ]);

            // 4. Create Tokos
            $toko = Toko::firstOrCreate([
                'name' => 'Toko Beras Sejahtera',
                'address' => 'Jl. Pasar Raya No. 12, Jakarta Selatan',
                'phone' => '021-87654321'
            ]);

            // 5. Create Products
            $product = Product::firstOrCreate([
                'name' => 'Beras Premium Grade A',
                'barcode' => 'BERAS001',
                'category_id' => $category->id,
                'purchase_price' => 12000,
                'sell_price' => 15000,
                'stock' => 1000,
                'description' => 'Beras premium grade A kualitas terbaik'
            ]);

            // 6. Create initial warehouse stock
            \App\Models\WarehouseStock::firstOrCreate([
                'product_id' => $product->id,
                'warehouse_id' => $warehouse->id,
                'qty_in_kg' => 500.00, // 500 kg initial stock
                'updated_by' => 1 // Admin user
            ]);

            // 7. Create initial store stock (small amount)
            \App\Models\StoreStock::firstOrCreate([
                'product_id' => $product->id,
                'toko_id' => $toko->id,
                'qty_in_kg' => 50.00, // 50 kg initial stock
                'updated_by' => 1 // Admin user
            ]);

            echo "✅ Basic data seeded successfully:\n";
            echo "   - Category: {$category->name}\n";
            echo "   - Supplier: {$supplier->name}\n";
            echo "   - Warehouse: {$warehouse->name}\n";
            echo "   - Toko: {$toko->name}\n";
            echo "   - Product: {$product->name}\n";
            echo "   - Warehouse Stock: 500 kg\n";
            echo "   - Store Stock: 50 kg\n";
        });
    }
}
