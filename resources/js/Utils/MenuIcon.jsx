import React from "react";
import {
    IconBarcode,
    IconBuildingWarehouse,
    IconBuildingStore,
    IconCirclePlus,
    IconDatabaseOff,
    IconDatabase,
    IconEyeBolt,
    IconPencilCog,
    IconTrash,
    IconFolder,
    IconCategory,
    IconBox,
    IconShoppingCart,
    IconFileText,
    IconHistory,
    IconCards,
    IconClock,
    IconStack,
    IconNote,
    IconFileCertificate,
    IconRepeat,
} from "@tabler/icons-react";

export const iconMap = {
    barcode: IconBarcode,
    cards: IconCards,
    "file-text": IconFileText,
    history: IconHistory,
    clock: IconClock,
    stack: IconStack,
    "file-certificate": IconFileCertificate,
    repeat: IconRepeat,
    note: IconNote,
    "building-warehouse": IconBuildingWarehouse,
    "building-store": IconBuildingStore,
    "circle-plus": IconCirclePlus,
    "database-off": IconDatabaseOff,
    "eye-bolt": IconEyeBolt,
    "pencil-cog": IconPencilCog,
    trash: IconTrash,
    folder: IconFolder,
    category: IconCategory,
    box: IconBox,
    "shopping-cart": IconShoppingCart,
    database: IconDatabase,
    // Tambahkan mapping lain jika perlu
};

export function renderMenuIcon(icon, props = {}) {
    const IconComponent = iconMap[icon];
    return IconComponent ? <IconComponent {...props} /> : null;
}
