import React from "react";
import Input from "@/Components/Input";
import InputSelect from "@/Components/InputSelect";
import Button from "@/Components/Button";

export default function PurchaseItemForm({
    index,
    item,
    setData,
    products,
    units,
    removeItem,
}) {
    // Helper agar update array of object tetap immutable dan support multi-item
    const updateField = (field, value) => {
        setData((prev) => {
            const items = [...prev.items];
            items[index] = { ...items[index], [field]: value };
            return { ...prev, items };
        });
    };

    // Temukan produk aktif
    const selectedProduct =
        Array.isArray(products) &&
        products.length > 0 &&
        item.product_id !== undefined &&
        item.product_id !== null &&
        item.product_id !== ""
            ? products.find((p) => String(p.id) === String(item.product_id)) ||
              null
            : null;
    // Temukan satuan aktif
    const selectedUnit =
        Array.isArray(units) &&
        units.length > 0 &&
        item.unit_id !== undefined &&
        item.unit_id !== null &&
        item.unit_id !== ""
            ? units.find((u) => String(u.id) === String(item.unit_id)) || null
            : null;

    // Opsi tipe satuan unik berdasarkan unit yang dipilih
    const unitTypeOptions = selectedUnit?.unit_details
        ? Array.from(
              new Map(
                  selectedUnit.unit_details.map((ud) => [
                      ud.name_unit.toLowerCase(),
                      {
                          value: ud.name_unit.toLowerCase(),
                          label: ud.name_unit,
                          key: ud.name_unit.toLowerCase() + "-" + ud.id,
                      },
                  ])
              ).values()
          )
        : [];

    // Pastikan unit_type selalu valid jika unit berubah
    React.useEffect(() => {
        if (
            selectedUnit &&
            selectedUnit.unit_details &&
            item.unit_type &&
            !selectedUnit.unit_details.some(
                (ud) => ud.name_unit.toLowerCase() === item.unit_type
            )
        ) {
            // Reset unit_type jika tidak valid
            updateField("unit_type", "");
        }
    }, [selectedUnit]);

    return (
        <div className="border p-4 rounded mb-4 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-gray-400 dark:text-gray-300">
                <InputSelect
                    label="Produk"
                    data={products}
                    selected={selectedProduct}
                    setSelected={(p) =>
                        updateField("product_id", p?.id ? String(p.id) : "")
                    }
                    displayKey="title"
                />
                <InputSelect
                    label="Satuan"
                    data={units}
                    selected={selectedUnit}
                    setSelected={(u) =>
                        updateField("unit_id", u?.id ? String(u.id) : "")
                    }
                    displayKey="label"
                />
                <InputSelect
                    label="Tipe Satuan"
                    data={unitTypeOptions}
                    selected={
                        unitTypeOptions.find(
                            (opt) => opt.value === item.unit_type
                        ) || null
                    }
                    setSelected={(opt) =>
                        updateField("unit_type", opt?.value || "")
                    }
                    displayKey="label"
                />
                <Input
                    label="Qty"
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateField("qty", e.target.value)}
                />
                <Input
                    label="Harga"
                    type="number"
                    value={item.price}
                    onChange={(e) => updateField("price", e.target.value)}
                />
                <div className="flex items-end">
                    <Button
                        type="button"
                        label="Hapus"
                        onClick={() => removeItem(index)}
                        className="bg-red-500 text-white w-full"
                    />
                </div>
            </div>
        </div>
    );
}
