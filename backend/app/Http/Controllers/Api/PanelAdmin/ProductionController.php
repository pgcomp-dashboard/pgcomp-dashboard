<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\ProductionSource;
use App\Enums\UserType;
use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Production;
use App\Models\Publishers;
use Auth;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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
        $model = $this->modelClass()::findOrFail($id);

        return $model;
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
        $user = Auth::user();
        $userId = $user->id;

        error_log($user);
        error_log($userId);

        $publications = $this->newBaseQuery()
            ->with('publisher')
            ->select('*')
            ->join('users_productions', 'id', '=', 'users_productions.productions_id')
            ->join('users', 'users_productions.users_id', '=', 'users.id')
            ->where('users.type', '=', UserType::PROFESSOR)
            ->where('users.id', '=', $userId)
            ->get();

        error_log($publications);

        return response()->json([
            'data' => $publications,
        ]);
    }

    public function userCreateProduction(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $request['users_id'] = $userId;
        $request['source'] = ProductionSource::MANUAL->value;
        return $this->store($request);
    }

    public function productionFromDoi(Request $request)
    {
        $user = Auth::user();
        $userId = $user->id;

        $doi = $request['doi'];

        $clientHttp = new Client;

        $url = "https://api.crossref.org/works/doi/{$doi}";

        error_log("fetching data");

        try {
            //$response = $clientHttp->get("/{$doi}");
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
        $title = $message['title'][0];
        $year = $message['published']['date-parts'][0][0];
        $publisherName = $message['container-title'];
        $publisherIssn = $message['ISSN'][0];
        $publisher = Publishers::whereLike('name', $publisherName)
            ->orWhereLike('issn', Str::numbers($publisherIssn))
            ->first();

        $production = [
            'users_id' => $userId,
            'source' => ProductionSource::MANUAL->value,
            'title' => $title,
            'year' => $year,
            'publisher_type' => $publisher->publisher_type ?? null,
            'publisher_id' => $publisher->id ?? null
        ];

        if (!$publisher) {
            $production['publisher-not-found'] = $publisherName;
        }

        $saveProduction = Production::createOrFirst($production);
        $saveProduction->saveInterTable($production['users_id']);

        return $saveProduction;
    }
}
