import React from "react";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";

export default function RoleBadge({
    label,
    colorClass = "bg-gray-500 text-white",
    variant = "outline",
    className,
    ...props
}) {
    return (
        <Badge
            variant={variant}
            className={cn("text-xs font-semibold", colorClass, className)}
            {...props}
        >
            {label}
        </Badge>
    );
}
