# Testing Guide: Purchase Item QTY Update

## Overview

This guide provides step-by-step instructions to test the new QTY allocation logic for purchase items.

## Prerequisites

-   Access to the Purchase Create page
-   At least one supplier, product, and unit configured
-   Database with necessary migrations applied

## Test Cases

### Test Case 1: QTY Only - All Stock to Shop

**Objective:** Verify that entering only main QTY allocates all stock to the shop

**Steps:**

1. Navigate to Purchases > Create Purchase
2. Select a supplier
3. Add a purchase item:
    - Select a product
    - Enter QTY: `100`
    - Leave Gudang (Warehouse) field empty or `0`
    - Enter a price
4. Observe the Toko field

**Expected Results:**

-   Toko field should automatically show: `100`
-   Gudang field should show: `0`

**Verification:** 5. Submit the purchase 6. Check the database:

```sql
SELECT qty, qty_gudang, qty_toko FROM purchase_items WHERE id = [last_insert_id];
```

7. Expected values: qty=100, qty_gudang=0, qty_toko=100

**Backend Log:**
Should see: `[PurchaseController] Alokasi ke toko saja (no warehouse qty)`

---

### Test Case 2: QTY + Gudang - Split Allocation

**Objective:** Verify proper split between warehouse and shop

**Steps:**

1. Navigate to Purchases > Create Purchase
2. Select a supplier
3. Add a purchase item:
    - Select a product
    - Enter QTY: `100`
    - Enter Gudang: `30`
    - Enter a price
4. Observe the Toko field

**Expected Results:**

-   Toko field should automatically show: `70` (100 - 30)
-   Gudang field should show: `30`

**Verification:** 5. Submit the purchase 6. Check the database:

```sql
SELECT qty, qty_gudang, qty_toko FROM purchase_items WHERE id = [last_insert_id];
```

7. Expected values: qty=100, qty_gudang=30, qty_toko=70

**Stock Check:** 8. Verify warehouse stock:

```sql
SELECT stock FROM warehouse_stocks WHERE product_id = [product_id];
```

Should have increased by 30

9. Verify shop stock:
    ```sql
    SELECT stock FROM products WHERE id = [product_id];
    ```
    Should have increased by 70

**Backend Log:**
Should see: `[PurchaseController] Alokasi ke gudang dan toko`

---

### Test Case 3: Gudang Only - All Stock to Warehouse

**Objective:** Verify that entering only Gudang QTY allocates all stock to warehouse

**Steps:**

1. Navigate to Purchases > Create Purchase
2. Select a supplier
3. Add a purchase item:
    - Select a product
    - Leave QTY field empty or enter `0`
    - Enter Gudang: `50`
    - Enter a price
4. Observe both QTY and Toko fields

**Expected Results:**

-   QTY field should automatically update to: `50`
-   Toko field should show: `0`
-   Gudang field should show: `50`

**Verification:** 5. Submit the purchase 6. Check the database:

```sql
SELECT qty, qty_gudang, qty_toko FROM purchase_items WHERE id = [last_insert_id];
```

7. Expected values: qty=50, qty_gudang=50, qty_toko=0

**Stock Check:** 8. Verify warehouse stock:

```sql
SELECT stock FROM warehouse_stocks WHERE product_id = [product_id];
```

Should have increased by 50

9. Verify shop stock:
    ```sql
    SELECT stock FROM products WHERE id = [product_id];
    ```
    Should NOT have changed (or increased by 0)

**Backend Log:**
Should see: `[PurchaseController] Alokasi ke gudang saja (no main qty)`

---

### Test Case 4: Edge Case - Gudang Greater Than QTY

**Objective:** Verify system prevents negative shop allocation

**Steps:**

1. Navigate to Purchases > Create Purchase
2. Select a supplier
3. Add a purchase item:
    - Select a product
    - Enter QTY: `50`
    - Enter Gudang: `80` (more than QTY)
    - Enter a price
4. Observe the Toko field

**Expected Results:**

-   Toko field should show: `0` (not negative)
-   Gudang field should show: `80`
-   QTY should remain: `50`

**Note:** System should handle this gracefully by setting Toko to 0

---

### Test Case 5: Dynamic Updates

**Objective:** Verify real-time updates when changing values

**Steps:**

1. Navigate to Purchases > Create Purchase
2. Select a supplier
3. Add a purchase item:

    - Select a product
    - Enter QTY: `100`
    - Observe Toko = 100, Gudang = 0

4. Now enter Gudang: `25`

    - Observe Toko should update to: `75`

5. Change QTY to: `200`

    - Gudang should remain: `25`
    - Toko should update to: `175`

6. Clear QTY (set to 0) while Gudang = `25`
    - QTY should auto-set to: `25`
    - Toko should update to: `0`

**Expected Results:**
All values should update dynamically without requiring page refresh

---

### Test Case 6: Multiple Items with Different Allocations

**Objective:** Verify each item can have independent allocation logic

**Steps:**

