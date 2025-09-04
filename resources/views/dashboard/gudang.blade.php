<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Gudang</title>
</head>

<body>
    <h1>Dashboard Gudang</h1>

    <h2>Barang Masuk Hari Ini</h2>
    <ul>
        @foreach ($barangMasukHariIni as $barang)
            <li>{{ $barang->product->name }} - {{ $barang->quantity }}</li>
        @endforeach
    </ul>

    <h2>Stok Beras</h2>
    <p>Gudang: {{ $stokBerasGudang }}</p>
    <p>Toko: {{ $stokBerasToko }}</p>
</body>

</html>
