<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Transaction extends Model
{
    use HasFactory;

    /**
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'cashier_id',
        'customer_id',
        'warehouse_id',
        'invoice',
        'no_urut',
        'transaction_number',
        'cash',
        'change',
        'discount',
        'grand_total',
        'payment_method',
        'is_tempo',
        'tempo_due_date',
        'is_deposit',
        'deposit_amount',
        'unit_id'
    ];

    /**
     * details
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function details()
    {
        return $this->hasMany(related: TransactionDetail::class);
    }

    /**
     * customer
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * cashier
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function cashier()
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    /**
     * profits
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function profits()
    {
        return $this->hasMany(Profit::class);
    }

    /**
     * warehouse
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function warehouse()
    {
        return $this->belongsTo(Warehouse::class);
    }

    /**
     * transactionNumber
     *
     * @return Attribute
     */
    protected function transactionNumber(): Attribute
    {
        return Attribute::make(
            get: fn($value) => $value ?? $this->invoice ?? $this->no_urut ?? '-',
        );
    }
}
