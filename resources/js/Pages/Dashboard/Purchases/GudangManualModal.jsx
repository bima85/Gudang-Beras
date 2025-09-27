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
    onGudangAdded,
}) {
    const [local, setLocal] = React.useState({ name: "", address: "", phone: "" });

    React.useEffect(() => {
        if (manualGudang) setLocal(manualGudang);
    }, [manualGudang]);

    const handleChange = (e) => {
        if (onChange) return onChange(e);
        const { name, value } = e.target;
        setLocal((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = () => {
        if (typeof onSubmit === "function") return onSubmit();
        if (typeof onGudangAdded === "function") return onGudangAdded(local);
    };

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
                            value={manualGudang?.name ?? local.name ?? ""}
                            onChange={handleChange}
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
                            value={manualGudang?.address ?? local.address ?? ""}
                            onChange={handleChange}
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
                            value={manualGudang?.phone ?? local.phone ?? ""}
                            onChange={handleChange}
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
                        <Button type="button" onClick={handleSubmit}>
                            Simpan
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
