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
    React.useEffect(() => {
        toast.dismiss();
        const onNavigate = () => toast.dismiss();
        if (window && window.Inertia) {
            window.Inertia.on("navigate", onNavigate);
        }
        return () => {
            if (window && window.Inertia) {
                window.Inertia.off("navigate", onNavigate);
            }
        };
    }, []);
    const { errors } = usePage().props;

    const { data, setData, post, processing } = useForm({
        name: "",
        no_telp: "",
        address: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("customers.store"), {
            onSuccess: (page) => {
                if (
                    !page.props.errors ||
                    Object.keys(page.props.errors).length === 0
                ) {
                    window.location.href = route("customers.index");
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
            <Head title="Tambah Data Pelanggan" />
            <Card
                title={"Tambah Data Pelanggan"}
                icon={<IconUsersPlus size={20} strokeWidth={1.5} />}
            >
                <form onSubmit={submit} encType="multipart/form-data">
                    <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Input
                                name="name"
                                label={"Name"}
                                type={"text"}
                                placeholder={"Nama pelanggan"}
                                errors={errors.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                value={data.name}
                            />
                        </div>
                        <div className="col-span-6">
                            <Input
                                name="no_telp"
                                label={"No. Handphone"}
                                type={"text"}
                                placeholder={"No. Handphone pelanggan"}
                                errors={errors.no_telp}
                                onChange={(e) =>
                                    setData("no_telp", e.target.value)
                                }
                                value={data.no_telp}
                            />
                        </div>
                        <div className="col-span-12">
                            <Textarea
                                name="address"
                                label={"Address"}
                                type={"text"}
                                placeholder={"Alamat pelanggan"}
                                errors={errors.address}
                                onChange={(e) =>
                                    setData("address", e.target.value)
                                }
                                value={data.address}
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex gap-4">
                        <Button
                            type="submit"
                            label="Simpan"
                            icon={
                                <IconPencilPlus size={20} strokeWidth={1.5} />
                            }
                            className={
                                "border  bg-blue-600 text-white hover:bg-blue-800 transition-colors "
                            }
                            disabled={processing}
                        />
                        <Button
                            type="button"
                            label="Kembali"
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md shadow transition-colors w-full sm:w-auto"
                            onClick={() => window.history.back()}
                        />
                    </div>
                </form>
            </Card>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
