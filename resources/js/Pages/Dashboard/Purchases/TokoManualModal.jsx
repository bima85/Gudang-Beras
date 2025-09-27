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

export default function TokoManualModal({
    show,
    onClose,
    onSubmit,
    manualToko,
    onChange,
    // alternative callback used by Edit.jsx
    onTokoAdded,
}) {
    const [local, setLocal] = React.useState({ name: "", address: "", phone: "" });

    React.useEffect(() => {
        if (manualToko) setLocal(manualToko);
    }, [manualToko]);

    const handleChange = (e) => {
        if (onChange) return onChange(e);
        const { name, value } = e.target;
        setLocal((s) => ({ ...s, [name]: value }));
    };

    const handleSubmit = () => {
        if (typeof onSubmit === "function") return onSubmit();
        if (typeof onTokoAdded === "function") return onTokoAdded(local);
    };

    return (
        <Dialog open={show} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tambah Toko Manual</DialogTitle>
                    <DialogDescription>
                        Masukkan informasi toko yang akan ditambahkan secara
                        manual.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="toko-name">Nama Toko</Label>
                        <Input
                            id="toko-name"
                            type="text"
                            name="name"
                            value={manualToko?.name ?? local.name ?? ""}
                            onChange={handleChange}
                            placeholder="Masukkan nama toko"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="toko-address">Alamat Toko</Label>
                        <Input
                            id="toko-address"
                            type="text"
                            name="address"
                            value={manualToko?.address ?? local.address ?? ""}
                            onChange={handleChange}
                            placeholder="Masukkan alamat toko"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="toko-phone">No. Telepon Toko</Label>
                        <Input
                            id="toko-phone"
                            type="text"
                            name="phone"
                            value={manualToko?.phone ?? local.phone ?? ""}
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
