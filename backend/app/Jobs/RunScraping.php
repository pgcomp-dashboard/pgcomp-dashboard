<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Artisan;

class RunScraping implements ShouldQueue
{
    use Queueable;

    protected string $command;

    /**
     * Create a new job instance.
     */
    public function __construct(string $command = 'scraping:run')
    {
        $this->command = $command;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Artisan::call($this->command);
    }
}
