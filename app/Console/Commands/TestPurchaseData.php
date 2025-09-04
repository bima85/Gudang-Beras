<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Purchase;
use App\Models\PurchaseItem;
use App\Models\Supplier;
use App\Models\Warehouse;
use App\Models\Toko;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Unit;

class TestPurchaseData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:purchase-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create test purchase data for reports';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating test purchase data...');

        // Create base data first
        $supplier = Supplier::firstOrCreate(['name' => 'PT BERAS'], [
            'name' => 'PT BERAS',
            'contact_person' => 'John Doe',
            'phone' => '081234567890',
            'email' => 'pt.beras@example.com',
            'address' => 'Jakarta'
        ]);

        $warehouse = Warehouse::firstOrCreate(['name' => 'GUDANG_85'], [
            'name' => 'GUDANG_85',
            'address' => 'Gudang Utama'
        ]);

        $toko = Toko::firstOrCreate(['name' => 'TOKO_UTAMA'], [
            'name' => 'TOKO_UTAMA',
            'address' => 'Toko Utama'
        ]);

        $category = Category::firstOrCreate(['name' => 'C4'], [
            'name' => 'C4',
            'description' => 'Category 4'
        ]);

        $subcategory = Subcategory::firstOrCreate(['name' => 'Subcategory 4'], [
            'name' => 'Subcategory 4',
            'category_id' => $category->id
        ]);

        $unit = Unit::firstOrCreate(['name' => 'sak'], [
            'name' => 'sak'
        ]);

        $product = Product::firstOrCreate(['name' => 'Kelinci'], [
            'name' => 'Kelinci',
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'unit_id' => $unit->id,
            'price' => 13997
        ]);

        // Create purchase
        $purchase = Purchase::create([
            'supplier_id' => $supplier->id,
            'warehouse_id' => $warehouse->id,
            'toko_id' => $toko->id,
            'invoice_number' => 'PB-2025/09/03-001',
            'purchase_date' => now(),
            'total' => 69985000,
            'total_pembelian' => 69985000,
            'user_id' => 1
        ]);

        // Create purchase item
        PurchaseItem::create([
            'purchase_id' => $purchase->id,
            'product_id' => $product->id,
            'unit_id' => $unit->id,
            'category_id' => $category->id,
            'subcategory_id' => $subcategory->id,
            'qty' => 200,
            'qty_gudang' => 100,
            'qty_toko' => 100,
            'harga_pembelian' => 13997,
            'subtotal' => 69985000,
            'kuli_fee' => 265000,
            'timbangan' => 10005
        ]);

        $this->info('Test purchase data created successfully!');
        $this->info("Purchase ID: {$purchase->id}");
        $this->info("Invoice: {$purchase->invoice_number}");
    }
}
