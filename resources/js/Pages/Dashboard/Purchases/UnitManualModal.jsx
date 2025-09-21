import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";

export default function UnitManualModal({
    show,
    onClose,
    onSubmit,
    manualUnit,
    onChange,
    isLoading = false,
}) {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Unit Manual</DialogTitle>
                    <DialogDescription>
                        Masukkan informasi unit yang akan ditambahkan secara
                        manual.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="unit-name">Nama Unit</Label>
                        <Input
                            id="unit-name"
                            type="text"
                            name="name"
                            value={manualUnit.name}
                            onChange={onChange}
                            placeholder="Masukkan nama unit (contoh: Kg, Gram, Liter)"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unit-conversion">
                            Konversi ke Kilogram
                        </Label>
                        <Input
                            id="unit-conversion"
                            type="number"
                            step="0.001"
                            name="conversion_to_kg"
                            value={manualUnit.conversion_to_kg}
                            onChange={onChange}
                            placeholder="Masukkan nilai konversi (contoh: 1 untuk Kg, 0.001 untuk Gram)"
                            required
                            disabled={isLoading}
                        />
                        <p className="text-sm text-gray-500">
                            Berapa kilogram dalam 1 unit ini? (contoh: 1 Kg = 1,
                            1 Gram = 0.001)
                        </p>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
