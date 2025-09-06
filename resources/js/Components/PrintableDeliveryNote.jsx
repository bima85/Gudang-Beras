import React from "react";

const PrintableDeliveryNote = ({ deliveryNote, company = null }) => {
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatNumber = (number) => {
        return parseFloat(number).toLocaleString("id-ID", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    };

    // Use warehouse info as company info, fallback to default
    const companyInfo = {
        name: deliveryNote.warehouse?.name || company?.name || "SUKA WARHA",
        address: deliveryNote.warehouse?.address || company?.address || "Jl. Kembar No. 90",
        city: company?.city || "Bogor 16563", // City from config since warehouse might not have it
    };

    return (
        <div
            className="print-container"
            style={{
                width: "210mm",
                minHeight: "297mm",
                margin: "0 auto",
                padding: "20mm",
                backgroundColor: "white",
                fontSize: "12px",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.4",
            }}
        >
            {/* Header */}
            <div style={{ marginBottom: "30px" }}>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "20px",
                    }}
                >
                    {/* Company Info */}
                    <div>
                        <div
                            style={{
                                fontSize: "14px",
                                fontWeight: "bold",
                                marginBottom: "5px",
                            }}
                        >
                            Nama Perusahaan
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "2px" }}>
                            Alamat Perusahaan
                        </div>
                        <div style={{ fontSize: "12px", marginBottom: "10px" }}>
                            Kota
                        </div>

                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>
                            {companyInfo.name}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                            {companyInfo.address}
                        </div>
                        <div style={{ fontSize: "12px" }}>
                            {companyInfo.city}
                        </div>
                        {deliveryNote.warehouse?.phone && (
                            <div style={{ fontSize: "12px" }}>
                                Telp: {deliveryNote.warehouse.phone}
                            </div>
                        )}
                    </div>

                    {/* Document Info */}
                    <div style={{ textAlign: "right", fontSize: "11px" }}>
                        <div style={{ marginBottom: "5px" }}>
                            <span style={{ marginRight: "10px" }}>1/1</span>
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                            <strong>Nomor:</strong>{" "}
                            {deliveryNote.delivery_number}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                            <strong>Tanggal:</strong>{" "}
                            {formatDate(deliveryNote.created_at)}
                        </div>
                        <div style={{ marginBottom: "5px" }}>
                            <strong>No. PO:</strong>{" "}
                            {deliveryNote.transaction?.invoice || "-"}
                        </div>
                        <div>
                            <strong>No. Kend:</strong> B 1111 KHS
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div
                    style={{
                        textAlign: "center",
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "30px",
                        letterSpacing: "2px",
                    }}
                >
                    SURAT JALAN
                </div>

                {/* Recipient Info - Using Toko instead of Customer */}
                <div style={{ marginBottom: "20px" }}>
                    <div
                        style={{
                            fontSize: "12px",
                            fontWeight: "bold",
                            marginBottom: "5px",
                        }}
                    >
                        Nama Toko:{" "}
                        {deliveryNote.toko?.name || "Toko"}
                    </div>
                    <div style={{ fontSize: "12px" }}>
                        Alamat:{" "}
                        {deliveryNote.toko?.address || "Alamat Toko"}
                    </div>
                    {deliveryNote.toko?.phone && (
                        <div style={{ fontSize: "12px" }}>
                            Telepon: {deliveryNote.toko.phone}
                        </div>
                    )}
                </div>

                {/* Transport Info */}
                <div style={{ fontSize: "11px", marginBottom: "20px" }}>
                    Bersama ini kami kirimkan barang-barang sebagai berikut:
                </div>

                {/* Transfer Route Info */}
                <div style={{ 
                    marginBottom: "20px", 
                    padding: "10px", 
                    border: "1px solid #ddd",
                    backgroundColor: "#f9f9f9",
                    fontSize: "11px"
                }}>
                    <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                        Rute Transfer:
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ textAlign: "left" }}>
                            <strong>Dari Gudang:</strong><br />
                            {deliveryNote.warehouse?.name || "Gudang"}<br />
                            <small>{deliveryNote.warehouse?.address || ""}</small>
                        </div>
                        <div style={{ padding: "0 20px", fontSize: "16px" }}>
                            →
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <strong>Ke Toko:</strong><br />
                            {deliveryNote.toko?.name || "Toko"}<br />
                            <small>{deliveryNote.toko?.address || ""}</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    marginBottom: "30px",
                    fontSize: "11px",
                }}
            >
                <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: "5%",
                            }}
                        >
                            No.
                        </th>
                        <th
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: "25%",
                            }}
                        >
                            Kode Barang
                        </th>
                        <th
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: "35%",
                            }}
                        >
                            Nama Barang
                        </th>
                        <th
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: "10%",
                            }}
                        >
                            Satuan
                        </th>
                        <th
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: "15%",
                            }}
                        >
                            Kuantum
                        </th>
                        <th
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                                fontWeight: "bold",
                                width: "10%",
                            }}
                        >
                            Keterangan
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                            }}
                        >
                            1
                        </td>
                        <td
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                            }}
                        >
                            {deliveryNote.product?.barcode || "TK-001"}
                        </td>
                        <td
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                            }}
                        >
                            {deliveryNote.product?.name}
                        </td>
                        <td
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "center",
                            }}
                        >
                            {deliveryNote.unit}
                        </td>
                        <td
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                                textAlign: "right",
                            }}
                        >
                            {formatNumber(deliveryNote.qty_transferred)}
                        </td>
                        <td
                            style={{
                                border: "1px solid #000",
                                padding: "8px",
                            }}
                        >
                            {deliveryNote.notes || ""}
                        </td>
                    </tr>
                    {/* Empty rows for additional space */}
                    {[...Array(4)].map((_, index) => (
                        <tr key={index}>
                            <td
                                style={{
                                    border: "1px solid #000",
                                    padding: "15px",
                                }}
                            >
                                &nbsp;
                            </td>
                            <td
                                style={{
                                    border: "1px solid #000",
                                    padding: "15px",
                                }}
                            >
                                &nbsp;
                            </td>
                            <td
                                style={{
                                    border: "1px solid #000",
                                    padding: "15px",
                                }}
                            >
                                &nbsp;
                            </td>
                            <td
                                style={{
                                    border: "1px solid #000",
                                    padding: "15px",
                                }}
                            >
                                &nbsp;
                            </td>
                            <td
                                style={{
                                    border: "1px solid #000",
                                    padding: "15px",
                                }}
                            >
                                &nbsp;
                            </td>
                            <td
                                style={{
                                    border: "1px solid #000",
                                    padding: "15px",
                                }}
                            >
                                &nbsp;
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Signature Section */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    gap: "20px",
                    marginTop: "40px",
                    fontSize: "11px",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "50px" }}>
                        Dibuat
                    </div>
                    <div
                        style={{
                            borderTop: "1px solid #000",
                            paddingTop: "5px",
                        }}
                    >
                        Nama & Tanda Tangan
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "50px" }}>
                        Mengetahui
                    </div>
                    <div
                        style={{
                            borderTop: "1px solid #000",
                            paddingTop: "5px",
                        }}
                    >
                        Nama & Tanda Tangan
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "50px" }}>
                        Gudang
                    </div>
                    <div
                        style={{
                            borderTop: "1px solid #000",
                            paddingTop: "5px",
                        }}
                    >
                        Nama & Tanda Tangan
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "50px" }}>
                        Pengirim
                    </div>
                    <div
                        style={{
                            borderTop: "1px solid #000",
                            paddingTop: "5px",
                        }}
                    >
                        Nama & Tanda Tangan
                    </div>
                </div>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "50px" }}>
                        Penerima
                    </div>
                    <div
                        style={{
                            borderTop: "1px solid #000",
                            paddingTop: "5px",
                        }}
                    >
                        Nama & Tanda Tangan
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div
                style={{
                    position: "absolute",
                    bottom: "10mm",
                    left: "20mm",
                    right: "20mm",
                    fontSize: "10px",
                    textAlign: "center",
                    color: "#666",
                }}
            >
                Surat jalan ini dibuat secara otomatis oleh sistem pada{" "}
                {formatDate(new Date())}
            </div>
        </div>
    );
};

export default PrintableDeliveryNote;
