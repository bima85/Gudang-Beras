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

export default function GudangManualModal({
    show,
    onClose,
    onSubmit,
    manualGudang,
    onChange,
}) {
    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Gudang Manual</DialogTitle>
                    <DialogDescription>
                        Masukkan informasi gudang yang akan ditambahkan secara
                        manual.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gudang-name">Nama Gudang</Label>
                        <Input
                            id="gudang-name"
                            type="text"
                            name="name"
                            value={manualGudang.name}
                            onChange={onChange}
                            placeholder="Masukkan nama gudang"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gudang-address">Alamat Gudang</Label>
                        <Input
                            id="gudang-address"
                            type="text"
                            name="address"
                            value={manualGudang.address}
                            onChange={onChange}
                            placeholder="Masukkan alamat gudang"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gudang-phone">No. Telepon Gudang</Label>
                        <Input
                            id="gudang-phone"
                            type="text"
                            name="phone"
                            value={manualGudang.phone}
                            onChange={onChange}
                            placeholder="Masukkan nomor telepon"
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            Batal
                        </Button>
                        <Button type="button" onClick={onSubmit}>
                            Simpan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
