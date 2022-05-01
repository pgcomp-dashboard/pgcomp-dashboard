<?php

namespace App\Console\Commands;

use App\Models\Area;
use App\Models\Program;
use App\Models\Subarea;
use App\Models\User;
use Google\Client;
use Google\Service\Sheets;
use Illuminate\Console\Command;

class AreaSubareaCommand extends Command
{
    protected $signature = 'area-subarea';

    protected $description = 'Área Sub-area';

    public function handle()
    {
        //https://docs.google.com/spreadsheets/d/1IxNKhESNGSNqsOnz3f6cWB5njxDQaxB80EtPTtCRT0A/edit#gid=0
        $sheet = $this->getSheet();

        $this->getOutput()->info('Buscando dados...');
        $values = $sheet->spreadsheets_values
            ->get('1IxNKhESNGSNqsOnz3f6cWB5njxDQaxB80EtPTtCRT0A', 'A:D')
            ->values;

        $this->getOutput()->info('Ajustando dados...');
        $header = collect(array_shift($values));
        $data = collect($values)->transform(fn($item) => $header->combine($item)->all());

        $programId = Program::where('sigaa_id', 1820)->firstOrFail()->id;
        foreach ($data as $item) {
            $area = Area::updateOrCreate(['area_name' => $item['area'], 'program_id' => $programId]);
            $subArea = null;
            if ($item['subarea']) {
                $subArea = Subarea::updateOrCreate(['subarea_name' => $item['subarea'], 'area_id' => $area->id]);
            }
            $user = User::where('siape', $item['siape'])->first();
            if (empty($user)) {
                $this->error("User siape {$item['siape']} not found.");
                continue;
            }
            $user->subarea_id = $subArea?->id;
            $user->save();

            $user->advisedes()->update(['subarea_id' => $subArea?->id]);
        }
    }

    protected function getSheet(): Sheets
    {
        $cliente = new Client();
        $cliente->setAuthConfig('/var/www/html/google-ufba.json');

        $cliente->setApplicationName('mate85-sheets');
        $cliente->addScope(Sheets::SPREADSHEETS_READONLY);

        return new Sheets($cliente);
    }
}
