<?php

namespace App\Models;

use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;
use Laravel\Fortify\Rules\Password;
use Laravel\Sanctum\HasApiTokens;

class Production extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'title',
        'year',
        'journals_id',
//       'user_id', TODO: Adicionar o campo de user id
    //  'doi', TODO: Adicionar o campo doi também.
    ];

    public function isWroteBy()
    {
        return $this->belongsToMany(User::class);
    }

    public function hasQualis(){
        return $this->hasOne(Journal::class, 'journals_id');
    }

    public static function creationRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'year' => 'required|int',
            'journals_id' => [
                'nullable',
                'int',
                Rule::exists(Journal::class, 'id'),
                'required',
            ]
        ];
    }

    public static function updateRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'year' => 'required|int',
            'journals_id' => [
                'nullable',
                'int',
                Rule::exists(Journal::class, 'id'),
                'required',
            ]
        ];
    }

    public function findAll() {
        return Production::all();
    }

    public function deleteProduction($title)
    {
        $production = new Production();
        $production = Production::where('title', $title)->firstOrFail();
        if(empty($production)){
            return 'error';
        }
        $production->delete();
    }

    public static function createOrUpdateProduction(array $data): Production
    {
        return Production::updateOrCreateModel(
            Arr::only($data, ['title']),
            $data
        );
    }

    public function totalProductionsPerYear()
    {
        $data = DB::table('productions')
            ->select(DB::raw('distinct productions.id, productions.year'))
            ->select(DB::raw('productions.year, count(productions.id) as production_count'))
            ->groupBy('productions.year')
            ->get();

        $dataYear = [];
        $dataCount = [];
        for($counter = 0; $counter < count($data); $counter++){
            $dataYear[$counter] = $data[$counter]->year;
            $dataCount[$counter] = $data[$counter]->production_count;
        }

        return [$dataYear, $dataCount];
    }

    public function totalProductionsPerCourse()
    {
        $data = DB::table('productions')
            ->join('users_productions', 'productions.id',
                '=', 'users_productions.productions_id')
            ->join('users', 'users.id', '=', 'users_productions.users_id')
            ->join('courses', 'courses.id', '=', 'users.course_id')
            ->select(DB::raw('productions.id, courses.name, courses.id'))
            //->select(DB::raw('productions.year, count(courses.id) as courses_count'))
            //->where('users.type', '=', UserType::STUDENT)
            //->where('courses.id', '=', 1)
            //->groupBy('productions.year')
            ->get();

        /*
        $dataYear = [];
        $dataCount = [];
        for($counter = 0; $counter < count($data); $counter++){
            $dataYear[$counter] = $data[$counter]->year;
            $dataCount[$counter] = $data[$counter]->courses_count;
        }
        */
        return $data; //[$dataYear, $dataCount];
    }
}
