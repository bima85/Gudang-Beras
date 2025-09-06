import { useState } from 'react';

export const usePrint = () => {
    const [isPrinting, setIsPrinting] = useState(false);

    const printDocument = (printableComponent, title = 'Surat Jalan') => {
        setIsPrinting(true);

        // Create a new window for printing
        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Popup diblokir! Mohon izinkan popup untuk mencetak.');
            setIsPrinting(false);
            return;
        }

        // Basic HTML structure for print
        const printHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @media print {
                            @page {
                                size: A4;
                                margin: 0;
                            }

                            body {
                                margin: 0;
                                padding: 0;
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                            }

                            .print-container {
                                page-break-inside: avoid;
                            }

                            table {
                                page-break-inside: avoid;
                            }
                        }

                        @media screen {
                            body {
                                background: #f5f5f5;
                                padding: 20px;
                            }

                            .print-container {
                                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                            }
                        }

                        * {
                            box-sizing: border-box;
                        }
                    </style>
                </head>
                <body>
                    <div id="print-content"></div>
                    <script>
                        // Auto print when ready
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(printHTML);
        printWindow.document.close();

        // Create a temporary container and render the component
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = printableComponent;

        // Insert the content into the print window
        printWindow.document.getElementById('print-content').appendChild(tempContainer);

        // Handle print completion
        printWindow.onbeforeunload = () => {
            setIsPrinting(false);
        };

        printWindow.onafterprint = () => {
            printWindow.close();
            setIsPrinting(false);
        };
    };

    const printElement = (elementId, title = 'Print Document') => {
        setIsPrinting(true);

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`Element with ID '${elementId}' not found`);
            setIsPrinting(false);
            return;
        }

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            alert('Popup diblokir! Mohon izinkan popup untuk mencetak.');
            setIsPrinting(false);
            return;
        }

        const printHTML = `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>${title}</title>
                    <style>
                        @media print {
                            @page {
                                size: A4;
                                margin: 0;
                            }

                            body {
                                margin: 0;
                                padding: 0;
                                -webkit-print-color-adjust: exact;
                                color-adjust: exact;
                            }
                        }

                        @media screen {
                            body {
                                background: #f5f5f5;
                                padding: 20px;
                            }
                        }

                        * {
                            box-sizing: border-box;
                        }
                    </style>
                </head>
                <body>
                    ${element.outerHTML}
                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                window.close();
                            }, 500);
                        };
                    </script>
                </body>
            </html>
        `;

        printWindow.document.write(printHTML);
        printWindow.document.close();

        printWindow.onbeforeunload = () => {
            setIsPrinting(false);
        };
    };

    return {
        isPrinting,
        printDocument,
        printElement,
        setIsPrinting
    };
};

export default usePrint;
