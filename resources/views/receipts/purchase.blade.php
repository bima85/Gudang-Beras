<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota #{{ $purchase->id }}</title>
    <style>
        @media print {
            @page {
                size: 58mm auto;
                margin: 0;
            }

            body {
                margin: 0;
                font-size: 12px;
                font-family: Arial, sans-serif;
            }

            .print-btn {
                display: none;
            }
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
        }

        .nota-container {
            width: 58mm;
            margin: auto;
            padding: 8px;
        }

        h2 {
            text-align: center;
            margin: 4px 0;
            font-size: 14px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
        }

        th,
        td {
            padding: 2px;
            text-align: left;
        }

        th {
            border-bottom: 1px dashed #000;
        }

        .text-right {
            text-align: right;
        }

        .mt-2 {
            margin-top: 8px;
        }

        .mb-2 {
            margin-bottom: 8px;
        }

        .print-btn {
            display: inline-block;
            margin-bottom: 8px;
            padding: 4px 12px;
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="nota-container">
        <button class="print-btn" onclick="window.print()">Cetak Nota</button>
        <h2>Nota Pembelian</h2>
        <div class="mb-2">
            <strong>Petugas:</strong> {{ $purchase->user->name ?? '-' }}<br>
            <strong>No:</strong> #{{ $purchase->id }}<br>
            <strong>Tgl:</strong> {{ $purchase->purchase_date }}<br>
            <strong>Supplier:</strong> {{ $purchase->supplier->name ?? '-' }}<br>
            <strong>Gudang:</strong> {{ $purchase->warehouse->name ?? '-' }}<br>
            <strong>Alamat:</strong> {{ $purchase->supplier->address ?? '-' }}<br>
            <strong>Telepon:</strong> {{ $purchase->supplier->phone ?? '-' }}
        </div>

        <table>
            <thead>
                <tr>
                    <th>No</th>
                    <th>Kategori</th>
                    <th class="text-center"></th>
                    <th>Produk</th>
                    <th class="text-left">Qty</th>
                    <th class="text-left">Unit</th>
                    <th class="text-right">Harga</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($purchase->items as $i => $item)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $item->category->name ?? '-' }}</td>
                        <td>{{ $item->subcategory->name ?? '-' }}</td>
                        <td>{{ $item->product->name ?? '-' }}</td>
                        <td class="text-left">{{ $item->qty }}</td>
                        <td class="text-left">{{ $item->unit->name ?? '-' }}</td>
                        <td class="text-center">Rp {{ number_format($item->harga_pembelian, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <div class="mt-2 text-right">
            <strong>Total: Rp {{ number_format($purchase->total, 0, ',', '.') }}</strong>
        </div>

        <div class="mt-2">
            <strong>Catatan:</strong> {{ $purchase->remark ?? '-' }}
        </div>
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>

</html>
