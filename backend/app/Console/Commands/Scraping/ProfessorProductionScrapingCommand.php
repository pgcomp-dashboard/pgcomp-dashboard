<?php

namespace App\Console\Commands\Scraping;

use App\Enums\UserType;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\StratumQualis;
use App\Models\User;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Str;
use App\Services\ScrapingExecutionService;

class ProfessorProductionScrapingCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'scraping:professor-production-scraping
                            {--lattes-id= : (optional) The lattes id of the already registered professor you want to update}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Professor production scraping command: Extracts data from a single professor json and saves them to the database.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $lattes_id = $this->option("lattes-id") ?? $this->ask('Lattes id of the professor');

        if (User::whereLattesId($lattes_id)->doesntExist()) {
            $this->error("A user with lattes id [{$lattes_id}] doesn't exists.");

            return 1;
        }

        $professor = User::whereLattesId($lattes_id)->get();

        new ScrapingExecutionService()->register('scraping:professor-production-scraping');

        $this->info('Professor production scraping command started.');
        $this->info('Fetching data from professor json file...');

        $clientHttp = new Client([
            'base_uri' => config('services.mini_extrator.url'),
            'timeout' => 300,
            'connect_timeout' => 300,
        ]);
        /**
         * @var User $professor
         */
        $professor = User::whereLattesId($lattes_id)->first();

        if (!$professor->lattes_url) {
            $this->error("Lattes URL not found for {$professor->name}");

            return 1;
        }
        try {
            $this->info("Fetching data for {$professor->name}...");
            $response = $clientHttp->get('/', ['query' => ['lattes_id' => Str::numbers($professor->lattes_url)]]);
            if ($response->getStatusCode() !== 200) {
                $this->error("Error fetching data for {$professor->name}");

                return 3;
            }
            $productions = json_decode($response->getBody(), true);

            $this->info("Processing {$professor->name} with ".count($productions).' productions.');
            $productions = $this->saveProductionsOfMember($productions);
            $professor->writerOf()->sync($productions);
        } catch (Exception $e) {
            $this->error("Error processing {$professor->name}: {$e->getMessage()}");

            return 4;
        }
        $this->info('Professor production scraping command finished.');
    }

    /**
     * Extracts data from a member array and saves it to the database.
     * The member is an array containing productions.
     *
     * @param  array  $member  Member is an array containing productions
     * @return array Returns an array of saved productions
     */
    private function saveProductionsOfMember(array $member): array
    {
        $publishersNotFound = [];
        $productions = [];
        foreach ($member as $production) {
            if (! $production['ano']) {
                $this->error("Year not found for {$production['titulo']}");

                continue;
            }

            $publisher = Publishers::whereLike('name', $production['revista'])
                ->orWhereLike('issn', Str::numbers($production['issn']))
                ->first();

            if (! $publisher) {
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
        $this->warn('Publishers not found: '.count($publishersNotFound));

        return $productions;
    }
}
