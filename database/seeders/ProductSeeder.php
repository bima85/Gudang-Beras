<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Create Category
            $category = Category::firstOrCreate([
                'name' => 'Beras'
            ], [
                'description' => 'Kategori utama produk beras',
                'code' => 'BRS',
            ]);

            // Create Subcategories
            $subcategories = [];
            $subcategoryData = [
                'C4' => 'Subkategori C4 untuk beras premium',
                'Rojolele' => 'Subkategori Rojolele untuk beras aromatik',
                'Wangi' => 'Subkategori Wangi untuk beras wangi',
                'Ketan' => 'Subkategori Ketan untuk beras ketan'
            ];

            foreach ($subcategoryData as $name => $description) {
                $subcategories[$name] = Subcategory::firstOrCreate([
                    'name' => $name,
                    'category_id' => $category->id
                ], [
                    'description' => $description
                ]);
            }

            // Suppliers and Products Data
            $suppliersData = [
                [
                    'name' => 'PB Jaya Abadi',
                    'owner' => 'Mbak Dwi Suyatmi Athaya, Mas Harsono',
                    'address' => 'Karang Pandan',
                    'products' => [
                        ['name' => 'Naga Jaya Abadi', 'subcategory' => 'C4'],
                        ['name' => 'Bengawan', 'subcategory' => 'C4'],
                        ['name' => 'Rojolele A', 'subcategory' => 'Rojolele'],
                        ['name' => 'Mentik Wangi Kasturi', 'subcategory' => 'Wangi'],
                        ['name' => 'Patah Dua Doro', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'CV Cakra Adhistara Sejahtera',
                    'owner' => 'Mbak Ayu Sigit Aribowo',
                    'address' => 'Tasikmadu',
                    'products' => [
                        ['name' => 'Prima', 'subcategory' => 'C4'],
                        ['name' => 'Kelinci', 'subcategory' => 'C4'],
                        ['name' => 'Senyum', 'subcategory' => 'C4'],
                        ['name' => 'Patah AY', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Sumber Rejeki',
                    'owner' => 'Pak Sapto Giri (Aufa)',
                    'address' => 'Karang Anyar',
                    'products' => [
                        ['name' => 'Gajah', 'subcategory' => 'C4'],
                        ['name' => 'Hijab', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Gatot Gondangmanis',
                    'owner' => 'Bu Gatot Sumarni',
                    'address' => 'Dompyong Karang Pandan',
                    'products' => [
                        ['name' => 'Lele Barokah', 'subcategory' => 'Rojolele'],
                        ['name' => 'Mentik Gatot', 'subcategory' => 'Wangi'],
                    ]
                ],
                [
                    'name' => 'CV Fortuna (PB Makmur Jaya)',
                    'owner' => 'Bu Winarti, Dr Puji Setiawan',
                    'address' => 'Sragen',
                    'products' => [
                        ['name' => 'Siip', 'subcategory' => 'C4'],
                        ['name' => 'Bestie', 'subcategory' => 'C4'],
                        ['name' => '10kg Sip', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Mitra Tani',
                    'owner' => 'Eko Wahyono Remin',
                    'address' => 'Karang Pandan',
                    'products' => [
                        ['name' => 'Naga Bu Remin', 'subcategory' => 'C4'],
                        ['name' => 'Raja Remin', 'subcategory' => 'C4'],
                        ['name' => 'Wangi PT', 'subcategory' => 'Wangi'],
                    ]
                ],
                [
                    'name' => 'HMI (Himawari Group)',
                    'owner' => 'Setyo Bayu Haji',
                    'address' => 'Sragen',
                    'products' => [
                        ['name' => 'Panda', 'subcategory' => 'C4'],
                        ['name' => 'Ikan Dory', 'subcategory' => 'C4'],
                        ['name' => 'Siomay', 'subcategory' => 'C4'],
                        ['name' => 'Putri Indonesia Biru', 'subcategory' => 'C4'],
                        ['name' => 'Naga Mas Tekad Jadi', 'subcategory' => 'C4'],
                        ['name' => 'WaliSongo', 'subcategory' => 'C4'],
                        ['name' => 'Patah Wangi', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Dewi Ayu',
                    'owner' => 'Pak Wardi, Bu Tri Warsini',
                    'address' => 'Ngrawoh Matesih',
                    'products' => [
                        ['name' => 'Dewi Ayu', 'subcategory' => 'C4'],
                        ['name' => 'Mentik WT', 'subcategory' => 'Wangi'],
                    ]
                ],
                [
                    'name' => 'PB Sapenkec',
                    'owner' => 'Sarwanto Ngiri',
                    'address' => 'Mojolaban',
                    'products' => [
                        ['name' => 'Pacul', 'subcategory' => 'C4'],
                        ['name' => 'Cething Mas', 'subcategory' => 'C4'],
                        ['name' => 'Wangi SW', 'subcategory' => 'Wangi'],
                        ['name' => 'Rijek', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Ladang Mas',
                    'owner' => 'Ambar Nguwer',
                    'address' => 'Sukorejo Sragen',
                    'products' => [
                        ['name' => 'Bambu', 'subcategory' => 'C4'],
                        ['name' => 'Kendil', 'subcategory' => 'C4'],
                        ['name' => 'Naga Mas JK', 'subcategory' => 'C4'],
                        ['name' => 'Patah PAB', 'subcategory' => 'C4'],
                        ['name' => 'Menir', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Mega Perkasa',
                    'owner' => 'Mas Eksan, Mas Daryono',
                    'address' => 'Sragen',
                    'products' => [
                        ['name' => 'Angsa Terbang', 'subcategory' => 'C4'],
                        ['name' => 'Dolphin', 'subcategory' => 'C4'],
                        ['name' => 'Pari Ijo', 'subcategory' => 'C4'],
                        ['name' => 'Anggur', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Salmaira',
                    'owner' => 'Pak Parwitto, Mbak Nanik',
                    'address' => 'Matesih Karang Anyar',
                    'products' => [
                        ['name' => 'KOI', 'subcategory' => 'C4'],
                        ['name' => 'Safira', 'subcategory' => 'C4'],
                        ['name' => 'Dimas', 'subcategory' => 'C4'],
                        ['name' => 'Jago Biru', 'subcategory' => 'C4'],
                        ['name' => 'Lele Hitam', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Citra Abadi Bermartabat',
                    'owner' => 'Pak Joko CAB',
                    'address' => 'Mojogedang',
                    'products' => [
                        ['name' => 'Bengawan CAB', 'subcategory' => 'C4'],
                        ['name' => 'Mbok Ben', 'subcategory' => 'C4'],
                        ['name' => 'Kinclong', 'subcategory' => 'C4'],
                        ['name' => 'Untung', 'subcategory' => 'C4'],
                        ['name' => 'Pandawa', 'subcategory' => 'C4'],
                        ['name' => 'Indokoki', 'subcategory' => 'C4'],
                        ['name' => 'Mentik Semongko', 'subcategory' => 'Wangi'],
                    ]
                ],
                [
                    'name' => 'PB Ragil Nguripi',
                    'owner' => 'Pak Maryadi',
                    'address' => 'Sragen',
                    'products' => [
                        ['name' => 'Bandeng Biru', 'subcategory' => 'C4'],
                        ['name' => 'Bandeng Pink', 'subcategory' => 'C4'],
                        ['name' => 'Patah Polos', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Trisno Makmur',
                    'owner' => 'Mbak Eki Mulyani, Pak Sutrisno',
                    'address' => 'Matesih Karang Pandan',
                    'products' => [
                        ['name' => 'Naga Sandy Putra', 'subcategory' => 'C4'],
                        ['name' => 'Putri Indonesia Hijau', 'subcategory' => 'C4'],
                        ['name' => 'Alpukat', 'subcategory' => 'C4'],
                        ['name' => 'Stobery A', 'subcategory' => 'C4'],
                        ['name' => 'Raja Baru Makmur', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Gantari',
                    'owner' => 'Pak Darto, Yeni Pebriana',
                    'address' => 'Karang Anyar',
                    'products' => [
                        ['name' => 'GNR', 'subcategory' => 'C4'],
                        ['name' => 'Bonsai', 'subcategory' => 'C4'],
                        ['name' => 'Wangi GNR', 'subcategory' => 'Wangi'],
                    ]
                ],
                [
                    'name' => 'PB Tomo',
                    'owner' => 'Apringga Tri Nugraha',
                    'address' => 'Juwiring',
                    'products' => [
                        ['name' => 'Tomo', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Rukun Hasil Tani',
                    'owner' => 'Bu HJ Harti Umy',
                    'address' => 'Wonosari, Delanggu',
                    'products' => [
                        ['name' => 'C4 AN', 'subcategory' => 'C4'],
                        ['name' => 'Raja HT', 'subcategory' => 'C4'],
                        ['name' => 'HT Pink', 'subcategory' => 'C4'],
                        ['name' => 'Apel HT', 'subcategory' => 'C4'],
                        ['name' => 'Mawar HT', 'subcategory' => 'C4'],
                    ]
                ],
                [
                    'name' => 'PB Ira Putri Jaya',
                    'owner' => 'Bu Tini Kudus',
                    'address' => 'Kudus',
                    'products' => [
                        ['name' => 'Ketan Srikoyo', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan Tawon', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan Samurai', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan Kembang', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan Dua Mawar', 'subcategory' => 'Ketan'],
                    ]
                ],
                [
                    'name' => 'PB HD Herlina',
                    'owner' => 'Pak Paimo HD',
                    'address' => 'Subang',
                    'products' => [
                        ['name' => 'Ketan Herlina', 'subcategory' => 'Ketan'],
                        ['name' => 'Patah Ketan', 'subcategory' => 'Ketan'],
                    ]
                ],
                [
                    'name' => 'Makelar Mixed Theme',
                    'owner' => 'Dandil, Sartono',
                    'address' => '-',
                    'products' => [
                        ['name' => 'Ketan Belimbing', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan Tulip', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan Rajawali', 'subcategory' => 'Ketan'],
                        ['name' => 'Ketan SJM', 'subcategory' => 'Ketan'],
                    ]
                ],
                [
                    'name' => 'Ketan Subang',
                    'owner' => 'Mas Epis Rizq Zia',
                    'address' => 'Batang',
                    'products' => [
                        ['name' => 'Ketan DPJ', 'subcategory' => 'Ketan'],
                    ]
                ],
                [
                    'name' => 'CV Aditama',
                    'owner' => 'Pak Eddy, Fendi Delanggu',
                    'address' => 'Delanggu',
                    'products' => [
                        ['name' => 'Kacer', 'subcategory' => 'C4'],
                        ['name' => 'Muray Batu', 'subcategory' => 'C4'],
                    ]
                ],
            ];

            $totalProducts = 0;
            $totalSuppliers = 0;

            // Create Suppliers and Products
            foreach ($suppliersData as $supplierData) {
                $supplier = Supplier::firstOrCreate([
                    'name' => $supplierData['name']
                ], [
                    'owner' => $supplierData['owner'],
                    'address' => $supplierData['address'],
                    'phone' => null, // Default phone to null
                ]);

                $totalSuppliers++;

                foreach ($supplierData['products'] as $productData) {
                    $subcategory = $subcategories[$productData['subcategory']];
                    
                    // Generate barcode: BRS + Subcategory code + 3 letters from product name
                    $subcategoryCode = $productData['subcategory'];
                    if ($subcategoryCode === 'Rojolele') {
                        $subcategoryCode = 'ROJ';
                    } elseif ($subcategoryCode === 'Wangi') {
                        $subcategoryCode = 'WNG';
                    } elseif ($subcategoryCode === 'Ketan') {
                        $subcategoryCode = 'KTN';
                    }
                    
                    $productCode = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $productData['name']), 0, 3));
                    $barcode = 'BRS' . strtoupper($subcategoryCode) . $productCode;
                    
                    // Ensure unique barcode by adding number if needed
                    $originalBarcode = $barcode;
                    $counter = 1;
                    while (Product::where('barcode', $barcode)->exists()) {
                        $barcode = $originalBarcode . $counter;
                        $counter++;
                    }
                    
                    Product::firstOrCreate([
                        'name' => $productData['name'],
                        'supplier_id' => $supplier->id,
                    ], [
                        'category_id' => $category->id,
                        'subcategory_id' => $subcategory->id,
                        'barcode' => $barcode,
                        'purchase_price' => 0,
                        'sell_price' => 0,
                        'stock' => 0,
                        'description' => null,
                    ]);

                    $totalProducts++;
                }
            }

            echo "✅ Product seeder completed successfully:\n";
            echo "   - Category: {$category->name}\n";
            echo "   - Subcategories: " . implode(', ', array_keys($subcategoryData)) . "\n";
            echo "   - Suppliers created: {$totalSuppliers}\n";
            echo "   - Products created: {$totalProducts}\n";
        });
    }
}