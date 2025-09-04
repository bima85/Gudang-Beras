// Jangan import hook atau function yang pakai hook di file ini
import { route } from "ziggy-js";
// Icon mapping & renderMenuIcon dipindah ke MenuIcon.jsx

// Helper untuk cek route tersedia
function safeRoute(name, params = undefined) {
    try {
        return route(name, params);
    } catch (e) {
        return null;
    }
}


// Ambil roles dari window.pageProps jika ada (untuk non-React context)
let roles = [];
let permissions = {};
if (window?.pageProps?.auth?.roles) {
    roles = window.pageProps.auth.roles;
} else if (window?.pageProps?.auth?.user?.roles) {
    roles = window.pageProps.auth.user.roles;
}
if (window?.pageProps?.auth?.permissions) {
    permissions = window.pageProps.auth.permissions;
} else if (window?.pageProps?.auth?.user?.permissions) {
    // fallback lama (array)
    const arr = window.pageProps.auth.user.permissions;
    permissions = {};
    if (Array.isArray(arr)) {
        arr.forEach(p => { if (p.name) permissions[p.name] = true; });
    }
}
const isSuperAdmin = Array.isArray(roles) && roles.some(role => role.name === "super-admin");
// console.log('Menu.js roles:', roles);
// console.log('Menu.js permissions:', permissions);
// console.log('Menu.js isSuperAdmin:', isSuperAdmin);
// console.log('Menu.js hasPermission("permissions-access"):', !!permissions['permissions-access']);
function hasPermission(key) {
    // key: string, contoh 'users-access'
    return isSuperAdmin || !!permissions[key];
}

const menuData = [
    {
        title: "Dashboard",
        details: [
            {
                title: "Dashboard",
                icon: "circle-plus",
                href: safeRoute("dashboard"),
                permissions: true
            }
        ]
    },
    {
        title: "Data Management",
        icon: "folder",
        dropdown: true,
        details: [
            {
                title: "Kategori",
                icon: "category",
                href: safeRoute("categories.index"),
                permissions: true
            },
            {
                title: "Subkategori",
                icon: "category",
                href: safeRoute("subcategories.index"),
                permissions: true
            },
            {
                title: "Satuan",
                icon: "box",
                href: safeRoute("units.index"),
                permissions: true
            },
            {
                title: "Produk",
                icon: "box",
                href: safeRoute("products.index"),
                permissions: true
            },
            {
                title: "Cetak Barcode",
                icon: "barcode",
                href: safeRoute("barcodes.index"),
                permissions: true
            },

            {
                title: "Toko",
                icon: "building-store", // ganti dari "carts" ke "store"
                href: safeRoute("tokos.index"),
                permissions: true
            },

            {
                title: "Pelanggan",
                icon: "circle-plus",
                href: safeRoute("customers.index"),
                permissions: true
            },
            {
                title: "Supplier",
                icon: "circle-plus",
                href: safeRoute("suppliers.index"),
                permissions: true
            },
            {
                title: "Gudang",
                icon: "building-warehouse", // ganti dari "building-store" ke "building-warehouse"
                href: safeRoute("dashboard.warehouses.index"),
                permissions: true
            },
        ]
    },
    {
        title: "Transaksi",
        details: [
            {
                title: "Pembelian",
                icon: "shopping-cart",
                href: safeRoute("purchases.create"),
                permissions: true
            },
            {
                title: "Penjualan",
                icon: "circle-plus",
                href: safeRoute("transactions.index"),
                permissions: true
            }
            ,

        ]
    },

    {
        title: "User Management",
        details: [
            {
                title: "Hak Akses",
                icon: "user-bolt",
                href: safeRoute("permissions.index"),
                permissions: hasPermission("permissions-access"),
            },
            {
                title: "Akses Group",
                icon: "user-shield",
                href: safeRoute("roles.index"),
                permissions: hasPermission("roles-access"),
            },
            {
                title: "Pengguna",
                icon: "users",
                permissions: hasPermission("users-access"),
                subdetails: [
                    {
                        title: "Data Pengguna",
                        icon: "table",
                        href: safeRoute("users.index"),
                        permissions: hasPermission("users-access"),
                    },
                    {
                        title: "Tambah Data Pengguna",
                        icon: "circle-plus",
                        href: safeRoute("users.create"),
                        permissions: hasPermission("users-create"),
                    },
                ],
            },
        ],
    },
    {
        title: "Laporan",
        icon: "database-off",
        dropdown: true,
        details: [
            {
                title: "Stok Gudang",
                icon: "building-warehouse",
                href: safeRoute("stocks.index"),
                permissions: true
            },
            {
                title: "Stok Toko",
                icon: "building-store",
                href: safeRoute("stok-toko.index"),
                permissions: true
            },
            {
                title: "Pergerakan Stok",
                icon: "repeat",
                href: safeRoute("stock-movements.index"),
                permissions: true
            },
            {
                title: "Kartu Stok",
                icon: "cards",
                href: safeRoute("stock-cards.index"),
                permissions: true
            },
            {
                title: "Laporan Penjualan",
                icon: "note",
                href: safeRoute("reports.transactions"),
                permissions: hasPermission("reports-access")
            },
            {
                title: "Laporan Pembelian",
                icon: "note",
                href: safeRoute("purchase-report.index"),
                permissions: hasPermission("reports-access")
            },
            {
                title: "Histori Transaksi",
                icon: "history",
                href: safeRoute("transaction-histories.index"),
                permissions: true
            },
            // {
            //     title: "Surat Jalan",
            //     icon: "file-certificate",
            //     href: safeRoute("deliveries.index"),
            //     permissions: isSuperAdmin || hasPermission("deliveries-access") || (Array.isArray(roles) && roles.some(r => ['toko', 'gudang'].includes(r.name)))
            // },
            {
                title: "Surat Jalan Otomatis",
                icon: "file-certificate",
                href: safeRoute("delivery-notes.index"),
                permissions: isSuperAdmin || hasPermission("deliveries-access") || (Array.isArray(roles) && roles.some(r => ['toko', 'gudang'].includes(r.name)))
            },
            {
                title: "Rekapan & Neraca",
                icon: "database",
                href: route("dashboard.recap"),
                permissions: true,
            },
        ]
    },
    {
        title: "Pengaturan",
        icon: "pencil-cog",
        dropdown: true,
        permissions: (["settings.index", "settings.update"]),
        details: [
            {
                title: "Pengaturan",
                icon: "circle-plus",
                href: safeRoute("settings.index"),
                permissions: true
            }
        ]
    }
];

export default menuData;

