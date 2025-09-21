<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>Rekap Transaksi</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 6px; }
        th { background: #f5f5f5; }
        .right { text-align: right; }
    </style>
</head>
<body>
    <h3>Rekap Transaksi</h3>
    <p>Periode: {{ $start ?? '-' }} — {{ $end ?? '-' }}</p>
    <table>
        <thead>
            <tr>
                <th>Tanggal</th>
                <th>Invoice</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th class="right">Total</th>
                <th class="right">HPP</th>
                <th class="right">Profit</th>
                <th>Metode</th>
            </tr>
        </thead>
        <tbody>
        @foreach($rows as $row)
            <tr>
                <td>{{ $row['tanggal'] }}</td>
                <td>{{ $row['invoice'] }}</td>
                <td>{{ $row['kasir'] }}</td>
                <td>{{ $row['pelanggan'] }}</td>
                <td class="right">Rp {{ number_format($row['total'], 0, ',', '.') }}</td>
                <td class="right">Rp {{ number_format($row['hpp'], 0, ',', '.') }}</td>
                <td class="right">Rp {{ number_format($row['profit'], 0, ',', '.') }}</td>
                <td>{{ $row['metode'] }}</td>
            </tr>
        @endforeach
        </tbody>
    </table>
</body>
</html>
