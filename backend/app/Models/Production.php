<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * App\Models\Production
 *
 * @property int $id
 * @property string $title
 * @property int $year
 * @property int|null $journals_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Journal|null $hasQualis
 * @property-read Collection|User[] $isWroteBy
 * @property-read int|null $is_wrote_by_count
 * @method static Builder|Production newModelQuery()
 * @method static Builder|Production newQuery()
 * @method static Builder|Production query()
 * @method static Builder|Production whereCreatedAt($value)
 * @method static Builder|Production whereId($value)
 * @method static Builder|Production whereJournalsId($value)
 * @method static Builder|Production whereTitle($value)
 * @method static Builder|Production whereUpdatedAt($value)
 * @method static Builder|Production whereYear($value)
 * @mixin Eloquent
 */
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

    public static function createOrUpdateProduction(array $data): Production
    {
        return Production::updateOrCreate(
            Arr::only($data, ['title']),
            $data
        );
    }

    public function isWroteBy()
    {
        return $this->belongsToMany(User::class);
    }

    public function hasQualis()
    {
        return $this->hasOne(Journal::class, 'journals_id');
    }

    public function updateRules(): array
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

    public function findAll()
    {
        return Production::all();
    }

    public function deleteProduction($title)
    {
        $production = Production::where('title', $title)->first();
        if (empty($production)) {
            return 'error';
        }
        $production->delete();
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

    public function totalProductionsPerCourse($pattern)
    {
        $totalOfCourses = DB::table('courses')
            ->select(DB::raw('distinct courses.id'))
            ->get();
        $totalOfCourses = count($totalOfCourses);

        $years = DB::table('productions')
            ->select(DB::raw('min(productions.year) as min, max(productions.year) as max'))
            ->get();

        $coursesName = Course::all('name');
        $coursesProductions = array();

        for($nCourse = 1; $nCourse <= $totalOfCourses; $nCourse++) {
            $data = DB::table('productions')
                ->select(DB::raw('productions.year, count(distinct productions.id) as total'))
                ->join('users_productions', 'productions.id',
                    '=', 'users_productions.productions_id')
                ->join('users', 'users.id', '=', 'users_productions.users_id')
                ->join('courses', 'courses.id', '=', 'users.course_id')
                ->where('courses.id', '=', $nCourse)
                ->groupBy('productions.year', 'courses.id')
                ->get();
            $coursesProductions[$nCourse] = $data;
        }

        $data = array();
        $allYears = array();
        for($nCourse = 1; $nCourse <= $totalOfCourses; $nCourse++) {
            $auxData = $coursesProductions[$nCourse];
            $newTempData = array();
            $countIterations = 0;
            $dataSize = count($auxData);

            for($year = $years[0]->min; $year <= $years[0]->max; $year++){
                array_push($allYears, $year);
                if($countIterations < $dataSize &&
                    $auxData[$countIterations]->year == $year)
                {
                    array_push($newTempData, $auxData[$countIterations]->total);
                    $countIterations++;
                }else{
                    array_push($newTempData, 0);
                }
            }
            $data[$nCourse-1] = $newTempData;
        }

        $dataWithLabels = array();
        for($nCourse = 1; $nCourse <= $totalOfCourses; $nCourse++) {
            $dataWithLabels[] = ['label' => $coursesName[$nCourse - 1]->name, 'data' => $data[$nCourse - 1]];
        }
        return [$pattern[0] => $allYears, $pattern[1] => $dataWithLabels];
    }
}
