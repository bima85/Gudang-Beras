<?php

namespace App\Http\Controllers;

use App\Models\Barcode;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BarcodeController extends Controller
{
    public function index()
    {
        $barcodes = Barcode::with('product')->latest()->paginate(20);
        return Inertia::render('Dashboard/Barcodes/Index', [
            'barcodes' => $barcodes
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'barcode' => 'required|unique:barcodes,barcode',
        ]);
        $barcode = Barcode::create($request->only('product_id', 'barcode'));
        return redirect()->route('barcodes.index')->with('success', 'Barcode berhasil ditambahkan');
    }

    public function print($id)
    {
        $barcode = Barcode::with('product')->findOrFail($id);
        return Inertia::render('Dashboard/Barcodes/Print', [
            'barcode' => $barcode
        ]);
    }
}
