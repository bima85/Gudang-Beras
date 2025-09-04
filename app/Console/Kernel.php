<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        \App\Console\Commands\CreateMissingSurat::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule)
    {
        // Run the missing-surat command daily at 01:00 server time. Adjust or disable in production as needed.
        $schedule->command('surat:create-missing')->dailyAt('01:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands()
    {
        // load routes/console.php if present
        if (file_exists(app_path('Console/Commands'))) {
            $this->load(app_path('Console/Commands'));
        }
    }
}
