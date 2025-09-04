<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Laporan Pembelian</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
        }

        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 4px 8px;
        }

        th {
            background: #eee;
        }

        h2 {
            margin-bottom: 10px;
        }
    </style>
</head>

<body>
    <h2>Laporan Pembelian</h2>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Supplier</th>
                <th>Gudang</th>
                <th>Produk</th>
                <th>Subkategori</th>
                <th>Satuan</th>
                <th>Qty</th>
                <th>Harga</th>
                <th>Kuli Fee</th>
                <th>Subtotal</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($purchases as $purchase)
                @foreach ($purchase->items as $item)
                    <tr>
                        <td>{{ \Carbon\Carbon::parse($purchase->created_at)->format('d-m-Y') }}</td>
                        <td>{{ $purchase->supplier->name ?? '-' }}</td>
                        <td>{{ $purchase->warehouse->name ?? '-' }}</td>
                        <td>{{ $item->product->name ?? '-' }}</td>
                        <td>{{ $item->subcategory->name ?? '-' }}</td>
                        <td>{{ $item->unit->name ?? '-' }}</td>
                        <td>{{ $item->qty }}</td>
                        <td>Rp {{ number_format($item->harga_pembelian, 0, ',', '.') }}</td>
                        <td>Rp {{ number_format($item->kuli_fee ?? 0, 0, ',', '.') }}</td>
                        <td>Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            @endforeach
        </tbody>
    </table>
</body>

</html>
