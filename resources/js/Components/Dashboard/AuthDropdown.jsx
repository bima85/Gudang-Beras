import React, { useState, useRef, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Link, usePage } from "@inertiajs/react";
import { IconLogout, IconUserCog } from "@tabler/icons-react";
import { useForm } from "@inertiajs/react";
import menuData from "@/Utils/Menu";
import LinkItem from "./LinkItem";
import LinkItemDropdown from "./LinkItemDropdown";
export default function AuthDropdown({ auth, isMobile }) {
    // define usefrom
    const { post } = useForm();
    // define url from usepage
    const { url } = usePage();

    // define state isToggle
    const [isToggle, setIsToggle] = useState(false);
    // define state isOpen
    const [isOpen, setIsOpen] = useState(false);
    // define ref dropdown
    const dropdownRef = useRef(null);
    const overlayRef = useRef(null);

    // define method handleClickOutside
    const handleClickOutside = (event) => {
        if (
            dropdownRef.current &&
            !dropdownRef.current.contains(event.target)
        ) {
            setIsToggle(false);
        }
    };

    // get menu from utils
    const menuNavigation = menuData;

    // define useEffect
    useEffect(() => {
        // add event listener
        window.addEventListener("mousedown", handleClickOutside);

        // remove event listener
        return () => {
            window.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Listen for a global mobile toggle event (dispatched from Navbar hamburger)
    useEffect(() => {
        const onToggleMobile = () => setIsToggle((v) => !v);
        window.addEventListener("toggleMobileMenu", onToggleMobile);
        const onCloseMobileDrawers = () => setIsToggle(false);
        window.addEventListener("closeMobileDrawers", onCloseMobileDrawers);
        return () => {
            window.removeEventListener("toggleMobileMenu", onToggleMobile);
            window.removeEventListener("closeMobileDrawers", onCloseMobileDrawers);
        };
    }, []);

    // mounted guard to avoid SSR/hydration mismatch
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    // Prevent body scroll when mobile drawer is open and handle Escape key
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") setIsToggle(false);
        };
        if (isToggle) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", onKey);
        } else {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        }

        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [isToggle]);

    // define function logout
    const logout = async (e) => {
        e.preventDefault();

        post(route("logout"));
    };

    // Temporary: force desktop dropdown to avoid mobile drawer on desktop
    const showMobile = false;

    return (
        <>
            {showMobile === false ? (
                <Menu className="relative z-10" as="div">
                    <Menu.Button className="flex items-center rounded-full">
                        <img
                            src={
                                auth.user.avatar
                                    ? auth.user.avatar
                                    : "https://ui-avatars.com/api/?name=" +
                                    auth.user.name
                            }
                            alt={auth.user.name}
                            className="w-10 h-10 rounded-full"
                        />
                    </Menu.Button>
                    <Transition
                        enter="transition duration-100 ease-out"
                        enterFrom="transform scale-95 opacity-0"
                        enterTo="transform scale-100 opacity-100"
                        leave="transition duration-75 ease-out"
                        leaveFrom="transform scale-100 opacity-100"
                        leaveTo="transform scale-95 opacity-0"
                    >
                        <Menu.Items className="absolute rounded-lg w-48 border mt-2 py-2 right-0 z-[100] bg-popover border-border">
                            <div className="flex flex-col gap-1.5 divide-y divide-gray-100 dark:divide-gray-900">
                                {/* <Menu.Item>
                                    <Link href="/apps/profile" className='px-3 py-1.5 text-sm flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'>
                                        <IconUserCog strokeWidth={'1.5'} size={'20'} /> Profile
                                    </Link>
                                </Menu.Item> */}
                                <Menu.Item>
                                    <button
                                        onClick={logout}
                                        className="px-3 py-1.5 text-sm flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <IconLogout
                                            strokeWidth={"1.5"}
                                            size={"20"}
                                        />
                                        Logout
                                    </button>
                                </Menu.Item>
                            </div>
                        </Menu.Items>
                    </Transition>
                </Menu>
            ) : (
                <div ref={dropdownRef} aria-hidden={showMobile ? "false" : "true"}>
                    <button
                        className="flex items-center group"
                        onClick={() => {
                            const next = !isToggle;
                            setIsToggle(next);
                            // only request sidebar close when opening drawer on small screens
                            if (next && window.matchMedia && window.matchMedia('(max-width: 767px)').matches) {
                                try {
                                    window.dispatchEvent(new CustomEvent('closeSidebar'));
                                } catch (e) {
                                    const ev = document.createEvent('Event');
                                    ev.initEvent('closeSidebar', true, true);
                                    window.dispatchEvent(ev);
                                }
                            }
                        }}
                    >
                        <img
                            src={
                                auth.user.avatar
                                    ? auth.user.avatar
                                    : "https://ui-avatars.com/api/?name=" +
                                    auth.user.name
                            }
                            alt={auth.user.name}
                            className="w-10 h-10 rounded-full"
                        />
                    </button>
                    {/* Overlay behind drawer (mobile only) */}
                    <div
                        ref={overlayRef}
                        onClick={() => setIsToggle(false)}
                        className={`${isToggle ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                            } fixed inset-0 bg-black/40 z-40 transition-opacity duration-200 md:hidden`}
                        aria-hidden={isToggle ? "false" : "true"}
                    />

                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="User menu"
                        className={`${isToggle ? "translate-x-0 opacity-100" : "-translate-x-full"
                            } fixed top-0 left-0 z-50 w-full max-w-xs h-full transition-all duration-300 transform border-r bg-popover border-border md:hidden`}
                    >
                        <div className="flex items-center justify-center h-16 px-6 py-2">
                            <div className="text-2xl font-bold leading-loose tracking-wider text-center text-foreground">
                                KASIR
                            </div>
                        </div>
                        <div className="flex items-center w-full gap-4 p-3 border-t border-b bg-popover/70 border-border">
                            <img
                                src={
                                    auth.user.avatar
                                        ? auth.user.avatar
                                        : "https://ui-avatars.com/api/?name=" +
                                        auth.user.name
                                }
                                alt={auth.user.name}
                                className="w-12 h-12 rounded-full"
                            />
                            <div className="flex flex-col gap-0.5">
                                <div className="text-sm font-semibold text-foreground capitalize">
                                    {auth.user.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {auth.user.email}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col w-full overflow-y-auto touch-pan-y">
                            {menuNavigation.map(
                                (item, index) =>
                                    item.details.some(
                                        (detail) => detail.permissions === true
                                    ) && (
                                        <div key={index}>
                                            <div className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">
                                                {item.title}
                                            </div>
                                            {item.details.map(
                                                (detail, indexDetail) =>
                                                    detail.hasOwnProperty(
                                                        "subdetails"
                                                    ) ? (
                                                        <LinkItemDropdown
                                                            key={indexDetail}
                                                            title={detail.title}
                                                            icon={detail.icon}
                                                            data={
                                                                detail.subdetails
                                                            }
                                                            access={
                                                                detail.permissions
                                                            }
                                                            sidebarOpen={true}
                                                            onClick={() =>
                                                                setIsToggle(
                                                                    !isToggle
                                                                )
                                                            }
                                                        />
                                                    ) : (
                                                        <LinkItem
                                                            key={indexDetail}
                                                            title={detail.title}
                                                            icon={detail.icon}
                                                            href={detail.href}
                                                            access={
                                                                detail.permissions
                                                            }
                                                            sidebarOpen={true}
                                                            onClick={() =>
                                                                setIsToggle(
                                                                    !isToggle
                                                                )
                                                            }
                                                        />
                                                    )
                                            )}
                                        </div>
                                    )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
