import React, { useState, useEffect } from "react";
import Input from "@/Components/Dashboard/Input";

export default function TransactionInfo({
    cashierName,
    onTransactionInfoChange,
    warehouses = [],
    selectedWarehouse,
    setSelectedWarehouse,
}) {
    const [transactionInfo, setTransactionInfo] = useState({
        transactionDate: "",
        invoiceNumber: "",
        invoice: "",
        customer: null,
    });
    const updateTransactionInfo = (updates) => {
        const newInfo = { ...transactionInfo, ...updates };

        // Generate invoice if needed
        if (newInfo.transactionDate && newInfo.invoiceNumber) {
            const formattedDate = newInfo.transactionDate.replace(/-/g, "");
            const paddedNumber = newInfo.invoiceNumber.padStart(3, "0");
            newInfo.invoice = `TRX-${formattedDate}-${paddedNumber}`;
        } else {
            newInfo.invoice = "";
        }

        setTransactionInfo(newInfo);
        onTransactionInfoChange(newInfo);
    };

    useEffect(() => {
        // Initial notification to parent
        onTransactionInfoChange(transactionInfo);
    }, []);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Informasi Transaksi
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                    type="date"
                    label="Tanggal Transaksi"
                    value={transactionInfo.transactionDate}
                    onChange={(e) =>
                        updateTransactionInfo({
                            transactionDate: e.target.value,
                        })
                    }
                    className="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-md focus:ring-teal-500 dark:focus:ring-teal-400"
                    required
                />
                <Input
                    type="number"
                    label="Nomor Urut (3 digit)"
                    placeholder="001"
                    value={transactionInfo.invoiceNumber}
                    onChange={(e) => {
                        let val = e.target.value;
                        if (
                            val === "" ||
                            (val.length <= 3 && /^\d*$/.test(val))
                        ) {
                            updateTransactionInfo({ invoiceNumber: val });
                        }
                    }}
                    min={1}
                    max={999}
                    className="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-md focus:ring-teal-500 dark:focus:ring-teal-400"
                    required
                />
                <Input
                    type="text"
                    label="Nomor Invoice"
                    placeholder="TRX-YYYYMMDD-XXX"
                    value={transactionInfo.invoice}
                    readOnly
                    className="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md"
                />
                <Input
                    type="text"
                    label="Kasir"
                    value={cashierName}
                    readOnly
                    className="w-full text-sm border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-md"
                />
                {/* Dropdown Gudang */}
                <div>
                    <label
                        htmlFor="warehouse"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Gudang
                    </label>
                    <select
                        id="warehouse"
                        value={selectedWarehouse ? selectedWarehouse.id : ""}
                        onChange={(e) => {
                            const warehouse = warehouses.find(
                                (w) => w.id === parseInt(e.target.value)
                            );
                            setSelectedWarehouse(warehouse || null);
                        }}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    >
                        <option value="">Pilih Gudang</option>
                        {warehouses.map((w) => (
                            <option key={w.id} value={w.id}>
                                {w.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
