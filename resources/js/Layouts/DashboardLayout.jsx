import React, { useState, useEffect } from "react";
import Sidebar from "@/Components/Dashboard/Sidebar";
import { usePage } from "@inertiajs/react";
import Navbar from "@/Components/Dashboard/Navbar";
import { Toaster } from "react-hot-toast";
import { useTheme } from "@/Context/ThemeSwitcherContext";

export default function DashboardLayout({ children }) {
    const { darkMode, themeSwitcher } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= 768;
        }
        return false;
    });

    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(max-width: 767px)").matches;
        }
        return false;
    });

    useEffect(() => {
        const mm = window.matchMedia("(max-width: 767px)");
        const handleMM = (e) => setIsMobile(e.matches);
        handleMM(mm);
        mm.addEventListener("change", handleMM);

        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);

        // listen for requests to close the sidebar (dispatched by mobile drawer)
        const onCloseSidebar = () => setSidebarOpen(false);
        window.addEventListener("closeSidebar", onCloseSidebar);
        // listen for mobile toggle event from hamburger
        const onToggleMobileSidebar = () => {
            if (window.matchMedia && window.matchMedia("(max-width: 767px)").matches) {
                setSidebarOpen((v) => {
                    const next = !v;
                    // If opening the mobile sidebar, notify other mobile drawers to close
                    if (next) {
                        try {
                            window.dispatchEvent(new CustomEvent("closeMobileDrawers"));
                        } catch (e) {
                            const ev = document.createEvent("Event");
                            ev.initEvent("closeMobileDrawers", true, true);
                            window.dispatchEvent(ev);
                        }
                    }
                    return next;
                });
            }
        };
        window.addEventListener("toggleSidebarMobile", onToggleMobileSidebar);

        return () => {
            mm.removeEventListener("change", handleMM);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("closeSidebar", onCloseSidebar);
            window.removeEventListener("toggleSidebarMobile", onToggleMobileSidebar);
        };
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
        console.log("Sidebar toggled, open:", !sidebarOpen);
    };

    const { auth } = usePage().props;
    const roles = auth?.user?.roles || [];
    const isSuperAdmin = roles.some((r) => r.name === "super-admin");

    return (
        <div className="min-h-screen flex flex-col sm:flex-row transition-all duration-200 relative">
            {/* Overlay untuk mobile sidebar (only when mobile) */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-[45] md:hidden"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Tutup Sidebar"
                />
            )}
            {isSuperAdmin && (
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    isMobile={isMobile}
                    className="z-[50] min-h-screen"
                />
            )}
            <div className="flex-1  flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200 z-[10] p-0">
                <Navbar
                    toggleSidebar={toggleSidebar}
                    themeSwitcher={themeSwitcher}
                    darkMode={darkMode}
                />
                <div className="flex-1 w-full py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 text-gray-900 dark:text-gray-100 pb-20 sm:pb-24 overflow-hidden">
                    <div className="max-w-full overflow-x-auto">
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                className:
                                    "dark:bg-gray-800 dark:text-gray-100",
                            }}
                        />
                        {children}
                    </div>
                </div>
                <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400 py-2 sm:py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 mt-auto">
                    © {new Date().getFullYear()} TOKO_85 App by YourCompany. All
                    rights reserved.
                </footer>
            </div>
        </div>
    );
}
