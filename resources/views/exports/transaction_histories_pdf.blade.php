<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>Transaction Histories</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px;
        }

        th {
            background: #f7f7f7;
        }
    </style>
</head>

<body>
    <h3>Transaction Histories</h3>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>No. Transaksi</th>
                <th>Jenis</th>
                <th>Produk</th>
                <th>Qty</th>
                <th>Satuan</th>
                <th>Harga</th>
                <th>Subtotal</th>
                <th>Gudang</th>
                <th>Pihak Terkait</th>
                <th>User</th>
                <th>Catatan</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($transactions as $t)
                <tr>
                    <td>{{ $t->transaction_date }}</td>
                    <td>{{ $t->transaction_number }}</td>
                    <td>{{ $t->transaction_type }}</td>
                    <td>{{ $t->product?->name }}</td>
                    <td>{{ $t->quantity }}</td>
                    <td>{{ $t->unit }}</td>
                    <td>{{ $t->price }}</td>
                    <td>{{ $t->subtotal }}</td>
                    <td>{{ $t->warehouse?->name }}</td>
                    <td>{{ $t->related_party }}</td>
                    <td>{{ $t->creator?->name }}</td>
                    <td>{{ $t->notes }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
