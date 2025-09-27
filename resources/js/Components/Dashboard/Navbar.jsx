import React, { useEffect, useState } from "react";
import { usePage } from "@inertiajs/react";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/Components/ui/button";
import AuthDropdown from "@/Components/Dashboard/AuthDropdown";
import menuData from "@/Utils/Menu";
import Notification from "@/Components/Dashboard/Notification";

export default function Navbar({ toggleSidebar, themeSwitcher, darkMode }) {
    // destruct auth from props
    const { auth } = usePage().props;

    // get menu from utils
    const menuNavigation = menuData;

    // recreate array from menu navigations
    const links = menuNavigation.flatMap((item) => item.details);
    const filter_sublinks = links.filter((item) =>
        item.hasOwnProperty("subdetails")
    );
    const sublinks = filter_sublinks.flatMap((item) => item.subdetails);

    // define state isMobile — use matchMedia and attach listener once
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== "undefined" && window.matchMedia) {
            return window.matchMedia("(max-width: 767px)").matches;
        }
        return false;
    });

    useEffect(() => {
        if (typeof window === "undefined" || !window.matchMedia) return;
        const mm = window.matchMedia("(max-width: 767px)");
        const handleMM = (e) => setIsMobile(e.matches);
        // set initial state
        handleMM(mm);
        mm.addEventListener("change", handleMM);
        return () => mm.removeEventListener("change", handleMM);
    }, []);

    return (
        <div className="py-4 px-4 md:px-6 flex justify-between items-center min-w-full sticky top-0 z-[30] h-16 border-b border-border bg-card/95 backdrop-blur-sm shadow-sm">
            <div className="flex items-center gap-4">
                {/* Hamburger menu for mobile & desktop */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-400 p-2 md:hidden"
                    onClick={() => {
                        // On mobile, request the layout to toggle the sidebar drawer
                        try {
                            window.dispatchEvent(new CustomEvent('toggleSidebarMobile'));
                        } catch (e) {
                            const ev = document.createEvent('Event');
                            ev.initEvent('toggleSidebarMobile', true, true);
                            window.dispatchEvent(ev);
                        }
                    }}
                    aria-label="Buka sidebar"
                >
                    <Menu size={24} />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-400 p-2 hidden md:inline-flex"
                    onClick={toggleSidebar}
                    aria-label="Buka/tutup sidebar"
                >
                    <Menu size={20} />
                </Button>
                <div className="flex flex-row items-center gap-1 md:border-l-2 md:border-double md:px-4 border-border">

                    {links.map((link, i) =>
                        link.hasOwnProperty("subdetails")
                            ? sublinks.map(
                                (sublink, x) =>
                                    sublink.active === true && (
                                        <span
                                            className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-400"
                                            key={x}
                                        >
                                            {sublink.title}
                                        </span>
                                    )
                            )
                            : link.active === true && (
                                <span
                                    className="font-semibold text-sm md:text-base text-gray-700 dark:text-gray-400 "
                                    key={i}
                                >
                                    {link.title}
                                </span>
                            )
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex flex-row items-center gap-1 border-r-2 border-double px-4 border-border">
                    <div className="flex flex-row gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            onClick={themeSwitcher}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </Button>
                        {/* <Notification isMobile={isMobile} /> */}
                    </div>
                </div>
                <AuthDropdown auth={auth} isMobile={isMobile} />
            </div>
        </div>
    );
}
