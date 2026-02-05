<?php

namespace App\Http\Controllers\User;

use App\Domain\Lattes\LattesZipXml;
use App\Enums\ProductionSource;
use App\Enums\UserType;
use App\Http\Controllers\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\User;
use Auth;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use function PHPUnit\Framework\isArray;

class ProductionController extends BaseApiResourceController
{
    protected $selectColumns = ['users.name', 'productions.id', 'productions.title', 'productions.year',
        'productions.publisher_type', 'productions.publisher_id', 'productions.last_qualis',
        'productions.doi'];

    protected function modelClass(): string|BaseModel
    {
        return Production::class;
    }

    protected function newBaseQuery(): Builder
    {
        return $this->modelClass()::query()
            ->with(['publisher', 'publisher.stratumQualis']);
    }

    public function store(Request $request)
    {
        $saveProduction = parent::store($request);
        $saveProduction->saveInterTable($request->input('users_id'));

        return $saveProduction;
    }

    public function destroy(int $id)
    {
        $userId = auth()->user()->id;

        $production = Production::findOrFail($id);

        if ($production->delete()) {
            return response()->json(['message' => 'Produção deletada com sucesso'], 200);
        }
        return response()->json(['message' => 'Erro ao excluir'], 500);
    }

    public function studentQuery($students)
    {
        $this->query = $this->newBaseQuery()
            ->with('publisher')
            ->select($this->selectColumns)
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::STUDENT)
            ->where('users.id', '=', $students);
    }

    public function professorQuery($professors)
    {
        $this->query = $this->newBaseQuery()
            ->with('publisher')
            ->select($this->selectColumns)
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::PROFESSOR)
            ->where('users.id', '=', $professors);
    }
    public function getTypeCounts($professors)
    {
        return $this->newBaseQuery()
            ->select([
                DB::raw("SUM(CASE WHEN publisher_type = 'journal' THEN 1 ELSE 0 END) as journal_count"),
                DB::raw("SUM(CASE WHEN publisher_type = 'conference' THEN 1 ELSE 0 END) as conference_count"),
                DB::raw("COUNT(*) as total_count")
            ])
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::PROFESSOR)
            ->where('users.id', '=', $professors)
            ->first();
    }

    public function userProductions()
    {
        $user = auth()->user();

        $productions = $user->writerOf()->with('publisher')->get();

        foreach ($productions as $production) {
            unset($production['pivot']);
        }

        return response()->json(["data" => $productions], 200);
    }

    public function userCreateProduction(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $request['users_id'] = $userId;
        $request['source'] = ProductionSource::MANUAL->value;
        $data = $this->store($request);
        return response()->json([
            'data'=> $data
        ]);
    }

    public function productionFromDoi(Request $request)
    {
        $user = auth()->user();
        $userId = $user->id;

        $doi = $request['doi'];
        $type = $request['type'];

        $clientHttp = new Client;

        $url = "https://api.crossref.org/works/doi/{$doi}";

        //error_log("fetching data");

        try {
            $response = $clientHttp->get($url, ['query' => []]);

            if ($response->getStatusCode() !== 200) {
                error_log("Error fetching data for {$doi}");
                return 3;
            }

        } catch (Exception $e) {
            return $data = [
                'status' => 404,
                'message' => $e->getMessage()
            ];
        }

        $data = json_decode($response->getBody(), true);
        $message = $data['message'];
        $productionDoi = 'http://dx.doi.org/'.$message['DOI'];
        $title = $message['title'][0];

        if(Production::where('doi', '=',$productionDoi)->count() > 0){
            return response()->json([
                'message' => "Produção já cadastrada",
            ], 400);
        }
        if (!empty($message['subtitle'])) {
            $title = $title . ' ' . $message['subtitle'][0];
        }
        error_log("Title: $title");
        $year = $message['published']['date-parts'][0][0];
        $productionDoi = $message['DOI'];

        $publisherIssn = 0;
        if ($type == 'journal') {
            $publisherIssn = $message['ISSN'];
            $publisherName = $message['container-title'];
            foreach ($message['ISSN'] as $issn) {
                $publisher = Publishers::whereLike('name', $publisherName)
                    ->orWhereLike('issn', Str::of($issn)->trim()->remove('-')->value())
                    ->first();
                if ($publisher) {
                    break;
                }
            }
        } else {
            $publisherName = $message['event']['name'];
            $publisher = Publishers::whereLike('name', $publisherName)
                        ->orWhereLike('issn', Str::numbers($publisherIssn))
                        ->first();
        }

        $production = [
            'users_id' => $userId,
            'source' => ProductionSource::DOI->value,
            'title' => $title,
            'year' => $year,
            'publisher_type' => $publisher->publisher_type ?? $type,
            'publisher_id' => $publisher->id ?? null,
            'doi' => "http://dx.doi.org/" . $productionDoi
        ];

        if (!$publisher) {
            $production['publisher-not-found'] = $publisherName;
        }

        $saveProduction = Production::createOrFirst($production);
        $saveProduction->saveInterTable($production['users_id']);

        return response()->json([
            'status'=> 201,
            'message'=>"Criado com sucesso",
            'data'=>$production
        ]);
    }

    public function update(Request $request, int $id){


        $production = Production::findOrFail($id);

        error_log($request);

        $production->update($request->all());
        $production->source = ProductionSource::MANUAL->value;
        $production->save();

        return response()->json(['status' => 200, 'data' => $production]);
    }

    public function deleteAll()
    {
        if (Auth::check()) {
            $user = auth()->user();
        }

        $userProductions = $user->writerOf;

        $count = 0;
        foreach ($userProductions as $production) {
            $success = $production->delete();
            if ($success) {
                $count++;
            }
        }

        if ($user->id) {
            return response()->json([
                "status" => 200,
                "data" => "Deleted $count productions"
            ]);
        }
    }

    public function importLattesFile(Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed,application/xml,text/xml', 'max:5120'],
        ]);

        $file = $request->file('file');

        $path = $file->store('lattes-files');

        $data = LattesZipXml::extractProductions($path);

        $user->updateLattes($data);

        return response()->json(['data' => $data], 201);
    }
}