1. Navigate to Purchases > Create Purchase
2. Select a supplier
3. Add multiple items:

    **Item 1:**

    - Product A
    - QTY: `100` (no Gudang)
    - Expected: Toko = 100, Gudang = 0

    **Item 2:**

    - Product B
    - QTY: `80`, Gudang: `30`
    - Expected: Toko = 50, Gudang = 30

    **Item 3:**

    - Product C
    - QTY: `0`, Gudang: `60`
    - Expected: QTY auto = 60, Toko = 0, Gudang = 60

4. Submit the purchase

**Verification:**

```sql
SELECT product_id, qty, qty_gudang, qty_toko
FROM purchase_items
WHERE purchase_id = [last_purchase_id]
ORDER BY id;
```

**Expected:**

```
Product A: qty=100, qty_gudang=0,  qty_toko=100
Product B: qty=80,  qty_gudang=30, qty_toko=50
Product C: qty=60,  qty_gudang=60, qty_toko=0
```

---

## Browser Console Testing

### Check localStorage Updates

```javascript
// In browser console on Create Purchase page
JSON.parse(localStorage.getItem("purchase_items_table"));
```

Should show the array of items with correct qty, qty_gudang, and qty_toko values.

---

## Backend Log Monitoring

### Monitor Laravel Logs

```bash
tail -f storage/logs/laravel.log
```

Look for these log entries:

```
[PurchaseController] Alokasi ke toko saja (no warehouse qty)
[PurchaseController] Alokasi ke gudang dan toko
[PurchaseController] Alokasi ke gudang saja (no main qty)
[PurchaseController] Alokasi manual diterima
```

---

## Database Queries for Verification

### Check Last Purchase

```sql
SELECT * FROM purchases ORDER BY id DESC LIMIT 1;
```

### Check Last Purchase Items

```sql
SELECT
    pi.id,
    p.name as product_name,
    pi.qty,
    pi.qty_gudang,
    pi.qty_toko,
    pi.harga_pembelian,
    pi.subtotal
FROM purchase_items pi
JOIN products p ON p.id = pi.product_id
WHERE pi.purchase_id = [purchase_id]
ORDER BY pi.id;
```

### Check Stock Movements

```sql
SELECT
    sm.product_id,
    sm.type,
    sm.quantity,
    sm.description,
    sm.created_at
FROM stock_movements sm
WHERE sm.related_type = 'purchase'
    AND sm.related_id = [purchase_id]
ORDER BY sm.created_at DESC;
```

### Check Warehouse Stocks

```sql
SELECT
    ws.product_id,
    p.name as product_name,
    ws.stock,
    ws.warehouse_id
FROM warehouse_stocks ws
JOIN products p ON p.id = ws.product_id
WHERE ws.product_id IN ([product_ids])
ORDER BY ws.updated_at DESC;
```

### Check Product Stocks (Shop)

```sql
SELECT
    id,
    name,
    stock
FROM products
WHERE id IN ([product_ids])
ORDER BY updated_at DESC;
```

---

## Common Issues and Troubleshooting

### Issue 1: Toko field not updating

**Solution:** Check browser console for JavaScript errors, ensure `onItemUpdate` is properly bound

### Issue 2: Database not reflecting correct values

**Solution:** Check backend logs, verify validation is not modifying values

### Issue 3: Negative stock appearing

**Solution:** Review the negative prevention logic in both frontend and backend

### Issue 4: localStorage not persisting

**Solution:** Clear localStorage and try again:

```javascript
localStorage.removeItem("purchase_items_table");
localStorage.removeItem("purchase_draft_item");
```

---

## Regression Testing

Ensure the following existing features still work:

1. **Kuli Fee:** Fee kuli calculation should still work correctly
2. **Timbangan:** Timbangan (weighing) adjustments should function
3. **Price Input:** Currency formatting for prices should work
4. **Unit Conversion:** Different units should convert properly
5. **Subtotal Calculation:** Subtotals should calculate correctly
6. **Multiple Items:** Adding/removing items should work smoothly
7. **Form Submission:** Purchase should save successfully to database

---

## Performance Testing

### Test with Large Dataset

1. Create a purchase with 20+ items
2. Verify page performance remains acceptable
3. Check localStorage size doesn't exceed limits
4. Verify database transaction completes within reasonable time

### Expected Performance

-   Page load: < 2 seconds
-   Item addition: < 200ms
-   Auto-calculation: < 100ms
-   Form submission: < 3 seconds

---

## Accessibility Testing

1. **Keyboard Navigation:** Tab through fields in correct order
2. **Screen Reader:** Field labels should be properly read
3. **Input Validation:** Error messages should be clear and helpful
4. **Focus States:** Fields should show clear focus indicators

---

## Cross-Browser Testing

Test on:

-   Chrome (latest)
-   Firefox (latest)
-   Safari (latest)
-   Edge (latest)

All features should work consistently across browsers.

---

## Success Criteria

✅ All 6 test cases pass
✅ Database values match expected results
✅ Stock updates correctly in warehouse and shop
✅ No JavaScript errors in console
✅ Backend logs show correct allocation scenarios
✅ LocalStorage properly stores item data
✅ Existing features not affected (regression tests pass)
✅ Performance acceptable with multiple items
✅ Works across all major browsers
