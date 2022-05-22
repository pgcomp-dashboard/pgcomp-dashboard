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
 * @property int|null $sequence_number
 * @property string|null $doi
 * @property-read Collection|User[] $isWroteBy
 * @property-read int|null $is_wrote_by_count
 * @property-read Model|Eloquent $publisher
 * @method static Builder|Production newModelQuery()
 * @method static Builder|Production newQuery()
 * @method static Builder|Production query()
 * @method static Builder|Production whereCreatedAt($value)
 * @method static Builder|Production whereDoi($value)
 * @method static Builder|Production whereId($value)
 * @method static Builder|Production whereLastQualis($value)
 * @method static Builder|Production wherePublisherId($value)
 * @method static Builder|Production wherePublisherType($value)
 * @method static Builder|Production whereSequenceNumber($value)
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
            'publisher_id' => ['nullable', 'int', new MorphExists()],
            'doi' => ['nullable', 'string', 'max:255', Rule::unique(Production::class, 'doi')],
            'sequence_number' => 'nullable|int',
        ];
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
            'publisher_id' => ['nullable', 'int', new MorphExists()],
            'sequence_number' => 'nullable|int',
        ];
    }

    public function saveInterTable($users_id)//: void
    {
        $this->isWroteBy()->attach($users_id);
    }

    public function totalProductionsPerYear($user_type, $course_id, $publisher_type): array
    {
        $years = range(2014, Carbon::now()->year);
        $data = [];
        foreach ($years as $year) {
            $data[] = Production::where('year', $year)
                ->when($publisher_type, function(Builder $builder, $publisherType) {
                    $builder->where('publisher_type', $publisherType);
                })
                ->when($user_type, function (Builder $builder, $userType) {
                    $builder->whereHas('isWroteBy', function (Builder $builder) use ($userType) {
                        $builder->where('type', $userType);
                    });
                })
                ->when($course_id, function (Builder $builder, $courseId) {
                    $builder->whereHas('isWroteBy', function (Builder $builder) use ($courseId) {
                        $builder->where('course_id', $courseId);
                    });
                })
                ->distinct()
                ->count();
        }

        return compact('years', 'data');
    }

    public function totalProductionsPerCourse($pattern): array
    {
        $totalOfCourses = DB::table('courses')
            ->select(DB::raw('distinct courses.id'))
            ->get();
        $totalOfCourses = count($totalOfCourses);

        $years = DB::table('productions')
            ->where('year', '>=', 2014)
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
                ->where('year', '>=', 2014)
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

    public function findAllUserProductions($user, $production){
        $data = DB::table('productions')
            ->select('productions.id')
            ->join('users_productions', 'productions.id',
                '=', 'users_productions.productions_id')
            ->join('users', 'users.id', '=', 'users_productions.users_id')
            ->where('users.id', '-', $user)
            ->where('productions.id', '=', $production );
        return $data;
    }

    protected function setQualis(): void
    {
        if ($this->publisher) {
            $this->last_qualis = $this->publisher->last_qualis;
            $this->stratum_qualis_id = $this->publisher->stratum_qualis_id;
        }
    }
}
