# QTY Update Logic for Purchase Items

## Overview

Updated the quantity allocation logic for purchase items to provide automatic stock distribution between shop (toko) and warehouse (gudang). **Qty Toko is now automatically calculated** and cannot be manually edited.

## New Simplified Logic

### Formula

```
Qty Toko = Qty - Qty Gudang
```

**Qty Toko is ALWAYS auto-calculated** based on the main QTY and warehouse QTY inputs.

### 1. QTY Only (No Warehouse QTY)

**When:** User inputs only the main QTY field without entering warehouse quantity
**Result:** All stock goes to the shop (toko)

```
Example:
- QTY: 100
- Warehouse QTY: 0 (or empty)
→ Shop receives: 100 (auto-calculated)
→ Warehouse receives: 0
```

### 2. QTY + Warehouse QTY

**When:** User inputs both main QTY and warehouse quantity
**Result:** Stock is split - specified amount goes to warehouse, remainder goes to shop (auto-calculated)

```
Example:
- QTY: 100
- Warehouse QTY: 30
→ Warehouse receives: 30
→ Shop receives: 70 (auto-calculated: 100 - 30)
```

### 3. Warehouse QTY Only (No Main QTY)

**When:** User inputs only warehouse quantity without main QTY
**Result:** Stock goes only to warehouse, none to shop

```
Example:
- QTY: 0 (or empty)
- Warehouse QTY: 50
→ Main QTY is automatically set to: 50
→ Warehouse receives: 50
→ Shop receives: 0 (auto-calculated)
```

## Key Changes

### What Changed:

1. ✅ **Qty Toko input field REMOVED** - Users can no longer manually edit shop quantity
2. ✅ **Qty Toko is now READ-ONLY** - Displayed with gray background to show it's auto-calculated
3. ✅ **Simplified logic** - Only need to input QTY and optionally Qty Gudang
4. ✅ **Clearer UX** - Table header shows "Toko (Auto)" to indicate automatic calculation

### Benefits:

-   **Prevents errors** - Users cannot accidentally enter conflicting quantities
-   **Simpler interface** - One less field to worry about
-   **Automatic calculation** - Shop quantity is always correct (QTY - Gudang)
-   **Clearer intent** - Users focus on total quantity and warehouse allocation only

## Implementation Details

### Frontend Changes

**File:** `resources/js/Pages/Dashboard/Purchases/Create.jsx`

Updated the `onItemUpdate` handler to implement simplified automatic allocation:

```javascript
onItemUpdate={(itemIndex, updatedItem) => {
    const items = [...data.items];

    const totalQty = parseFloat(updatedItem.qty) || 0;
    const qtyGudang = parseFloat(updatedItem.qty_gudang) || 0;

    // Simplified Logic: Qty Toko is ALWAYS calculated automatically
    // Qty Toko = Qty - Qty Gudang

    if (totalQty > 0) {
        // Calculate shop qty from main qty minus warehouse qty
        const calculatedQtyToko = totalQty - qtyGudang;
        updatedItem.qty_toko = calculatedQtyToko > 0 ? calculatedQtyToko : 0;
    } else if (qtyGudang > 0) {
        // If only warehouse qty is entered, auto-set main qty
        updatedItem.qty = qtyGudang;
        updatedItem.qty_toko = 0;
    } else {
        // Both zero
        updatedItem.qty_toko = 0;
    }

    items[itemIndex] = updatedItem;
    localStorage.setItem("purchase_items_table", JSON.stringify(items.slice(0, -1)));
    setData("items", items);
}}
```

**File:** `resources/js/Pages/Dashboard/Purchases/PurchaseItemsTable.jsx`

Changed Qty Toko from input field to read-only display:

```jsx
// Header
<TableHead className="w-28 text-right">Toko (Auto)</TableHead>

// Display (read-only, no input)
<TableCell className="text-right">
    <div className="w-20 h-8 flex items-center justify-end px-2 bg-gray-50 rounded border border-gray-200 text-sm font-medium text-gray-700">
        {item.qty_toko || 0}
    </div>
</TableCell>
```

### Backend Changes

**File:** `app/Http/Controllers/Apps/PurchaseController.php`

Backend logic remains the same - it validates and processes the auto-calculated values:

```php
foreach ($validated['items'] as $key => $item) {
    $totalQty = floatval($item['qty']);
    $qtyGudang = floatval($item['qty_gudang'] ?? 0);
    $qtyToko = floatval($item['qty_toko'] ?? 0);

    if ($totalQty > 0 && $qtyGudang == 0 && $qtyToko == 0) {
        // Case 1: Only QTY input - all goes to shop
        $qtyToko = $totalQty;
        $qtyGudang = 0;
    } elseif ($totalQty > 0 && $qtyGudang > 0) {
        // Case 2: Both QTY and warehouse QTY input
        $qtyToko = $totalQty - $qtyGudang;
        if ($qtyToko < 0) $qtyToko = 0;
    } elseif ($totalQty == 0 && $qtyGudang > 0) {
        // Case 3: Only warehouse QTY input
        $totalQty = $qtyGudang;
        $qtyToko = 0;
    }

    $validated['items'][$key]['qty'] = $totalQty;
    $validated['items'][$key]['qty_gudang'] = $qtyGudang;
    $validated['items'][$key]['qty_toko'] = $qtyToko;
}
```

## Previous Behavior

Previously, the system automatically allocated quantities with a 50-50 split:

-   When QTY was entered, it was automatically divided 50% to warehouse and 50% to shop
-   This didn't provide flexibility for different allocation scenarios

## Benefits

1. **More Control:** Users can decide exactly how to allocate stock
2. **Flexibility:** Supports various business scenarios (direct to shop, warehouse-only, split allocation)
3. **Intuitive:** The behavior matches user expectations based on which fields they fill
4. **Backward Compatible:** Existing data and validation remain intact

## Testing Scenarios

### Scenario 1: Shop Only

1. Add a purchase item
2. Enter QTY: 100
3. Leave Warehouse QTY empty
4. Expected: qty_toko = 100, qty_gudang = 0

### Scenario 2: Mixed Allocation

1. Add a purchase item
2. Enter QTY: 100
3. Enter Warehouse QTY: 30
4. Expected: qty_gudang = 30, qty_toko = 70

### Scenario 3: Warehouse Only

1. Add a purchase item
2. Leave QTY empty (or 0)
3. Enter Warehouse QTY: 50
4. Expected: qty = 50, qty_gudang = 50, qty_toko = 0

## Notes

-   The logic is triggered whenever QTY or Warehouse QTY fields are updated
-   Values are automatically calculated and stored in localStorage
-   Backend validates and processes the allocation according to the same rules
-   Logging is added to track which allocation scenario is being used
