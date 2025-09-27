import React, { useState } from "react";
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
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { cn } from "@/lib/utils";
import { User, Phone, MapPin, Plus, Search } from "lucide-react";

export default function CustomerModal({
    showModal,
    setShowModal,
    newCustomerName,
    setNewCustomerName,
    newCustomerPhone,
    setNewCustomerPhone,
    newCustomerAddress,
    setNewCustomerAddress,
    handleAddCustomer,
    customers = [],
    onSelectCustomer,
}) {
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);

    const filteredCustomers = customers.filter(
        (customer) =>
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.no_telp && customer.no_telp.includes(searchTerm))
    );

    const resetAndClose = () => {
        setSearchTerm("");
        setShowCreateForm(false);
        setNewCustomerName("");
        setNewCustomerPhone("");
        setNewCustomerAddress("");
        setShowModal(false);
    };

    return (
        <Dialog open={showModal} onOpenChange={resetAndClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        {showCreateForm
                            ? "Tambah Pelanggan Baru"
                            : "Pilih Pelanggan"}
                    </DialogTitle>
                    <DialogDescription>
                        {showCreateForm
                            ? "Isi form di bawah untuk menambahkan pelanggan baru ke sistem."
                            : "Pilih pelanggan dari daftar atau tambahkan pelanggan baru."}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    {!showCreateForm ? (
                        <div className="space-y-4">
                            {/* Search and Add Button */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Cari nama atau nomor telepon..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateForm(true)}
                                    className="flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Baru
                                </Button>
                            </div>

                            {/* Customer List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {/* General Customer Option */}
                                <Card
                                    className="cursor-pointer hover:bg-accent transition-colors"
                                    onClick={() => {
                                        if (onSelectCustomer)
                                            onSelectCustomer(null);
                                        resetAndClose();
                                    }}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium">
                                                    Pelanggan Umum
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    Transaksi tanpa data
                                                    pelanggan spesifik
                                                </p>
                                            </div>
                                            <Badge variant="secondary">
                                                Default
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Filtered Customers */}
                                {filteredCustomers.length > 0
                                    ? filteredCustomers.map((customer) => (
                                        <Card
                                            key={customer.id}
                                            className="cursor-pointer hover:bg-accent transition-colors"
                                            onClick={() => {
                                                if (onSelectCustomer)
                                                    onSelectCustomer(
                                                        customer.id
                                                    );
                                                resetAndClose();
                                            }}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium truncate">
                                                            {customer.name}
                                                        </h3>
                                                        <div className="space-y-1 mt-1">
                                                            {customer.no_telp && (
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <Phone className="w-3 h-3" />
                                                                    <span>{customer.no_telp}</span>
                                                                </div>
                                                            )}
                                                            {customer.address && (
                                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                    <MapPin className="w-3 h-3" />
                                                                    <span className="truncate">
                                                                        {
                                                                            customer.address
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                    : searchTerm && (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>
                                                Tidak ada pelanggan yang
                                                ditemukan
                                            </p>
                                            <p className="text-sm">
                                                Coba kata kunci lain atau
                                                tambah pelanggan baru
                                            </p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    ) : (
                        /* Create Customer Form */
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="customer-name"
                                    className="text-sm font-medium"
                                >
                                    Nama Pelanggan *
                                </Label>
                                <Input
                                    id="customer-name"
                                    type="text"
                                    value={newCustomerName}
                                    onChange={(e) =>
                                        setNewCustomerName(e.target.value)
                                    }
                                    placeholder="Masukkan nama pelanggan"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="customer-phone"
                                    className="text-sm font-medium"
                                >
                                    Nomor Telepon *
                                </Label>
                                <Input
                                    id="customer-phone"
                                    type="tel"
                                    value={newCustomerPhone}
                                    onChange={(e) =>
                                        setNewCustomerPhone(e.target.value)
                                    }
                                    placeholder="Masukkan nomor telepon"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="customer-address"
                                    className="text-sm font-medium"
                                >
                                    Alamat
                                </Label>
                                <Textarea
                                    id="customer-address"
                                    value={newCustomerAddress}
                                    onChange={(e) =>
                                        setNewCustomerAddress(e.target.value)
                                    }
                                    placeholder="Masukkan alamat pelanggan"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1"
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={() => {
                                        handleAddCustomer();
                                        setShowCreateForm(false);
                                    }}
                                    disabled={
                                        !newCustomerName.trim() ||
                                        !newCustomerPhone.trim()
                                    }
                                    className="flex-1"
                                >
                                    Simpan
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
