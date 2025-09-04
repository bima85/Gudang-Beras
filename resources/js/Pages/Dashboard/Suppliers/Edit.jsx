import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Card from "@/Components/Dashboard/Card";
import Button from "@/Components/Dashboard/Button";
import { IconPencilPlus, IconUsersPlus } from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import toast from "react-hot-toast";

export default function Edit({ supplier }) {
    const { errors } = usePage().props;
    const { data, setData, put, processing } = useForm({
        name: supplier.name || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("suppliers.update", supplier.id), {
            onSuccess: () => {
                if (Object.keys(errors).length === 0) {
                    toast("Data berhasil diupdate", {
                        icon: "👏",
                        style: {
                            borderRadius: "10px",
                            background: "#1C1F29",
                            color: "#fff",
                        },
                    });
                }
            },
            onError: () => {
                toast("Terjadi kesalahan dalam update data", {
                    style: {
                        borderRadius: "10px",
                        background: "#FF0000",
                        color: "#fff",
                    },
                });
            },
        });
    };

    return (
        <>
            <Head title="Edit Data Supplier" />
            <Card
                title={"Edit Data Supplier"}
                icon={<IconUsersPlus size={20} strokeWidth={1.5} />}
            >
                <form onSubmit={submit} className="space-y-4">
                    <Input
                        label="Nama Supplier"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        error={errors.name}
                        required
                    />
                    <Input
                        label="No. Handphone"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        error={errors.phone}
                    />
                    <Textarea
                        label="Alamat"
                        value={data.address}
                        onChange={(e) => setData("address", e.target.value)}
                        error={errors.address}
                    />
                    <div className="flex gap-2 pt-4">
                        <Button
                            type={"button"}
                            label={"Batal"}
                            className={
                                "border bg-red-500 text-gray-700 hover:bg-red-300 transition-colors duration-200"
                            }
                            onClick={() =>
                                (window.location.href =
                                    route("suppliers.index"))
                            }
                        />
                        <Button
                            type={"submit"}
                            label={"Simpan"}
                            icon={
                                <IconPencilPlus size={20} strokeWidth={1.5} />
                            }
                            className={
                                "border bg-sky-700 text-white hover:bg-sky-800 transition-colors duration-200"
                            }
                        />
                    </div>
                </form>
            </Card>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;
