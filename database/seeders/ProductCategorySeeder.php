<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Product;
use Illuminate\Support\Facades\Log;

class ProductCategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Log::info('Starting ProductCategorySeeder');

        // 1. Create Category: Beras
        $category = Category::firstOrCreate([
            'name' => 'Beras',
        ], [
            'description' => 'Kategori utama produk beras',
            'code' => 'BRS',
        ]);

        Log::info('Category created/found: ' . $category->name);

        // 2. Create Subcategories
        $subcategories = [
            [
                'name' => 'C4',
                'description' => 'Subkategori C4 untuk beras premium',
            ],
            [
                'name' => 'Rojolele',
                'description' => 'Subkategori Rojolele untuk beras aromatik',
            ],
            [
                'name' => 'Rojolele A',
                'description' => 'Subkategori Rojolele A (variant)',
            ],
            [
                'name' => 'Mentik Wangi',
                'description' => 'Subkategori Mentik Wangi untuk beras wangi',
            ],
            [
                'name' => 'Wangi',
                'description' => 'Subkategori Wangi untuk beras beraroma',
            ],
        ];

        $createdSubcategories = [];
        foreach ($subcategories as $subData) {
            // Derive a short code for the subcategory. If the name already looks like a short code (<=3 chars with digits/letters), keep it.
            $derivedCode = preg_replace('/[^A-Za-z0-9]/', '', $subData['name']);
            if (strlen($derivedCode) > 4) {
                // For longer names, take initials up to 4 chars
                $words = preg_split('/\s+/', $subData['name']);
                $initials = '';
                foreach ($words as $w) {
                    $initials .= strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $w), 0, 1));
                    if (strlen($initials) >= 4) break;
                }
                $derivedCode = $initials;
            } else {
                $derivedCode = strtoupper($derivedCode);
            }

            $subcategory = Subcategory::firstOrCreate([
                'name' => $subData['name'],
                'category_id' => $category->id,
            ], [
                'description' => $subData['description'],
                'code' => $derivedCode,
            ]);

            $createdSubcategories[$subData['name']] = $subcategory;
            Log::info('Subcategory created/found: ' . $subcategory->name);
        }

        // 3. Create Products
        $products = [
            [
                'name' => 'Naga Abadi',
                'subcategory' => 'C4',
                'description' => 'Beras premium Naga Abadi kualitas C4',
                'min_stock' => 100,
            ],
            [
                'name' => 'Bengawan',
                'subcategory' => 'C4',
                'description' => 'Beras Bengawan kualitas C4',
                'min_stock' => 100,
            ],
            [
                'name' => 'Patah Dua Doro',
                'subcategory' => 'C4',
                'description' => 'Beras Patah Dua Doro kualitas C4',
                'min_stock' => 100,
            ],
            [
                'name' => 'Rojolele A',
                'subcategory' => 'Rojolele',
                'description' => 'Beras Rojolele A grade premium',
                'min_stock' => 100,
            ],
            [
                'name' => 'Mentik Wangi Kasturi',
                'subcategory' => 'Mentik Wangi',
                'description' => 'Beras Mentik Wangi Kasturi aromatik',
                'min_stock' => 100,
            ],
            [
                'name' => 'Siip',
                'subcategory' => 'C4',
                'description' => 'Beras Siip wangi khas',
                'min_stock' => 100,
            ],
            [
                'name' => 'Bestie ',
                'subcategory' => 'C4',
                'description' => 'Beras Bestie kualitas C4 terbaik',
                'min_stock' => 100,
            ],
            [
                'name' => '10Kg Sip',
                'subcategory' => 'C4',
                'description' => 'Beras 10Kg Sip wangi khas',
                'min_stock' => 100,
            ],
            [
                'name' => 'Naga Bu Remin',
                'subcategory' => 'C4',
                'description' => 'Beras Naga Bu Remin kualitas terbaik',
                'min_stock' => 100,
            ],
            [
                'name' => ' Wangi PT',
                'subcategory' => 'Wangi',
                'description' => 'Beras Wangi Special aroma istimewa',
                'min_stock' => 100,
            ],
            [
                'name' => 'Raja Ramin',
                'subcategory' => 'C4',
                'description' => 'Beras Raja Ramin kualitas C4 unggulan',
                'min_stock' => 100,
            ],
            [
                'name' => 'Panda',
                'subcategory' => 'C4',
                'description' => 'Beras Panda kualitas C4 unggulan',
                'min_stock' => 100,
            ],
            [
                'name' => 'Ikan Dory',
                'subcategory' => 'C4',
                'description' => 'Beras Ikan Dory kualitas C4 unggulan',
                'min_stock' => 100,
            ],
            [
                'name' => 'Siomay',
                'subcategory' => 'C4',
                'description' => 'Beras Siomay kualitas C4 unggulan',
                'min_stock' => 100,
            ],
            [
                'name' => 'Indonesia Biru',
                'subcategory' => 'C4',
                'description' => 'Beras Indonesia Biru kualitas C4 unggulan',
                'min_stock' => 100,
            ],
            [
                'name' => 'Naga Mas Tekad Jadi',
                'subcategory' => 'C4',
                'description' => 'Beras Naga Mas Tekad Jadi kualitas terbaik',
                'min_stock' => 100,
            ],
            [
                'name' => 'WaliSongo',
                'subcategory' => 'C4',
                'description' => 'Beras WaliSongo aroma istimewa',
                'min_stock' => 100,
            ],
            [
                'name' => 'Patah Wangi',
                'subcategory' => 'C4',
                'description' => 'Beras Patah Wangi aroma istimewa',
                'min_stock' => 100,
            ],

        ];

        // Insert or update products (use updateOrCreate to ensure mapping is applied)
        foreach ($products as $productData) {
            if (! isset($createdSubcategories[$productData['subcategory']])) {
                Log::warning('Subcategory not found for product: ' . $productData['name'] . ' -> ' . $productData['subcategory']);
                continue;
            }

            $subcategory = $createdSubcategories[$productData['subcategory']];

            // Build a sanitized product name suffix: remove non-alphanum, capitalize words, concat (e.g., "kelenci" -> "Kelenci", "patah dua doro" -> "PatahDuaDoro")
            $name = trim($productData['name']);
            $nameParts = preg_split('/\s+/', preg_replace('/[^A-Za-z0-9\s]/', '', $name));
            $sanitizedParts = array_map(function ($p) {
                return ucfirst(strtolower($p));
            }, array_filter($nameParts));
            $nameSuffix = implode('', $sanitizedParts);

            // Use category.code and subcategory.code if present; fallback to abbreviations
            $catCode = isset($category->code) && $category->code ? strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $category->code)) : strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $category->name), 0, 3));
            $subCode = isset($subcategory->code) && $subcategory->code ? strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $subcategory->code)) : strtoupper(substr(preg_replace('/[^A-Za-z0-9]/', '', $subcategory->name), 0, 2));

            $barcode = $catCode . $subCode . $nameSuffix;

            $product = Product::updateOrCreate([
                'name' => $productData['name'],
            ], [
                'category_id' => $category->id,
                'subcategory_id' => $subcategory->id,
                'description' => $productData['description'] ?? null,
                'min_stock' => $productData['min_stock'] ?? 100,
                'barcode' => $barcode,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info('Product created/updated: ' . $product->name . ' (Subcategory: ' . $subcategory->name . ')');
        }
    }
}
