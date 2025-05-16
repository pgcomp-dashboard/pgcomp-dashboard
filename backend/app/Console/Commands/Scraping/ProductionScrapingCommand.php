<?php

namespace App\Console\Commands\Scraping;

use App\Models\User;
use App\Models\Production;
use App\Models\Publishers;
use Illuminate\Support\Str;
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
            $productions = $this->saveProductionsOfMember($member);
            $this->addRelationUserProduction($key, $productions);
            $progessBar->advance();
        }
        $progessBar->finish();
        $this->info('Production scraping command finished.');
    }

    /**
     * Extracts data from a member array and saves it to the database.
     * The member is an array containing productions.
     * @param array $member Member is an array containing productions
     * @return array Returns an array of saved productions
     */
    private function saveProductionsOfMember(array $member): array
    {
        $publishersNotFound = [];
        $productions = [];
        foreach ($member as $production) {
            if (!$production['ano']) {
                $this->error("Year not found for {$production['titulo']}");
                continue;
            }

            $publisher = Publishers::whereLike('name', $production['revista'])
                ->orWhereLike('issn', Str::numbers($production['issn']))
                ->first();

            if (!$publisher) {
                $publishersNotFound[] = $production['revista'];
            }

            $productions[] = Production::updateOrCreate(
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
        $this->warn('Publishers not found: ' . count($publishersNotFound));
        return $productions;
    }

    /**
     * Saves the production to the user.
     * @param array $lattesId Lattes ID of the user
     * @param Production[] $production Production to be saved
     *
     * @return void
     */
    private function addRelationUserProduction(string $lattesId, array $production): void
    {
        $user = User::whereLike('lattes_url', "%{$lattesId}%")
            ->first();
        if (!$user) {
            $this->error("User not found for {$lattesId}");
            return;
        }
        $user->writerOf()->sync($production);

    }
}
