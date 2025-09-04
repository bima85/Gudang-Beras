<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SuratJalanService;

class CreateMissingSurat extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'surat:create-missing {--limit=20 : number of recent transactions to scan}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create missing Surat Jalan for transactions that are considered paid.';

    protected $service;

    public function __construct(SuratJalanService $service)
    {
        parent::__construct();
        $this->service = $service;
    }

    public function handle()
    {
        $limit = (int) $this->option('limit');
        $limit = $limit > 0 ? $limit : null;
        $this->info('Scanning recent transactions for missing Surat Jalan...');
        $created = $this->service->createMissingForRecentTransactions($limit);
        if ($created > 0) {
            $this->info("Created {$created} missing Surat Jalan(s).");
        } else {
            $this->info('No missing Surat Jalan found.');
        }
        return 0;
    }
}
