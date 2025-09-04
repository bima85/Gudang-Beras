// Fungsi untuk format harga jadi Rupiah
export function formatPrice(value) {
    if (value == null) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0
    }).format(value);
}
