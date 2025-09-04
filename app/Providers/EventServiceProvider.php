<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use App\Events\TransactionPaid;
use App\Listeners\CreateSuratForPaidTransaction;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TransactionPaid::class => [
            CreateSuratForPaidTransaction::class,
        ],
    ];

    public function boot()
    {
        parent::boot();
    }
}
