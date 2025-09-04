import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Card from "@/Components/Dashboard/Card";
import Button from "@/Components/Dashboard/Button";
import { IconPencilPlus, IconUsersPlus } from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import toast from "react-hot-toast";

export default function Create() {
    const { errors } = usePage().props;
    const { data, setData, post, processing } = useForm({
        name: "",
        phone: "",
        address: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("suppliers.store"), {
            onSuccess: () => {
                if (Object.keys(errors).length === 0) {
                    toast("Data berhasil disimpan", {
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
                toast("Terjadi kesalahan dalam penyimpanan data", {
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
            <Head title="Tambah Data Supplier" />
            <Card
                title={"Tambah Data Supplier"}
                icon={<IconUsersPlus size={20} strokeWidth={1.5} />}
                footer={
                    <div className="flex gap-2">
                        <Button
                            type={"button"}
                            label={"Cancel"}
                            className={
                                "border bg-gray-200 text-gray-700 hover:bg-gray-300"
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
                                "border bg-sky-600 text-white hover:bg-sky-700"
                            }
                            form="supplier-create-form"
                        />
                    </div>
                }
            >
                <form
                    id="supplier-create-form"
                    onSubmit={submit}
                    className="space-y-4"
                >
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
                </form>
            </Card>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
