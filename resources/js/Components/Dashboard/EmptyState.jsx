import React from "react";
import { IconDatabaseOff } from "@tabler/icons-react";

export default function EmptyState({ title = "Tidak ada data", description = "Data belum tersedia." }) {
    return (
        <div className="flex flex-col items-center gap-2 py-6">
            <IconDatabaseOff size={32} className="text-muted-foreground" />
            <div className="text-sm text-muted-foreground font-medium">{title}</div>
            {description && <div className="text-xs text-muted-foreground">{description}</div>}
        </div>
    );
}
