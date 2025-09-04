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

    // define state isMobile
    const [isMobile, setIsMobile] = useState(false);

    // define useEffect
    useEffect(() => {
        // define handle resize window
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        // define event listener
        window.addEventListener("resize", handleResize);

        // call handle resize window
        handleResize();

        // remove event listener
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });

    return (
        <div className="py-4 px-4 md:px-6 flex justify-between items-center min-w-full sticky top-0 z-[30] h-16 border-b bg-white/95 backdrop-blur-sm dark:border-gray-900 dark:bg-gray-950/95 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Hamburger menu for mobile & desktop */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-700 dark:text-gray-400 p-2 md:hidden"
                    onClick={toggleSidebar}
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
                <div className="flex flex-row items-center gap-1 md:border-l-2 md:border-double md:px-4 dark:border-gray-700">
                    {/* {links.map((link, i) => (
                        link.hasOwnProperty('subdetails') ?
                            sublinks.map((sublink, x) => sublink.active === true && <span className='font-semibold text-sm md:text-base text-gray-700 dark:text-gray-400' key={x}>{sublink.title}</span>)
                            :
                            link.active === true && <span className='font-semibold text-sm md:text-base text-gray-700 dark:text-gray-400' key={i}>{link.title}</span>
                    ))} */}
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
                <div className="flex flex-row items-center gap-1 border-r-2 border-double px-4 dark:border-gray-700">
                    <div className="flex flex-row gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                            onClick={themeSwitcher}
                        >
                            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                        </Button>
                        <Notification />
                    </div>
                </div>
                <AuthDropdown auth={auth} isMobile={isMobile} />
            </div>
        </div>
    );
}
