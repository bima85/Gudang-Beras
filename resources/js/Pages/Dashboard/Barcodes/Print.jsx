import React from "react";
import { Head } from "@inertiajs/react";

export default function Print({ barcode }) {
    React.useEffect(() => {
        setTimeout(() => window.print(), 500);
    }, []);
    return (
        <>
            <Head title="Cetak Barcode" />
            <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-8">
                <div className="border border-gray-300 dark:border-gray-700 rounded-lg p-8 bg-white dark:bg-gray-800 shadow-lg">
                    <div className="mb-4 text-center">
                        <div className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-2">
                            {barcode.product?.name}
                        </div>
                        <div className="text-base text-gray-600 dark:text-gray-300 mb-4">
                            Barcode:{" "}
                            <span className="font-mono">{barcode.barcode}</span>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <img
                            src={`https://barcode.tec-it.com/barcode.ashx?data=${barcode.barcode}&code=Code128&dpi=96`}
                            alt="barcode"
                            className="h-24"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
