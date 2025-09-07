import { usePage } from "@inertiajs/react";
import {
    IconBooks,
    IconBox,
    IconCategory,
    IconChartArrowsVertical,
    IconChartBarPopular,
    IconChartInfographic,
    IconCirclePlus,
    IconClockHour6,
    IconFileCertificate,
    IconFileDescription,
    IconFolder,
    IconLayout2,
    IconSchool,
    IconShoppingCart,
    IconTable,
    IconUserBolt,
    IconUserShield,
    IconUserSquare,
    IconUsers,
    IconUsersPlus,
} from "@tabler/icons-react";
import hasAnyPermission from "./Permission";
import React from "react";

export default function Menu() {
    // define use page
    const { url, auth } = usePage();
    const roles = auth?.user?.roles || [];
    const isSuperAdmin = roles.some((role) => role.name === "super-admin");

    // define menu navigations
    const menuNavigation = [
        {
            title: "Overview",
            details: [
                {
                    title: "Dashboard",
                    href: route("dashboard"),
                    active: url === "/dashboard" ? true : false, // Update comparison here
                    icon: <IconLayout2 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["dashboard-access"]),
                },
            ],
        },
        {
            title: "Data Management",
            details: [
                {
                    title: "Kategori",
                    href: route("categories.index"),
                    active: url === "/dashboard/categories" ? true : false, // Update comparison here
                    icon: <IconFolder size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["categories-access"]),
                },
                {
                    title: "Subkategori",
                    href: route("subcategories.index"),
                    active: url === "/dashboard/subcategories" ? true : false,
                    icon: <IconCategory size={20} strokeWidth={1.5} />,
                    permissions: true, // Selalu tampil, bisa diatur sesuai kebutuhan
                },
                {
                    title: "Satuan",
                    href: route("units.index"),
                    active: url === "/dashboard/units" ? true : false,
                    icon: <IconCirclePlus size={20} strokeWidth={1.5} />,
                    permissions: true, // Selalu tampil
                },
                {
                    title: "Produk",
                    href: route("products.index"),
                    active: url === "/dashboard/products" ? true : false, // Update comparison here
                    icon: <IconBox size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["products-access"]),
                },
                {
                    title: "Stok",
                    href: route("stocks.index"),
                    active: url === "/dashboard/stocks" ? true : false,
                    icon: <IconBox size={20} strokeWidth={1.5} />, // Ganti icon jika perlu
                    permissions: true, // Atur permission sesuai kebutuhan
                },
                {
                    title: "Pelanggan",
                    href: route("customers.index"),
                    active: url === "/dashboard/customers" ? true : false, // Update comparison here
                    icon: <IconUsersPlus size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["customers-access"]),
                },
                {
                    title: "Supplier",
                    href: route("suppliers.index"),
                    active: url === "/dashboard/suppliers" ? true : false,
                    icon: <IconUserSquare size={20} strokeWidth={1.5} />,
                    permissions: true, // Atur permission sesuai kebutuhan
                },
            ],
        },
        {
            title: "Warehouse",
            details: [
                {
                    title: "Gudang",
                    href: route("dashboard.warehouses.index"),
                    active: url === "/dashboard/warehouses" ? true : false,
                    icon: <IconCategory size={20} strokeWidth={1.5} />,
                    permissions: true, // Selalu tampil
                },
                {
                    title: "Rekap Warehouse",
                    href: route("dashboard.warehouses.recap"),
                    active:
                        url === "/dashboard/warehouses/recap" ? true : false,
                    icon: <IconCategory size={20} strokeWidth={1.5} />,
                    permissions: true,
                },
            ],
        },
        {
            title: "Transaksi",
            details: [
                {
                    title: "Pembelian",
                    href: route("purchases.index"),
                    active: url === "/dashboard/purchases" ? true : false, // Update comparison here
                    icon: <IconClockHour6 size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: "Transaksi",
                    href: route("transactions.index"),
                    active: url === "/dashboard/transactions" ? true : false, // Update comparison here
                    icon: <IconShoppingCart size={20} strokeWidth={1.5} />,
                    permissions: hasAnyPermission(["transactions-access"]),
                },
                {
                    title: "Surat Jalan",
                    href: route("deliveries.index"),
                    active: url === "/dashboard/deliveries" ? true : false,
                    icon: <IconFileCertificate size={20} strokeWidth={1.5} />,
                    // allow for super-admin, toko or gudang, or explicit permission
                    permissions:
                        isSuperAdmin ||
                        roles.some((role) =>
                            ["toko", "gudang"].includes(role.name)
                        ) ||
                        hasAnyPermission(["deliveries-access"]),
                },
                {
                    title: "List Transaksi",
                    href: route("transactions.list"),
                    active:
                        url === "/dashboard/transactions/list" ? true : false,
                    icon: <IconFileDescription size={20} strokeWidth={1.5} />,
                    permissions: true, // Atur permission sesuai kebutuhan
                    // active:
                    //     url === "/dashboard/transactions/list" ? true : false,
                    // icon: <IconReceipt size={20} strokeWidth={1.5} />,
                    // permissions: hasAnyPermission(["transactions-access"]),
                },
            ],
        },
        {
            title: "User Management",
            details: [
                {
                    title: "Hak Akses",
                    href: route("permissions.index"),
                    active: url === "/dashboard/permissions" ? true : false, // Update comparison here
                    icon: <IconUserBolt size={20} strokeWidth={1.5} />,
                    permissions:
                        isSuperAdmin ||
                        hasAnyPermission(["permissions-access"]),
                },
                {
                    title: "Akses Group",
                    href: route("roles.index"),
                    active: url === "/dashboard/roles" ? true : false, // Update comparison here
                    icon: <IconUserShield size={20} strokeWidth={1.5} />,
                    permissions:
                        isSuperAdmin || hasAnyPermission(["roles-access"]),
                },
                {
                    title: "Pengguna",
                    icon: <IconUsers size={20} strokeWidth={1.5} />,
                    permissions:
                        isSuperAdmin || hasAnyPermission(["users-access"]),
                    subdetails: [
                        {
                            title: "Data Pengguna",
                            href: route("users.index"),
                            icon: <IconTable size={20} strokeWidth={1.5} />,
                            active: url === "/dashboard/users" ? true : false,
                            permissions:
                                isSuperAdmin ||
                                hasAnyPermission(["users-access"]),
                        },
                        {
                            title: "Tambah Data Pengguna",
                            href: route("users.create"),
                            icon: (
                                <IconCirclePlus size={20} strokeWidth={1.5} />
                            ),
                            active:
                                url === "/dashboard/users/create"
                                    ? true
                                    : false,
                            permissions:
                                isSuperAdmin ||
                                hasAnyPermission(["users-create"]),
                        },
                    ],
                },
            ],
        },
        {
            title: "Laporan",
            details: [
                {
                    title: "Laporan Transaksi",
                    href: route("reports.transactions"),
                    active:
                        url === "/dashboard/reports/transactions"
                            ? true
                            : false,
                    icon: <IconChartBarPopular size={20} strokeWidth={1.5} />,
                    permissions:
                        isSuperAdmin ||
                        hasAnyPermission(["reports.transactions"]),
                },
                {
                    title: "Laporan Stok",
                    href: route("stock-report.index"),
                    active: url === "/stock-report" ? true : false,
                    icon: (
                        <IconChartArrowsVertical size={20} strokeWidth={1.5} />
                    ),
                    permissions: true,
                },
                {
                    title: "Laporan Pembelian",
                    href: route("purchase-report.index"),
                    active: url === "/dashboard/purchase-report" ? true : false,
                    icon: <IconFileDescription size={20} strokeWidth={1.5} />,
                    permissions: true,
                },
                {
                    title: "Rekapan & Neraca",
                    href: route("dashboard.recap"),
                    active: url === "/dashboard/recap" ? true : false,
                    icon: <IconChartInfographic size={20} strokeWidth={1.5} />,
                    permissions: true, // Atur permission sesuai kebutuhan
                },
            ],
        },
    ];

    return menuNavigation;
}
