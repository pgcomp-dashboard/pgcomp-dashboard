<?php

namespace App\Models;

use App\Enums\UserType;
use App\Rules\ClassExists;
use App\Rules\MorphExists;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
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
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property string|null $publisher_type
 * @property int|null $publisher_id
 * @property string|null $last_qualis
 * @property int|null $stratum_qualis_id
 * @property-read Collection|User[] $isWroteBy
 * @property-read int|null $is_wrote_by_count
 * @property-read Model|Eloquent $publisher
 * @method static Builder|Production newModelQuery()
 * @method static Builder|Production newQuery()
 * @method static Builder|Production query()
 * @method static Builder|Production whereCreatedAt($value)
 * @method static Builder|Production whereId($value)
 * @method static Builder|Production whereLastQualis($value)
 * @method static Builder|Production wherePublisherId($value)
 * @method static Builder|Production wherePublisherType($value)
 * @method static Builder|Production whereStratumQualisId($value)
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
        'publisher_type',
        'publisher_id',
        'doi',
    ];

    public static function creationRules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'year' => 'required|int|date_format:Y',
            'publisher_type' => ['nullable', 'required_with:publisher_id', 'string', 'max:255', new ClassExists()],
            'publisher_id' => ['nullable', 'required_with:publisher_type', 'int', new MorphExists()],
            'doi' => ['nullable', 'string', 'max:255', Rule::unique(Production::class, 'doi')],
            'sequence_number' => 'nullable|int',
        ];
    }

    public static function createOrUpdateProduction(array $data): Production
    {
        return Production::updateOrCreate(
            Arr::only($data, ['title']),
            $data
        );
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function (self $production) {
            $production->setQualis();
        });
    }

    public function isWroteBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_productions', 'productions_id', 'users_id');
    }

    public function publisher(): MorphTo
    {
        return $this->morphTo();
    }

    public function updateRules(): array
    {
        return [
            'title' => 'string|max:255',
            'year' => 'int|date_format:Y',
            'publisher_type' => ['nullable', 'required_with:publisher_id', 'string', 'max:255', new ClassExists()],
            'publisher_id' => ['nullable', 'required_with:publisher_type', 'int', new MorphExists()],
            'doi' => ['nullable', 'string', 'max:255', Rule::unique(Production::class, 'doi')],
            'sequence_number' => 'nullable|int',
        ];
    }

    public function findAll(): Collection
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

    public function totalProductionsPerYear($user_type, $course_id, $publisher_type): array
    {
        $years = DB::table('productions')
            ->select(DB::raw('min(productions.year) as min, max(productions.year) as max'))
            ->get();

        $data = DB::table('productions')
                ->when($publisher_type, function ($query, $publisher_type){
                    $query->where('productions.publisher_type', '=', $publisher_type );
                })
                ->when($user_type, function ($query, $user_type){
                    $query->join('users_productions', "users_productions.productions_id", '=', 'productions.id');
                    $query->join('users', 'users.id', '=', 'users_productions.users_id');
                    $query->where('users.type','=', $user_type);
                })
                ->when($course_id, function ($query, $course_id){
                    $query->where('users.course_id', '=', $course_id);
                })
                ->select(DB::raw('distinct productions.id, productions.year'))
                ->select(DB::raw('productions.year, count(productions.id) as production_count'))
                ->groupBy('productions.year')
                ->orderBy('productions.year')
                    ->get();


        

        $dataYear = [];
        $dataCount = [];

        for ($year = $years[0]->min;  $year <= $years[0]->max; $year++){
            $dataYear[] = $year;
            if($data[0]->year == $year){
                $dataCount[] = $data[0]->production_count;
                $data->shift();
            } else {
                $dataCount[] = 0;
            }
        }

        return [$dataYear, $dataCount];
    }

    

    public function totalProductionsPerCourse($pattern): array
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

        for ($nCourse = 1; $nCourse <= $totalOfCourses; $nCourse++) {
            $data = DB::table('productions')
                ->select(DB::raw('productions.year, count(distinct productions.id) as total'))
                ->join('users_productions', 'productions.id',
                    '=', 'users_productions.productions_id')
                ->join('users', 'users.id', '=', 'users_productions.users_id')
                ->join('courses', 'courses.id', '=', 'users.course_id')
                ->where('courses.id', '=', $nCourse)
                ->where('users.type', '=', UserType::STUDENT)
                ->groupBy('productions.year', 'courses.id')
                ->get();
            $coursesProductions[$nCourse] = $data;
        }

        $data = array();
        $allYears = array();
        for ($year = $years[0]->min; $year <= $years[0]->max; $year++) {
            $allYears[] = $year;
        }

        for ($nCourse = 1; $nCourse <= $totalOfCourses; $nCourse++) {
            $auxData = $coursesProductions[$nCourse];
            $newTempData = array();
            $countIterations = 0;
            $dataSize = count($auxData);

            for ($year = $years[0]->min; $year <= $years[0]->max; $year++) {
                if ($countIterations < $dataSize &&
                    $auxData[$countIterations]->year == $year) {
                    $newTempData[] = $auxData[$countIterations]->total;
                    $countIterations++;
                } else {
                    $newTempData[] = 0;
                }
            }
            $data[$nCourse - 1] = $newTempData;
        }

        $dataWithLabels = array();
        for ($nCourse = 1; $nCourse <= $totalOfCourses; $nCourse++) {
            $dataWithLabels[] = ['label' => $coursesName[$nCourse - 1]->name, 'data' => $data[$nCourse - 1]];
        }
        return [$pattern[0] => $allYears, $pattern[1] => $dataWithLabels];
    }

    protected function setQualis(): void
    {
        if ($this->publisher) {
            $this->last_qualis = $this->publisher->last_qualis;
            $this->stratum_qualis_id = $this->publisher->stratum_qualis_id;
        }
    }
}
