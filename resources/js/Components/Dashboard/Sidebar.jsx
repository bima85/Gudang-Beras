import React from "react";
import { usePage, Link } from "@inertiajs/react";
import { IconBrandReact } from "@tabler/icons-react";
import LinkItem from "@/Components/Dashboard/LinkItem";
import LinkItemDropdown from "@/Components/Dashboard/LinkItemDropdown";
import RoleBadge from "@/Components/Dashboard/RoleBadge";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Separator } from "@/Components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/Components/ui/avatar";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { cn } from "@/lib/utils";
import menuData from "@/Utils/Menu";
import { renderMenuIcon } from "@/Utils/MenuIcon";
import {
    MapPin,
    User,
    Mail,
    Crown,
    Store,
    Warehouse,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";

// Local permission check function to ensure always using current permissions prop
function hasAnyPermission(permissionsList, allPermissions) {
    let hasPermission = false;
    permissionsList.forEach(function (item) {
        if (allPermissions[item]) hasPermission = true;
    });
    return hasPermission;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen, isMobile }) {
    const { auth } = usePage().props;
    const roles = auth?.user?.roles || [];
    const sharedLocation = usePage().props.location;
    // permissions is now an object from backend, not array
    const permissions = auth?.permissions || {};
    const route = window.route;
    let menuNavigation = [
        ...menuData.filter((item) => item.title !== "User Management"),
        {
            title: "User Management",
            details: [
                {
                    title: "Hak Akses",
                    icon: "user-bolt",
                    href: route ? route("permissions.index") : "/permissions",
                    permissions:
                        roles.some((role) => role.name === "super-admin") ||
                        !!permissions["permissions-access"],
                },
                {
                    title: "Akses Group",
                    icon: "user-shield",
                    href: route ? route("roles.index") : "/roles",
                    permissions:
                        roles.some((role) => role.name === "super-admin") ||
                        !!permissions["roles-access"],
                },
                {
                    title: "Pengguna",
                    icon: "users",
                    permissions:
                        roles.some((role) => role.name === "super-admin") ||
                        !!permissions["users-access"],
                    subdetails: [
                        {
                            title: "Data Pengguna",
                            icon: "table",
                            href: route ? route("users.index") : "/users",
                            permissions:
                                roles.some(
                                    (role) => role.name === "super-admin"
                                ) || !!permissions["users-access"],
                        },
                        {
                            title: "Tambah Data Pengguna",
                            icon: "circle-plus",
                            href: route
                                ? route("users.create")
                                : "/users/create",
                            permissions:
                                roles.some(
                                    (role) => role.name === "super-admin"
                                ) || !!permissions["users-create"],
                        },
                    ],
                },
            ],
        },
    ];

    // Jika user hanya punya permission tertentu, filter menu transaksi
    const isSuperAdmin = roles.some((role) => role.name === "super-admin");
    const isToko = roles.some((role) => role.name === "toko");
    const isGudang = roles.some((role) => role.name === "gudang");

    // Role -> display name + color class mapping
    const roleInfo = {
        "super-admin": {
            label: "Super",
            className: "bg-red-500 text-white",
            icon: Crown,
        },
        toko: {
            label: "Toko",
            className: "bg-blue-500 text-white",
            icon: Store,
        },
        gudang: {
            label: "Gudang",
            className: "bg-green-500 text-white",
            icon: Warehouse,
        },
    };
    const primaryRole = roles[0] ? roles[0].name : null;

    // Collect badges for all roles with Shadcn Badge
    const roleBadges = roles
        .map((role) => {
            const roleInfo = {
                "super-admin": {
                    label: "Super Admin",
                    className:
                        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
                    icon: <Crown className="w-3 h-3 mr-1" />,
                },
                toko: {
                    label: "Toko",
                    className:
                        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                    icon: <Store className="w-3 h-3 mr-1" />,
                },
                gudang: {
                    label: "Gudang",
                    className:
                        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
                    icon: <Warehouse className="w-3 h-3 mr-1" />,
                },
            };

            const info = roleInfo[role.name];
            if (!info) return null;

            return (
                <Badge
                    key={role.id}
                    variant="outline"
                    className={`text-xs font-medium ${info.className}`}
                >
                    {info.icon}
                    {info.label}
                </Badge>
            );
        })
        .filter(Boolean);
    if (!isSuperAdmin && !isToko) {
        const transaksiDetails = [];
        if (
            hasAnyPermission(["transactions-access"], permissions) ||
            isGudang
        ) {
            transaksiDetails.push({
                title: "Penjualan",
                icon: "circle-plus",
                href: "/dashboard/transactions",
                permissions: true,
            });
        }
        if (!!permissions["purchases-access"]) {
            transaksiDetails.push({
                title: "Pembelian",
                icon: "shopping-cart",
                href: "/dashboard/purchases",
                permissions: true,
            });
        }
        // Tampilkan Surat Jalan untuk role gudang atau jika punya permission deliveries-access
        if (isGudang || !!permissions["deliveries-access"]) {
            transaksiDetails.push({
                title: "Surat Jalan",
                icon: "file-certificate",
                href: route
                    ? route("deliveries.index")
                    : "/dashboard/deliveries",
                permissions: true,
            });
        }
        menuNavigation =
            transaksiDetails.length > 0
                ? [
                    {
                        title: "Transaksi",
                        details: transaksiDetails,
                    },
                ]
                : [];
    }

    React.useEffect(() => {
        const close = () => {
            if (sidebarOpen) setSidebarOpen(false);
        };
        window.addEventListener("closeSidebar", close);
        return () => window.removeEventListener("closeSidebar", close);
    }, [sidebarOpen, setSidebarOpen]);

    // Normalize permission flags at render-time using current auth roles/permissions
    // Guarantee: if user is super-admin, show all menu items unconditionally
    const normalizedMenu = menuNavigation.map((item) => {
        const details = (item.details || []).map((detail) => {
            // If super-admin, force all details/subdetails to be visible
            if (isSuperAdmin) {
                if (detail.subdetails) {
                    const subdetails = detail.subdetails.map((sub) => ({
                        ...sub,
                        permissions: true,
                    }));
                    return { ...detail, permissions: true, subdetails };
                }
                return { ...detail, permissions: true };
            }

            if (detail.subdetails) {
                const subdetails = detail.subdetails.map((sub) => ({
                    ...sub,
                    permissions:
                        Boolean(sub.permissions) ||
                        isSuperAdmin ||
                        isToko ||
                        isGudang,
                }));
                return { ...detail, subdetails };
            }
            return {
                ...detail,
                permissions:
                    Boolean(detail.permissions) ||
                    isSuperAdmin ||
                    isToko ||
                    isGudang,
            };
        });
        return { ...item, details };
    });

    return (
        <>
            {/* Mobile drawer: show full Sidebar content as a drawer on small screens */}
            {isMobile && (
                <div
                    className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed top-0 left-0 z-[60] w-full max-w-xs h-full bg-white dark:bg-gray-900 transition-transform duration-300 md:hidden`}
                    aria-hidden={!sidebarOpen}
                >
                    <div className="flex flex-col h-full min-h-screen">
                        {/* Mobile header with close button */}
                        <div className="flex justify-between items-center px-4 py-3 h-16 border-b border-gray-200 dark:border-gray-800">
                            <div className="text-xl font-bold">Toko 85</div>
                            <button
                                aria-label="Tutup sidebar"
                                role="button"
                                tabIndex={0}
                                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className={`w-full p-4 transition-all duration-300 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700/50`}>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={auth.user.avatar || `https://ui-avatars.com/api/?name=${auth.user.name}`} alt={auth.user.name} />
                                        <AvatarFallback>{auth.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-sm font-semibold text-foreground capitalize">{auth.user.name}</div>
                                        <div className="text-xs text-muted-foreground">{auth.user.email}</div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            <div className="p-2">
                                {normalizedMenu.map((item, index) => item.details.some((detail) => !!detail.permissions || (detail.subdetails && detail.subdetails.some((sub) => !!sub.permissions))) && (
                                    <div key={index} className="mb-4">
                                        <div className="text-gray-600 dark:text-gray-300 text-xs py-2 px-3 font-semibold uppercase tracking-wider">{item.title}</div>
                                        {item.details.filter((detail) => detail.permissions === true).map((detail, indexDetail) => {
                                            if (detail.hasOwnProperty('subdetails')) {
                                                return (
                                                    <LinkItemDropdown key={indexDetail} title={detail.title} icon={detail.icon} data={detail.subdetails} access={detail.permissions} sidebarOpen={true} onClick={() => setSidebarOpen(false)} />
                                                );
                                            }
                                            return (
                                                <LinkItem key={indexDetail} title={detail.title} icon={detail.icon} href={detail.href} access={detail.permissions} sidebarOpen={true} onClick={() => setSidebarOpen(false)} />
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <Separator />

                        <div className="w-full p-3 text-center border-t border-gray-100 dark:border-gray-700/50">
                            <div className="text-xs text-gray-500 dark:text-gray-400">© 2025 Toko85</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop sidebar (md and up) */}
            <div
                className={`hidden md:block md:fixed z-[50] top-0 left-0 h-full ${sidebarOpen ? "md:w-[260px]" : "md:w-[80px]"} min-h-screen bg-white dark:bg-gray-900 shadow-xl md:shadow-none border-r border-gray-200 dark:border-gray-800 transition-all duration-300 dark:shadow-2xl dark:shadow-black/10`}
                style={{ position: "sticky", top: 0 }}
            >
                <div className="flex flex-col h-full min-h-screen">
                    {/* Header/Logo Section */}
                    <div className={`flex justify-center items-center px-6 py-4 h-16 transition-all duration-300 border-b border-gray-200 dark:border-gray-800 ${!sidebarOpen ? "md:px-2" : ""}`}>
                        <div className={`text-2xl font-bold text-center leading-loose tracking-wider text-gray-900 dark:text-gray-100 transition-all duration-300 ${!sidebarOpen ? "md:text-lg md:px-0" : ""}`}>
                            <span className={sidebarOpen ? "inline" : "hidden md:inline"}>Toko 85</span>
                            <span className={sidebarOpen ? "hidden" : "inline md:hidden"}><IconBrandReact size={28} /></span>
                        </div>
                    </div>

                    {/* Menu Navigation */}
                    <ScrollArea className="flex-1">
                        {/* User Profile Section */}
                        <div className={`w-full p-4 transition-all duration-300 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-700/50 ${!sidebarOpen ? "md:p-2 md:justify-center md:flex-col" : ""}`}>
                            <div className={`flex items-center gap-3 ${!sidebarOpen ? "md:flex-col md:gap-1" : ""}`}>
                                <Avatar className={`flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "h-12 w-12" : "md:h-10 md:w-10"}`}>
                                    <AvatarImage src={auth.user.avatar || `https://ui-avatars.com/api/?name=${auth.user.name}`} alt={auth.user.name} />
                                    <AvatarFallback className="font-medium bg-primary text-primary-foreground">{auth.user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                </Avatar>

                                <div className={`flex flex-col gap-1 transition-all duration-300 ${!sidebarOpen ? "md:hidden" : ""}`}>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200"><User className="w-3 h-3 text-gray-600 dark:text-gray-300" />{auth.user.name}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><Mail className="w-3 h-3" />{auth.user.email}</div>
                                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300"><MapPin className="w-3 h-3" /><span className="font-medium">{sharedLocation ? sharedLocation : primaryRole ? roleInfo[primaryRole] ? roleInfo[primaryRole].label : primaryRole : "-"}</span></div>

                                    {roleBadges.length > 0 && (<div className="flex flex-wrap items-center gap-1 mt-2">{roleBadges}</div>)}
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="p-2">
                            {normalizedMenu.map((item, index) => item.details.some((detail) => !!detail.permissions || (detail.subdetails && detail.subdetails.some((sub) => !!sub.permissions))) && (
                                <div key={index} className="mb-4">
                                    <div className={`text-gray-600 dark:text-gray-300 text-xs py-2 px-3 font-semibold uppercase tracking-wider transition-all duration-300 ${!sidebarOpen ? "md:px-2 md:text-[10px] md:text-center" : ""}`}>{sidebarOpen ? item.title : "•••"}</div>
                                    {item.dropdown ? (
                                        <div className="space-y-1"><LinkItemDropdown title={item.title} icon={item.icon} data={item.details} access={true} sidebarOpen={sidebarOpen} /></div>
                                    ) : (
                                        <div className="space-y-1">
                                            {item.details.filter((detail) => detail.permissions === true).map((detail, indexDetail) => {
                                                if (detail.hasOwnProperty('subdetails')) {
                                                    const dropdownBadge = detail.title === 'Transaksi' && isGudang ? (<Badge className="ml-2 text-xs text-green-800 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"><Warehouse className="w-3 h-3 mr-1" />Gudang</Badge>) : null;
                                                    return (<LinkItemDropdown key={indexDetail} title={detail.title} icon={detail.icon} data={detail.subdetails} access={detail.permissions} sidebarOpen={sidebarOpen} badge={dropdownBadge} />);
                                                }
                                                const itemBadge = detail.title === 'Surat Jalan' && isGudang ? (<Badge className="ml-2 text-xs text-green-800 bg-green-100 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"><Warehouse className="w-3 h-3 mr-1" />Gudang</Badge>) : null;
                                                return (<LinkItem key={indexDetail} title={detail.title} icon={detail.icon} href={detail.href} access={detail.permissions} sidebarOpen={sidebarOpen} badge={itemBadge} />);
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>

                    <Separator />

                    {/* Footer */}
                    <div className="w-full p-3 text-center border-t border-gray-100 dark:border-gray-700/50"><div className="text-xs text-gray-500 dark:text-gray-400">© 2025 Toko85</div></div>
                </div>
            </div>
        </>
    );
}
