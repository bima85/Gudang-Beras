import React, { useEffect } from "react";
import { Head } from "@inertiajs/react";
import BackToDashboard from "@/Components/Dashboard/BackToDashboard";

export default function Print({ transaction = {}, store }) {
    const formatPrice = (price) => {
        return price.toLocaleString("id-ID", {
            style: "currency",
            currency: "IDR",
        });
    };

    useEffect(() => {
        window.print();
    }, []);

    const details = Array.isArray(transaction.details)
        ? transaction.details
        : [];
    console.log("Transaction data:", transaction); // Debugging
    console.log("Details data:", details); // Debugging details

    // Pastikan komponen hanya merender konten cetak
    if (!transaction || !transaction.id) {
        return <div>Error: Data transaksi tidak tersedia</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white print:bg-white print:text-black">
            <Head title="Print Invoice" />
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold">
                    {transaction.warehouse
                        ? transaction.warehouse.name
                        : store?.name || "Toko"}
                </h1>
                {transaction.warehouse && (
                    <>
                        <p>Kode: {transaction.warehouse.code || "-"}</p>
                        <p>Telp: {transaction.warehouse.phone || "-"}</p>
                        <p>{transaction.warehouse.location || "-"}</p>
                    </>
                )}
            </div>
            <div className="flex justify-between mb-6 bg-white text-black print:bg-white print:text-black">
                <div>
                    <h2 className="text-lg font-semibold">Invoice</h2>
                    <p>No: {transaction.invoice || "-"}</p>
                    <p>
                        Date:{" "}
                        {transaction.created_at
                            ? new Date(
                                  transaction.created_at
                              ).toLocaleDateString()
                            : "-"}
                    </p>
                </div>
                <div className="text-right">
                    <h2 className="text-lg font-semibold">Customer</h2>
                    <p>{transaction.customer?.name || "-"}</p>
                    <p>{transaction.customer?.address || "-"}</p>
                </div>
            </div>
            <div className="mb-6 bg-white text-black print:bg-white print:text-black">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr>
                            <th className="border-b py-2">No</th>
                            <th className="border-b py-2">Product</th>
                            <th className="border-b py-2">Kategori</th>
                            <th className="border-b py-2">Subkategori</th>
                            <th className="border-b py-2">Satuan</th>
                            <th className="border-b py-2">Qty</th>
                            <th className="border-b py-2">Price</th>
                            <th className="border-b py-2">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.length === 0 && (
                            <tr key="nodata">
                                <td
                                    colSpan="8"
                                    className="text-center py-2 text-gray-500"
                                >
                                    Tidak ada data
                                </td>
                            </tr>
                        )}
                        {details.length > 0 &&
                            details.map((item, index) => {
                                return (
                                    <tr key={index}>
                                        <td className="border-b py-2">
                                            {index + 1}
                                        </td>
                                        <td className="border-b py-2">
                                            {item.product?.name || "-"}
                                        </td>
                                        <td className="border-b py-2">
                                            {item.category?.name ||
                                                item.product?.category?.name ||
                                                "-"}
                                        </td>
                                        <td className="border-b py-2">
                                            {item.subcategory?.name ||
                                                item.product?.subcategory
                                                    ?.name ||
                                                "-"}
                                        </td>
                                        <td className="border-b py-2">
                                            {item.unit
                                                ? `${item.unit.name} (${item.unit.conversion_to_kg}Kg)`
                                                : item.satuan || "-"}
                                        </td>
                                        <td className="border-b py-2">
                                            {item.qty || 0}
                                        </td>
                                        <td className="border-b py-2">
                                            {formatPrice(item.price || 0)}
                                        </td>
                                        <td className="border-b py-2">
                                            {formatPrice(item.subtotal || 0)}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colSpan="6" className="text-right py-2">
                                Discount
                            </td>
                            <td colSpan="2" className="py-2">
                                {formatPrice(transaction.discount || 0)}
                            </td>
                        </tr>
                        <tr>
                            <td
                                colSpan="6"
                                className="text-right py-2 font-semibold"
                            >
                                Total
                            </td>
                            <td colSpan="2" className="py-2 font-semibold">
                                {formatPrice(transaction.grand_total || 0)}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="6" className="text-right py-2">
                                Cash
                            </td>
                            <td colSpan="2" className="py-2">
                                {formatPrice(transaction.cash || 0)}
                            </td>
                        </tr>
                        {transaction.is_deposit && (
                            <tr>
                                <td colSpan="6" className="text-right py-2">
                                    Deposit Digunakan
                                </td>
                                <td colSpan="2" className="py-2">
                                    {formatPrice(
                                        transaction.deposit_amount || 0
                                    )}
                                </td>
                            </tr>
                        )}
                        <tr>
                            <td colSpan="6" className="text-right py-2">
                                {transaction.add_change_to_deposit
                                    ? "Kembalian (Ditambahkan ke Deposit)"
                                    : "Change"}
                            </td>
                            <td colSpan="2" className="py-2">
                                {transaction.add_change_to_deposit
                                    ? formatPrice(
                                          transaction.change_to_deposit_amount ||
                                              0
                                      )
                                    : formatPrice(transaction.change || 0)}
                            </td>
                        </tr>
                        {transaction.add_change_to_deposit && (
                            <tr>
                                <td colSpan="6" className="text-right py-2">
                                    Saldo Deposit Baru
                                </td>
                                <td colSpan="2" className="py-2">
                                    {formatPrice(
                                        (transaction.customer?.deposit || 0) +
                                            (transaction.change_to_deposit_amount ||
                                                0) -
                                            (transaction.is_deposit
                                                ? transaction.deposit_amount ||
                                                  0
                                                : 0)
                                    )}
                                </td>
                            </tr>
                        )}
                    </tfoot>
                </table>
            </div>
            <div className="mb-4 bg-white text-black print:bg-white print:text-black">
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <tr>
                            <td className="py-1 font-semibold">
                                Metode Pembayaran
                            </td>
                            <td className="py-1">
                                {transaction.payment_method === "cash"
                                    ? "Cash"
                                    : transaction.payment_method === "tempo"
                                    ? "Tempo"
                                    : transaction.payment_method === "deposit"
                                    ? "Deposit"
                                    : "-"}
                                {transaction.is_deposit &&
                                transaction.payment_method !== "deposit"
                                    ? " + Deposit"
                                    : ""}
                            </td>
                        </tr>
                        {transaction.is_tempo && transaction.tempo_due_date && (
                            <tr>
                                <td className="py-1 font-semibold">
                                    Jatuh Tempo
                                </td>
                                <td className="py-1">
                                    {new Date(
                                        transaction.tempo_due_date
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="text-center mt-8 text-black print:text-black">
                <p className="text-sm">Thank you for your purchase!</p>
                <p className="text-sm">Please come again.</p>
                <div className="mt-4 text-base font-semibold">
                    Saldo Deposit Terakhir:{" "}
                    {formatPrice(transaction.customer?.deposit || 0)}
                </div>
                <div className="mt-4">
                    <BackToDashboard className="mb-3" />
                    <button
                        type="button"
                        onClick={() =>
                            (window.location.href = "/dashboard/transactions")
                        }
                        className="btn btn-primary mt-6 px-6 py-2 rounded shadow"
                    >
                        Kembali ke Transaksi
                    </button>
                </div>
            </div>
        </div>
    );
}
Print.layout = (page) => <>{page}</>;
