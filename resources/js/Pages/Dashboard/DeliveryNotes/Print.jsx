import { Head } from "@inertiajs/react";
import PrintableDeliveryNote from "@/Components/PrintableDeliveryNote";
import { useEffect } from "react";

export default function Print({ deliveryNote, company = null }) {
    useEffect(() => {
        // Auto print when page loads
        setTimeout(() => {
            window.print();
        }, 500);
    }, []);

    return (
        <>
            <Head
                title={`Print Surat Jalan - ${deliveryNote.delivery_number}`}
            />
            <div
                style={{
                    background: "#f5f5f5",
                    minHeight: "100vh",
                    padding: "20px",
                }}
            >
                <PrintableDeliveryNote
                    deliveryNote={deliveryNote}
                    company={company}
                />
            </div>

            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                        padding: 0 !important;
                    }

                    .print-container {
                        box-shadow: none !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                    }
                }

                @media screen {
                    .no-print {
                        display: block;
                    }
                }

                @media print {
                    .no-print {
                        display: none;
                    }
                }
            `}</style>
        </>
    );
}
