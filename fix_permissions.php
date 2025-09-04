<?php

/**
 * Script untuk menambahkan permission checks ke controller yang belum memilikinya
 */

$controllers = [
    // CategoryController
    [
        'file' => 'app/Http/Controllers/Apps/CategoryController.php',
        'checks' => [
            'index' => 'categories-access',
            'create' => 'categories-create',
            'store' => 'categories-create',
            'edit' => 'categories-edit',
            'update' => 'categories-edit',
            'destroy' => 'categories-delete'
        ]
    ],
    // ProductController  
    [
        'file' => 'app/Http/Controllers/Apps/ProductController.php',
        'checks' => [
            'index' => 'products-access',
            'create' => 'products-create',
            'store' => 'products-create',
            'edit' => 'products-edit',
            'update' => 'products-edit',
            'destroy' => 'products-delete'
        ]
    ],
    // PurchaseController
    [
        'file' => 'app/Http/Controllers/Apps/PurchaseController.php',
        'checks' => [
            'index' => 'purchases-access',
            'create' => 'purchases-access',
            'store' => 'purchases-access',
            'edit' => 'purchases-access',
            'update' => 'purchases-access',
            'destroy' => 'purchases-access'
        ]
    ],
    // TransactionHistoryController
    [
        'file' => 'app/Http/Controllers/Apps/TransactionHistoryController.php',
        'checks' => [
            'index' => 'transactions-access',
            'create' => 'transactions-access',
            'store' => 'transactions-access',
            'edit' => 'transactions-access',
            'update' => 'transactions-access',
            'destroy' => 'transactions-access'
        ]
    ]
];

echo "Script ini akan menambahkan permission checks ke controller yang belum memilikinya\n";
echo "Pastikan Anda sudah backup file sebelum menjalankan script ini\n";
echo "\nController yang akan dimodifikasi:\n";
foreach ($controllers as $controller) {
    echo "- " . $controller['file'] . "\n";
}

echo "\nJalankan script ini dengan: php fix_permissions.php\n";
