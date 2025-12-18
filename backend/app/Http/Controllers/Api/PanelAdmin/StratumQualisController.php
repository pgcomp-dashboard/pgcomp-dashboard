<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Domain\Qualis\ConferenceQualisXLSX;
use App\Domain\Qualis\JournalQualisXLSX;
use App\Enums\PublisherType;
use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Publishers;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use App\Models\BaseModel;
use App\Models\StratumQualis;
use Illuminate\Support\Facades\DB;

class StratumQualisController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return StratumQualis::class;
    }

    public function destroy(int $id)
    {
        $stratumQualis = $this->findOrFail($id);
        DB::beginTransaction();

        try {

            if ($stratumQualis->productions()->exists()) {
                DB::rollBack();

                return response()->json([
                    'message' => 'Não é possível deletar este Qualis pois existem produções vinculadas a ele.',
                    'suggestion' => 'Primeiramente atualize ou remova as produções associadas.',
                ], 422);
            }

            $stratumQualis->delete();
            DB::commit();

            return response()->json(['message' => 'Qualis deletado com sucesso']);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Erro ao deletar Qualis',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function importConferenceFile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store('conference-qualis-files');

        $data = ConferenceQualisXLSX::extractConferenceQualis($path);
        foreach($data as $publisher){
            Publishers::create([
                'initials'=>$publisher[0],
                'name'=>$publisher[1],
                'stratum_qualis_id'=>StratumQualis::where('code', $publisher[2])->first()->id ?? null,
                'publisher_type'=>PublisherType::CONFERENCE->value
            ]);
        }
        //$user->updateLattes($data);
        //error_log($data);
        return $data;
    }

    public function importJournalFile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store('lattes-files');

        $data = JournalQualisXLSX::extractProductions($path);
        //$user->updateLattes($data);
        //error_log($data);
        return $data;
    }
}
