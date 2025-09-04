import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";
import { renderMenuIcon } from "@/Utils/MenuIcon";

export default function LinkItemDropdown({
    icon,
    title,
    data,
    access,
    sidebarOpen,
    badge = null,
    ...props
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { auth } = usePage ? usePage().props : { auth: null };

    return (
        <>
            <Button
                variant="ghost"
                className={cn(
                    "min-w-full flex items-center font-medium gap-x-3.5 px-4 py-3 text-sm justify-between",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:bg-accent focus-visible:text-accent-foreground",
                    "transition-all duration-200",
                    !sidebarOpen && "md:justify-center md:px-3"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-x-3.5">
                    {renderMenuIcon(icon, {
                        size: 18,
                        className: cn(
                            "flex-shrink-0",
                            sidebarOpen ? "mr-2" : "md:mr-0"
                        ),
                    })}
                    <div
                        className={cn(
                            "flex items-center gap-2",
                            !sidebarOpen && "md:hidden"
                        )}
                    >
                        <span>{title}</span>
                        {badge && sidebarOpen && (
                            <span className="ml-2">{badge}</span>
                        )}
                    </div>
                </div>
                {sidebarOpen &&
                    (isOpen ? (
                        <ChevronUp size={18} className="flex-shrink-0" />
                    ) : (
                        <ChevronDown size={18} className="flex-shrink-0" />
                    ))}
            </Button>
            {isOpen && sidebarOpen && (
                <div className="pl-4 pb-2">
                    {data.map(
                        (subitem, idx) =>
                            subitem.permissions === true && (
                                <Button
                                    key={idx}
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "w-full justify-start gap-2 py-2 px-3 mb-1",
                                        "hover:bg-accent/50 hover:text-accent-foreground",
                                        "text-muted-foreground hover:text-foreground",
                                        "transition-colors duration-200"
                                    )}
                                    asChild
                                >
                                    <Link href={subitem.href}>
                                        <CornerDownRight
                                            size={14}
                                            className="flex-shrink-0"
                                        />
                                        {renderMenuIcon(subitem.icon, {
                                            size: 16,
                                            className: "flex-shrink-0",
                                        })}
                                        <span className="truncate">
                                            {subitem.title}
                                        </span>
                                    </Link>
                                </Button>
                            )
                    )}
                </div>
            )}
        </>
    );
}
