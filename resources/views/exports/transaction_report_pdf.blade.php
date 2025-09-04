<!doctype html>
<html>

<head>
    <meta charset="utf-8">
    <title>Laporan Transaksi</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 6px;
        }

        th {
            background: #f7f7f7;
            font-weight: bold;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .summary {
            background: #e8f4f8;
            padding: 10px;
            margin-bottom: 20px;
        }

        .total-row {
            background: #d4edda;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h2>Laporan Transaksi</h2>
        <p>Periode: {{ request('date_from', 'Semua') }} - {{ request('date_to', 'Semua') }}</p>
        <p>Dicetak pada: {{ date('d/m/Y H:i:s') }}</p>
    </div>

    <div class="summary">
        <strong>Ringkasan:</strong><br>
        Total Transaksi: {{ $transactions->count() }}<br>
        Total Nominal: Rp {{ number_format($transactions->sum('grand_total'), 0, ',', '.') }}
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>No. Transaksi</th>
                <th>Kasir</th>
                <th>Pelanggan</th>
                <th>Metode Pembayaran</th>
                <th>Diskon</th>
                <th>Kembalian</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @php $no = 1; @endphp
            @foreach ($transactions as $transaction)
                <tr>
                    <td>{{ $no++ }}</td>
                    <td>{{ \Carbon\Carbon::parse($transaction->created_at)->format('d/m/Y H:i') }}</td>
                    <td>{{ $transaction->transaction_number }}</td>
                    <td>{{ $transaction->cashier?->name ?? '-' }}</td>
                    <td>{{ $transaction->customer?->name ?? '-' }}</td>
                    <td>{{ $transaction->payment_method === 'cash' ? 'Cash' : ($transaction->payment_method === 'tempo' ? 'Tempo' : ($transaction->payment_method === 'deposit' ? 'Deposit' : '-')) }}
                    </td>
                    <td>Rp {{ number_format($transaction->discount ?? 0, 0, ',', '.') }}</td>
                    <td>Rp {{ number_format($transaction->change ?? 0, 0, ',', '.') }}</td>
                    <td>Rp {{ number_format($transaction->grand_total ?? 0, 0, ',', '.') }}</td>
                </tr>

                @if ($transaction->details && $transaction->details->count() > 0)
                    <tr>
                        <td colspan="9">
                            <strong>Detail Produk:</strong>
                            <table style="width: 100%; margin-top: 5px;">
                                <thead>
                                    <tr style="background: #f9f9f9;">
                                        <th style="font-size: 10px; padding: 3px;">Produk</th>
                                        <th style="font-size: 10px; padding: 3px;">Qty</th>
                                        <th style="font-size: 10px; padding: 3px;">Satuan</th>
                                        <th style="font-size: 10px; padding: 3px;">Harga</th>
                                        <th style="font-size: 10px; padding: 3px;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach ($transaction->details as $detail)
                                        <tr>
                                            <td style="font-size: 10px; padding: 3px;">
                                                {{ $detail->product?->name ?? '-' }}</td>
                                            <td style="font-size: 10px; padding: 3px;">{{ $detail->qty ?? '-' }}</td>
                                            <td style="font-size: 10px; padding: 3px;">
                                                {{ $detail->unit?->name ?? '-' }}</td>
                                            <td style="font-size: 10px; padding: 3px;">Rp
                                                {{ number_format($detail->price ?? 0, 0, ',', '.') }}</td>
                                            <td style="font-size: 10px; padding: 3px;">Rp
                                                {{ number_format($detail->subtotal ?? 0, 0, ',', '.') }}</td>
                                        </tr>
                                    @endforeach
                                </tbody>
                            </table>
                        </td>
                    </tr>
                @endif
            @endforeach

            @if ($transactions->count() > 0)
                <tr class="total-row">
                    <td colspan="8" style="text-align: right;"><strong>TOTAL KESELURUHAN:</strong></td>
                    <td><strong>Rp {{ number_format($transactions->sum('grand_total'), 0, ',', '.') }}</strong></td>
                </tr>
            @endif
        </tbody>
    </table>
</body>

</html>
