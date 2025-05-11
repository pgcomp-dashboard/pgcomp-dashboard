<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'publisher_type',
        'publisher_id',
        'doi',
    ];

    /**
     * @return array creation rules to validate attributes.
     */
    public static function creationRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255', Rule::unique(Production::class, 'title')->whereNull('doi')],
            'year' => 'required|int|date_format:Y',
            'publisher_type' => ['nullable', 'required_with:publisher_id', 'string', 'max:255'],
            'publisher_id' => ['nullable', 'int', 'exists:publishers,id'],
            'doi' => ['nullable', 'string', 'max:255', Rule::unique(Production::class, 'doi')],
            'sequence_number' => 'nullable|int',
        ];
    }

    /**
     * boot the model by setting the production qualis
     *
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function (self $production) {
            $production->setQualis();
        });
        static::updating(function (self $production) {
            $production->setQualis();
        });
    }

    /**
     * Establishes a relationship of belonging-to-many with the user model. When the user write the production.
     *
     * @return BelongsTo a user can have several products
     */
    public function isWroteBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_productions', 'productions_id', 'users_id');
    }

    /**
     * Establishes a relationship of belonging-to-many with the user model. When the user write the production.
     *
     * @return BelongsTo a user can have several products
     */
    public function publisher(): BelongsTo
    {
        return $this->belongsTo(Publishers::class, 'publisher_id', 'id');
    }

    /**
     * @return array update rules to validate attributes.
     */
    public function updateRules(): array
    {
        return [
            'title' => 'string|max:255',
            'year' => 'int|date_format:Y',
            'publisher_type' => ['nullable', 'required_with:publisher_id', 'string', 'max:255'],
            'publisher_id' => ['nullable', 'int', 'exists:publishers,id'],
            'sequence_number' => 'nullable|int',
        ];
    }

    /**
     * Insert related models when working with many-to-many relations
     *
     * @param int id to create the relationship between production and user
     */
    public function saveInterTable($users_id)//: void
    {
        $this->isWroteBy()->attach($users_id);
    }

    /**
     * @param ?string $user_type the type of the user, if he is a student or a teacher
     * @param ?string $course_id course_id
     * @param ?string $publisher_type type of publisher
     * @return array returns an array containing the amount by total production separated by year
     */
    public static function totalProductionsPerYear(?string $user_type, ?string $course_id, ?string $publisher_type): array
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

    /**
     * @param string the type and publication (journal or conference)
     * @return array returns an array containing publications of the desired type separated by course
     */
    public function totalProductionsPerCourse($publisherType): array
    {
        $years = range(2014, Carbon::now()->year);
        $courses = Course::all();
        $data = [];
        /** @var Course $course */
        foreach ($courses as $course) {
            $courseData = ['label' => $course->name, 'data' => []];
            foreach ($years as $year) {
                $courseData['data'][] = Production::where('year', $year)
                    ->when($publisherType, function(Builder $builder, $publisherType) {
                        $builder->where('publisher_type', $publisherType);
                    })
                    ->whereHas('isWroteBy', function (Builder $builder) use ($course) {
                        $builder->where('course_id', $course->id);
                    })
                    ->distinct()
                    ->count();
            }
            $data[] = $courseData;
        }

        return compact('years', 'data');
    }

    /**
     * @param int id of user
     * @param int id of production
     * @return stdClass production of a given user
     */
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

    /**
     * Does the mapping and sets the stratum qualis of a given production
     *
     * @return void
     */
    protected function setQualis(): void
    {
        if ($this->publisher) {
            $this->last_qualis = $this->publisher->last_qualis;
            $this->stratum_qualis_id = $this->publisher->stratum_qualis_id;
        }
    }
}
