import React from "react";
import Input from "@/Components/Dashboard/Input";
import Button from "@/Components/Dashboard/Button";
import { IconReceipt } from "@tabler/icons-react";

export default function PaymentSection({
    total,
    transactionInfo,
    onTransactionInfoChange,
    handleSubmit,
    cart,
    isDeposit,
    depositAmount,
}) {
    const updateTransactionInfo = (updates) => {
        const newInfo = { ...transactionInfo, ...updates };
        if ("paymentAmount" in updates) {
            newInfo.change = updates.paymentAmount - total;
        }
        onTransactionInfoChange(newInfo);
    };

    return (
        <form
            className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg"
            onSubmit={handleSubmit}
        >
            <div className="flex justify-between text-lg">
                <span>Total:</span>
                <span className="font-semibold">{total}</span>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Metode Pembayaran
                </label>
                <div className="flex gap-4">
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            value="cash"
                            checked={transactionInfo.paymentMethod === "cash"}
                            onChange={(e) =>
                                updateTransactionInfo({
                                    paymentMethod: e.target.value,
                                })
                            }
                            className="form-radio h-4 w-4 text-teal-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Tunai
                        </span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            value="tempo"
                            checked={transactionInfo.paymentMethod === "tempo"}
                            onChange={(e) =>
                                updateTransactionInfo({
                                    paymentMethod: e.target.value,
                                })
                            }
                            className="form-radio h-4 w-4 text-teal-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Tempo
                        </span>
                    </label>
                </div>
            </div>

            {transactionInfo.paymentMethod === "tempo" && (
                <Input
                    type="date"
                    label="Tanggal Jatuh Tempo"
                    value={transactionInfo.tempoDueDate}
                    onChange={(e) =>
                        updateTransactionInfo({ tempoDueDate: e.target.value })
                    }
                    className="w-full text-sm"
                    required
                />
            )}

            <Input
                type="number"
                label="Jumlah Pembayaran"
                value={
                    typeof transactionInfo.paymentAmount !== "undefined" &&
                    transactionInfo.paymentAmount !== null
                        ? String(transactionInfo.paymentAmount)
                        : ""
                }
                onChange={(e) =>
                    updateTransactionInfo({
                        paymentAmount: parseFloat(e.target.value) || 0,
                    })
                }
                min="0"
                className="w-full text-sm"
                required
            />

            <Input
                type="number"
                label="Diskon"
                value={
                    typeof transactionInfo.discount !== "undefined" &&
                    transactionInfo.discount !== null
                        ? String(transactionInfo.discount)
                        : ""
                }
                onChange={(e) =>
                    updateTransactionInfo({
                        discount: parseFloat(e.target.value) || 0,
                    })
                }
                min="0"
                className="w-full text-sm"
            />

            <div className="flex justify-between text-lg">
                <span>Kembalian:</span>
                <span className="font-semibold">{transactionInfo.change}</span>
            </div>

            {transactionInfo.change > 0 && (
                <label className="flex items-center">
                    <input
                        type="checkbox"
                        checked={transactionInfo.addChangeToDeposit}
                        onChange={(e) =>
                            updateTransactionInfo({
                                addChangeToDeposit: e.target.checked,
                            })
                        }
                        className="form-checkbox h-4 w-4 text-teal-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Tambahkan kembalian ke deposit
                    </span>
                </label>
            )}

            <Button
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-semibold"
            >
                Bayar
            </Button>
        </form>
    );
}
