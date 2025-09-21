import React from "react";
import { Link, usePage } from "@inertiajs/react";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { renderMenuIcon } from "@/Utils/MenuIcon";

export default function LinkItem({
    href,
    icon,
    access,
    title,
    sidebarOpen,
    badge = null,
    onClick = undefined,
    ...props
}) {
    const { url } = usePage();
    const { auth } = usePage().props;

    // helper to render content when sidebar open (full label) or collapsed (icon only)
    const contentOpen = (
        <div className="flex items-center">
            {renderMenuIcon(icon, {
                size: 18,
                className: "mr-3 flex-shrink-0",
            })}
            <span
                className={cn(
                    "transition-all",
                    sidebarOpen ? "" : "hidden md:inline"
                )}
            >
                {title}
            </span>
            {badge && sidebarOpen && <span className="ml-auto">{badge}</span>}
        </div>
    );

    const contentCollapsed = (
        <div className="flex items-center justify-center w-full">
            {renderMenuIcon(icon, { size: 18 })}
        </div>
    );

    const baseClassName = cn(
        "w-full justify-start text-sm font-medium transition-all duration-200",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:bg-accent focus-visible:text-accent-foreground",
        url.startsWith(href) && [
            "bg-accent text-accent-foreground",
            "shadow-sm border-r-2 border-primary",
        ],
        !sidebarOpen && "md:justify-center md:px-3"
    );

    if (auth && auth.super === true) {
        return (
                <Button
                    variant="ghost"
                    className={baseClassName}
                    asChild
                    {...props}
                >
                    <Link href={href} title={!sidebarOpen ? title : undefined} onClick={onClick}>
                        {sidebarOpen ? contentOpen : contentCollapsed}
                    </Link>
                </Button>
        );
    }

    // Non-super users: check access
    if (access === true) {
        return (
                <Button
                    variant="ghost"
                    className={baseClassName}
                    asChild
                    {...props}
                >
                    <Link href={href} title={!sidebarOpen ? title : undefined} onClick={onClick}>
                        {sidebarOpen ? contentOpen : contentCollapsed}
                    </Link>
                </Button>
        );
    }

    // No access - don't render anything
    return null;
}
