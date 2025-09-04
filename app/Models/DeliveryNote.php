<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Model untuk surat jalan otomatis dari penjualan
 * Tercatat ketika stok toko tidak cukup dan mengambil dari gudang
 */
class DeliveryNote extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'delivery_number',       // Nomor surat jalan
        'transaction_id',        // ID transaksi penjualan
        'product_id',           // ID produk yang dipindahkan
        'warehouse_id',         // ID gudang asal
        'toko_id',             // ID toko tujuan
        'qty_transferred',      // Jumlah yang ditransfer (dalam unit asli)
        'unit',                // Unit satuan (kg, sak, ton)
        'qty_kg',              // Jumlah dalam kg untuk konsistensi
        'status',              // pending, in_transit, delivered, cancelled
        'notes',               // Catatan tambahan
        'delivered_at',        // Tanggal pengiriman
        'created_by',          // User yang membuat
    ];

    protected $casts = [
        'delivered_at' => 'datetime',
        'qty_transferred' => 'decimal:2',
        'qty_kg' => 'decimal:2',
    ];

    protected $dates = ['deleted_at'];

    /**
     * Relasi ke transaksi penjualan
     */
    public function transaction()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    /**
     * Alias untuk transaction (untuk konsistensi dengan controller)
     */
    public function sale()
    {
        return $this->belongsTo(Transaction::class, 'transaction_id');
    }

    /**
     * Relasi ke produk
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Relasi ke gudang asal
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * Relasi ke toko tujuan
     */
    public function toko()
    {
        return $this->belongsTo(Toko::class);
    }

    /**
     * Relasi ke user yang membuat
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Alias untuk createdBy (untuk konsistensi dengan controller)
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Scope untuk filter berdasarkan status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope untuk delivery notes hari ini
     */
    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    /**
     * Generate nomor surat jalan otomatis
     */
    public static function generateDeliveryNumber()
    {
        $date = now()->format('Ymd');
        $count = static::whereDate('created_at', today())->count() + 1;
        return "DN-{$date}-" . str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Tandai sebagai sudah dikirim
     */
    public function markAsDelivered($notes = null)
    {
        $this->update([
            'status' => 'delivered',
            'delivered_at' => now(),
            'notes' => $notes ?: $this->notes,
        ]);
    }

    /**
     * Accessor untuk format qty dengan unit
     */
    public function getFormattedQtyAttribute()
    {
        return number_format($this->qty_transferred, 2, ',', '.') . ' ' . $this->unit;
    }

    /**
     * Accessor untuk status badge class
     */
    public function getStatusBadgeClassAttribute()
    {
        return match ($this->status) {
            'pending' => 'bg-yellow-100 text-yellow-800',
            'in_transit' => 'bg-blue-100 text-blue-800',
            'delivered' => 'bg-green-100 text-green-800',
            'cancelled' => 'bg-red-100 text-red-800',
            default => 'bg-gray-100 text-gray-800',
        };
    }

    /**
     * Accessor untuk status label dalam bahasa Indonesia
     */
    public function getStatusLabelAttribute()
    {
        return match ($this->status) {
            'pending' => 'Menunggu',
            'in_transit' => 'Dalam Perjalanan',
            'delivered' => 'Sudah Dikirim',
            'cancelled' => 'Dibatalkan',
            default => 'Tidak Diketahui',
        };
    }
}
