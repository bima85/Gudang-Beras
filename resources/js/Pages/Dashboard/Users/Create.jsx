import React, { useState } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import Card from "@/Components/Dashboard/Card";
import DashboardLayout from "@/Layouts/DashboardLayout";
import {
    IconUsersPlus,
    IconPencilPlus,
    IconUserShield,
} from "@tabler/icons-react";
import Input from "@/Components/Dashboard/Input";
import Button from "@/Components/Dashboard/Button";
import Checkbox from "@/Components/Dashboard/Checkbox";
import toast from "react-hot-toast";
export default function Create() {
    // destruct props roles from use page
    const { roles } = usePage().props;

    const [purchasesAccess, setPurchasesAccess] = useState(false);
    const [transactionsAccess, setTransactionsAccess] = useState(false);
    const { data, setData, post, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
        selectedRoles: [],
    });

    const setSelectedRoles = (e) => {
        const value = e.target.value;
        let items = [...data.selectedRoles];
        if (e.target.checked) {
            if (!items.includes(value)) items.push(value);
        } else {
            items = items.filter((v) => v !== value);
        }
        setData("selectedRoles", items);
    };

    const saveUser = async (e) => {
        e.preventDefault();
        const payload = {
            ...data,
            purchasesAccess: purchasesAccess,
            transactionsAccess: transactionsAccess,
        };
        post(route("users.store"), {
            data: payload,
            onSuccess: () => {
                toast("Data berhasil disimpan", {
                    icon: "👏",
                    style: {
                        borderRadius: "10px",
                        background: "#1C1F29",
                        color: "#fff",
                    },
                });
            },
            onError: (err) => {
                // Tampilkan semua error sebagai toast popup
                if (typeof err === "object") {
                    Object.values(err).forEach((msg) => {
                        toast.error(Array.isArray(msg) ? msg[0] : msg);
                    });
                } else {
                    toast.error(err);
                }
            },
        });
    };

    return (
        <>
            <Head title={"Tambah Data Pengguna"} />
            <Card
                title={"Tambah Data Pengguna"}
                icon={<IconUsersPlus size={20} strokeWidth={1.5} />}
            >
                <form onSubmit={saveUser}>
                    <div className="mb-4 flex flex-col md:flex-row justify-between gap-4">
                        <div className="w-full md:w-1/2">
                            <Input
                                type={"text"}
                                label={"Nama Pengguna"}
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                errors={errors.name}
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <Input
                                type={"email"}
                                label={"Email Pengguna"}
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                errors={errors.email}
                            />
                        </div>
                    </div>
                    <div className="mb-4 flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-1/2">
                            <Input
                                type={"password"}
                                label={"Kata Sandi"}
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                errors={errors.password}
                            />
                        </div>
                        <div className="w-full md:w-1/2">
                            <Input
                                type={"password"}
                                label={"Konfirmasi Kata Sandi"}
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>
                    <div
                        className={`p-4 rounded-t-lg border bg-white dark:bg-gray-950 dark:border-gray-900`}
                    >
                        <div className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-400">
                            Akses Group
                        </div>
                    </div>
                    <div className="p-4 rounded-b-lg border border-t-0 bg-gray-100 dark:bg-gray-900 dark:border-gray-900">
                        <div className="flex flex-row flex-wrap gap-4">
                            {roles.map((role, i) => (
                                <Checkbox
                                    label={role.name}
                                    value={role.name}
                                    onChange={setSelectedRoles}
                                    key={i}
                                />
                            ))}
                            {/* Tambahan akses permission purchases-access dan transactions-access */}
                            <Checkbox
                                label={"purchases-access"}
                                value={"purchases-access"}
                                checked={purchasesAccess}
                                onChange={(e) =>
                                    setPurchasesAccess(e.target.checked)
                                }
                                key={"purchases-access"}
                            />
                            <Checkbox
                                label={"transactions-access"}
                                value={"transactions-access"}
                                checked={transactionsAccess}
                                onChange={(e) =>
                                    setTransactionsAccess(e.target.checked)
                                }
                                key={"transactions-access"}
                            />
                        </div>
                        {errors.selectedRoles && (
                            <div className="text-xs text-red-500 mt-4">
                                {errors.selectedRoles}
                            </div>
                        )}
                    </div>
                    <div className="px-4 py-2 rounded-b-lg border bg-white dark:bg-gray-950 dark:border-gray-900 ">
                        <Button
                            type={"submit"}
                            label={"Simpan"}
                            icon={
                                <IconPencilPlus size={20} strokeWidth={1.5} />
                            }
                            className={
                                "border bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                            }
                        />
                    </div>
                </form>
            </Card>
        </>
    );
}

Create.layout = (page) => <DashboardLayout children={page} />;
