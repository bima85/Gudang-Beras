# Purchase Item QTY Allocation Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  User Inputs Purchase Item                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Check Input Combinations                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │               │              │
        ▼              ▼               ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  Case 1  │   │  Case 2  │   │  Case 3  │   │  Case 4  │
│          │   │          │   │          │   │          │
│ QTY only │   │ QTY +    │   │ Gudang   │   │ Both     │
│          │   │ Gudang   │   │ only     │   │ Zero     │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘
     │              │              │              │
     ▼              ▼              ▼              ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ All to  │   │ Split   │   │ All to  │   │ Nothing │
│  Shop   │   │ Between │   │Warehouse│   │         │
└─────────┘   └─────────┘   └─────────┘   └─────────┘
```

## Detailed Cases

### Case 1: QTY Only (All to Shop)

```
Input:
  QTY: 100
  Gudang QTY: 0 (or empty)

Output:
  qty = 100
  qty_gudang = 0
  qty_toko = 100

Stock Distribution:
  Shop: 100 units ✓
  Warehouse: 0 units
```

### Case 2: QTY + Gudang QTY (Split)

```
Input:
  QTY: 100
  Gudang QTY: 30

Output:
  qty = 100
  qty_gudang = 30
  qty_toko = 70

Stock Distribution:
  Warehouse: 30 units ✓
  Shop: 70 units ✓

Calculation:
  qty_toko = QTY - qty_gudang
  qty_toko = 100 - 30 = 70
```

### Case 3: Gudang QTY Only (All to Warehouse)

```
Input:
  QTY: 0 (or empty)
  Gudang QTY: 50

Output:
  qty = 50 (auto-set)
  qty_gudang = 50
  qty_toko = 0

Stock Distribution:
  Warehouse: 50 units ✓
  Shop: 0 units

Note: Main QTY is automatically set to match Gudang QTY
```

### Case 4: Both Zero (No Stock)

```
Input:
  QTY: 0
  Gudang QTY: 0

Output:
  qty = 0
  qty_gudang = 0
  qty_toko = 0

Stock Distribution:
  Shop: 0 units
  Warehouse: 0 units
```

## User Interface Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    Purchase Item Form                         │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Product: [Select Product ▼]                                 │
│                                                               │
│  QTY: [______]  Unit: [Karung ▼]                            │
│        ↑                                                      │
│        │                                                      │
│        └─── Main quantity input                              │
│                                                               │
│  Gudang: [______]                                            │
│           ↑                                                   │
│           │                                                   │
│           └─── Warehouse allocation (optional)               │
│                                                               │
│  Toko: [______] (auto-calculated, can be manually edited)   │
│         ↑                                                     │
│         │                                                     │
│         └─── Shop allocation (auto or manual)                │
│                                                               │
│  Price: [______]                                             │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Business Logic Examples

### Example 1: Direct Retail Sales

**Scenario:** Purchasing products directly for shop display

```
- Input QTY: 50 bags
- Don't enter Gudang QTY
- Result: All 50 bags go to shop for immediate sale
```

### Example 2: Bulk Purchase with Storage

**Scenario:** Purchasing large quantity, need warehouse storage

```
- Input QTY: 100 bags
- Input Gudang QTY: 60 bags
- Result: 60 bags stored in warehouse, 40 bags to shop
```

### Example 3: Warehouse Restocking

**Scenario:** Purchasing specifically for warehouse storage

```
- Don't enter main QTY (or enter 0)
- Input Gudang QTY: 80 bags
- Result: All 80 bags go to warehouse, none to shop
- Note: Main QTY auto-sets to 80
```

## Code Trigger Points

### Frontend (Create.jsx)

-   Triggered on QTY field change
-   Triggered on Gudang QTY field change
-   Automatically updates Toko field
-   Saves to localStorage

### Backend (PurchaseController.php)

-   Validates input on form submission
-   Re-calculates allocation if needed
-   Logs the allocation scenario
-   Updates stock in database

## Database Impact

### Tables Updated

1. **purchase_items**

    - qty (main quantity)
    - qty_gudang (warehouse allocation)
    - qty_toko (shop allocation)

2. **warehouse_stocks**

    - Updated when qty_gudang > 0

3. **products**

    - stock field updated for shop quantity

4. **stock_movements**
    - Records movement to warehouse (if qty_gudang > 0)
    - Records movement to toko (if qty_toko > 0)

## Validation Rules

### Frontend Validation

-   QTY must be >= 0
-   Gudang QTY must be >= 0
-   If Gudang QTY > QTY and QTY > 0, auto-adjust to prevent negative Toko QTY

### Backend Validation

```php
'items.*.qty' => 'required|numeric|min:1'  // Main QTY (at least 1)
'items.*.qty_gudang' => 'nullable|numeric|min:0'  // Optional warehouse qty
'items.*.qty_toko' => 'nullable|numeric|min:0'  // Optional shop qty
```

## Error Handling

### Negative Stock Prevention

```javascript
if (totalQty > 0 && qtyGudang > 0) {
    const remainingForToko = totalQty - qtyGudang;
    updatedItem.qty_toko = remainingForToko > 0 ? remainingForToko : 0;
    // ↑ Prevents negative values
}
```

### Backend Safety Check

```php
$qtyToko = $totalQty - $qtyGudang;
if ($qtyToko < 0) $qtyToko = 0; // Safety check
```
