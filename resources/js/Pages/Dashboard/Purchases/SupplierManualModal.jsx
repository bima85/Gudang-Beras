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

export default function SupplierManualModal({
    show,
    onClose,
    onSubmit,
    manualSupplier,
    onChange,
    errors = {},
    submitting = false,
}) {
    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Supplier Manual</DialogTitle>
                    <DialogDescription>
                        Masukkan informasi supplier yang akan ditambahkan secara
                        manual.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="supplier-name">Nama Supplier</Label>
                        <Input
                            id="supplier-name"
                            type="text"
                            name="name"
                            value={manualSupplier.name}
                            onChange={onChange}
                            placeholder="Masukkan nama supplier"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supplier-address">Alamat Supplier</Label>
                        <Input
                            id="supplier-address"
                            type="text"
                            name="address"
                            value={manualSupplier.address}
                            onChange={onChange}
                            placeholder="Masukkan alamat supplier"
                            required
                        />
                        {errors.address && (
                            <p className="mt-1 text-sm text-red-600">{errors.address[0]}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="supplier-phone">No. Telepon Supplier</Label>
                        <Input
                            id="supplier-phone"
                            type="text"
                            name="phone"
                            value={manualSupplier.phone}
                            onChange={onChange}
                            placeholder="Masukkan nomor telepon"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone[0]}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                            Batal
                        </Button>
                        <Button type="button" onClick={onSubmit} disabled={submitting}>
                            {submitting ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
