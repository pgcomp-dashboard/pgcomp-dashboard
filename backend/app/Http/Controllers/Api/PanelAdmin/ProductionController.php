<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Enums\UserType;
use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Production;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

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
}
