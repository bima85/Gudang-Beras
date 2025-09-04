import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";

export default function Index() {
    const { auth } = usePage().props;
    const [surats, setSurats] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get(route("deliveries.data"))
            .then((res) => {
                if (res.data && res.data.data) setSurats(res.data.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const canManage = (roles) => {
        const rs = auth?.user?.roles || [];
        return rs.some((r) =>
            ["super-admin", "toko", "gudang"].includes(r.name)
        );
    };

    return (
        <DashboardLayout>
            <Head title="Surat Jalan" />
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Daftar Surat Jalan</h1>
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr>
                                <th>No Surat</th>
                                <th>Invoice</th>
                                <th>Toko</th>
                                <th>Produk (qty / unit)</th>
                                <th>Status</th>
                                <th>Dibuat Oleh</th>
                            </tr>
                        </thead>
                        <tbody>
                            {surats.map((s) => (
                                <tr key={s.id}>
                                    <td>{s.no_surat}</td>
                                    <td>
                                        {s.transaction
                                            ? s.transaction.invoice
                                            : "-"}
                                    </td>
                                    <td>
                                        {s.toko
                                            ? s.toko.name
                                            : s.toko_id ?? "-"}
                                    </td>
                                    <td>
                                        {s.transaction &&
                                        s.transaction.details &&
                                        s.transaction.details.length > 0 ? (
                                            s.transaction.details.map((d) => (
                                                <div key={d.product_id}>
                                                    {d.product
                                                        ? d.product.name
                                                        : d.product_id}{" "}
                                                    ({d.qty}{" "}
                                                    {d.unit ? d.unit.name : ""})
                                                </div>
                                            ))
                                        ) : (
                                            <span>-</span>
                                        )}
                                    </td>
                                    <td>{s.status}</td>
                                    <td>
                                        {s.user
                                            ? s.user.name
                                            : s.user_id ?? "-"}
                                    </td>
                                    <td>
                                        {s.status !== "picked" &&
                                            canManage() && (
                                                <button
                                                    onClick={() => {
                                                        if (
                                                            !window.confirm(
                                                                "Konfirmasi: tandai surat jalan ini sebagai sudah diambil?"
                                                            )
                                                        )
                                                            return;
                                                        axios
                                                            .post(
                                                                route(
                                                                    "deliveries.pick",
                                                                    s.id
                                                                )
                                                            )
                                                            .then((res) => {
                                                                if (
                                                                    res.data &&
                                                                    res.data
                                                                        .success
                                                                ) {
                                                                    const newSurat =
                                                                        res.data
                                                                            .surat;
                                                                    setSurats(
                                                                        (
                                                                            prev
                                                                        ) =>
                                                                            prev.map(
                                                                                (
                                                                                    item
                                                                                ) =>
                                                                                    item.id ===
                                                                                    s.id
                                                                                        ? newSurat
                                                                                        : item
                                                                            )
                                                                    );
                                                                }
                                                            })
                                                            .catch((err) => {
                                                                alert(
                                                                    err
                                                                        ?.response
                                                                        ?.data
                                                                        ?.message ||
                                                                        "Gagal menandai diambil"
                                                                );
                                                            });
                                                    }}
                                                    className="btn btn-sm btn-success"
                                                >
                                                    Tandai Diambil
                                                </button>
                                            )}
                                    </td>
                                    <td>
                                        {s.picked_at
                                            ? new Date(
                                                  s.picked_at
                                              ).toLocaleString()
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </DashboardLayout>
    );
}
