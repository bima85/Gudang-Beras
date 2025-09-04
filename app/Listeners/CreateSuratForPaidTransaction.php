<?php

namespace App\Listeners;

use App\Events\TransactionPaid;
use App\Services\SuratJalanService;
use Psr\Log\LoggerInterface as Logger;

class CreateSuratForPaidTransaction
{
    protected $service;
    protected $logger;

    public function __construct(SuratJalanService $service, Logger $logger)
    {
        $this->service = $service;
        $this->logger = $logger;
    }

    public function handle(TransactionPaid $event)
    {
        try {
            $res = $this->service->createForTransactionIfMissing($event->transaction);
            if ($res) {
                $this->logger->info('Auto-created SuratJalan via event listener', ['transaction_id' => $event->transaction->id, 'surat_id' => $res->id]);
            }
        } catch (\Exception $e) {
            $this->logger->error('Listener CreateSuratForPaidTransaction failed: ' . $e->getMessage(), ['transaction_id' => $event->transaction->id]);
        }
    }
}
