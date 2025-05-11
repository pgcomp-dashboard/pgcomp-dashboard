<?php

namespace App\Console\Commands\Scraping;

use App\Enums\PublisherType;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\StratumQualis;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ProductionScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:production-scraping';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Production scraping command: Extracts data from json and saves them to the database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Production scraping command started.');
        $this->info('Fetching data from json file...');

        $file = Storage::get('Lattes/json/todas_producoes.json');
        if (!$file) {
            $this->error('File not found.');
            return;
        }

        $membersData = json_decode($file, true);
        if (!$membersData) {
            $this->error('Error decoding JSON data.');
            return;
        }
        $this->info('Data fetched successfully.');

        $progessBar = $this->output->createProgressBar(count($membersData));

        $progessBar->start();
        foreach ($membersData as $key => $member) {
            $this->info("Processing member {$key} with " . count($member) . " productions.");
            $this->extractDataFromMember($member);
            $progessBar->advance();
        }
        $progessBar->finish();
        $this->info('Production scraping command finished.');
    }

    /**
     * Extracts data from a member array.
     * The member is an array containing productions.
     * @param array $member Member is an array containing productions
     *
     * @return array A formatted array with the productions data to be saved in the model Production
     */
    private function extractDataFromMember(array $member): void
    {
        $productions = [];
        foreach ($member as $production) {
            if (!$production['ano']) {
                $this->error("Year not found for {$production['titulo']}");
                continue;
            }

            $publisher = Publishers::where('name', 'like', $production['revista'])
                ->orWhereLike('issn', $production['issn'])
                ->first();

            if (!$publisher) {
                // $this->error("Publisher not found for {$production['titulo']}");
                continue;
            }

            Production::updateOrCreate(
                [
                    'doi' => $production['link'],
                ],
                [
                    'title' => $production['titulo'],
                    'year' => $production['ano'],
                    'publisher_id' => $publisher->id ?? null,
                    'publisher_type' => $publisher->publisher_type ?? null,
                    'last_qualis' => $production['qualis'],
                    'stratum_qualis_id' => StratumQualis::where('code', $production['qualis'])->first()->id ?? null,
                ]
            );

        }
    }
}
