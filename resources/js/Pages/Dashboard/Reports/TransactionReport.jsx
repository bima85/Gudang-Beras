import React, { useEffect, useState } from "react";
import axios from "axios";

const TransactionReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [grouped, setGrouped] = useState({});
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch transactions and categories from backend
        const fetchData = async () => {
            setLoading(true);
            try {
                const trxRes = await axios.get("/api/transactions");
                const catRes = await axios.get("/api/categories");
                setTransactions(trxRes.data);
                setCategories(catRes.data);
                // Group transactions by category
                const groupedData = {};
                trxRes.data.forEach((trx) => {
                    const cat = trx.category?.name || "Tanpa Kategori";
                    if (!groupedData[cat]) groupedData[cat] = [];
                    groupedData[cat].push(trx);
                });
                setGrouped(groupedData);
            } catch (err) {
                // Handle error
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Laporan Transaksi</h2>
            <div className="mb-4 flex flex-wrap gap-2">
                <select
                    className="border rounded px-2 py-1"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">Semua Kategori</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div>Loading...</div>
            ) : (
                Object.entries(grouped)
                    .filter(
                        ([cat]) => !selectedCategory || cat === selectedCategory
                    )
                    .map(([cat, trxs]) => (
                        <div key={cat} className="mb-8">
                            <h3 className="text-lg font-semibold mb-2">
                                {cat}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border rounded-lg text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-2 border">
                                                Tanggal
                                            </th>
                                            <th className="p-2 border">
                                                No Transaksi
                                            </th>
                                            <th className="p-2 border">
                                                Produk
                                            </th>
                                            <th className="p-2 border">Qty</th>
                                            <th className="p-2 border">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {trxs.map((trx) => (
                                            <tr
                                                key={trx.id}
                                                className="hover:bg-gray-50"
                                            >
                                                <td className="p-2 border">
                                                    {trx.date}
                                                </td>
                                                <td className="p-2 border">
                                                    {trx.code}
                                                </td>
                                                <td className="p-2 border">
                                                    {trx.product?.name}
                                                </td>
                                                <td className="p-2 border">
                                                    {trx.qty}
                                                </td>
                                                <td className="p-2 border">
                                                    {trx.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))
            )}
        </div>
    );
};

export default TransactionReport;
