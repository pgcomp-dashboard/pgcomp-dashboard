<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * App\Models\StratumQualis
 *
 * @property int $id
 * @property string $code
 * @property int $score
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @method static Builder|StratumQualis newModelQuery()
 * @method static Builder|StratumQualis newQuery()
 * @method static Builder|StratumQualis query()
 * @method static Builder|StratumQualis whereCode($value)
 * @method static Builder|StratumQualis whereCreatedAt($value)
 * @method static Builder|StratumQualis whereId($value)
 * @method static Builder|StratumQualis whereScore($value)
 * @method static Builder|StratumQualis whereUpdatedAt($value)
 * @mixin Eloquent
 */
class StratumQualis extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'code',
        'score',
    ];

    /**
     * @return array creation rules to validate attributes.
     */
    public static function creationRules(): array
    {
        return [
            'code' => 'required|string|max:2',
            'score' => 'required|int',
        ];
    }

    /**
     * finds a certain stratuns qualis from a code
     *
     * @param string code
     * @param array columns
     * @return self stratumQualis by code
     */
    public static function findByCode(string $code, array $columns = ['*']): self
    {
        return self::where('code', $code)->firstOrFail($columns);
    }

    /**
     * @return array update rules to validate attributes.
     */
    public function updateRules(): array
    {
        return [
            'code' => 'string|max:2',
            'score' => 'int',
        ];
    }

    /**
     * Returns an array with all productions separated by qualis
     *
     * @param string $user_type indicating whether you are a teacher or student
     * @param int $course_id  id do course.
     * @param string $publichser_type can be conference or journal
     * @return array array with productions separated by qualis
     */
    public function totalProductionsPerQualis($user_type, $course_id, $publisher_type): array
    {
        $years = range(2014, Carbon::now()->year);
        $stratumQualis = StratumQualis::orderByDesc('score')->get();
        $data = [];
        /** @var StratumQualis $qualis */
        foreach ($stratumQualis as $qualis) {
            $qualisData = ['label' => $qualis->code, 'data' => []];
            foreach ($years as $year) {
                $qualisData['data'][] = Production::whereStratumQualisId($qualis->id)
                    ->where('year', $year)
                    ->when($publisher_type, function(Builder $builder, $publisherType) {
                        $builder->whereHas('publisher', function (Builder $q) use ($publisherType) {
                            $q->where('publisher_type', $publisherType);
                        });
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
            $data[] = $qualisData;
        }

        return compact('years', 'data');
    }
    public function publisher(): HasMany
    {
        return $this->hasMany(Publishers::class);
    }
    public function productions()
    {
        return $this->hasMany(Production::class);
    }
}
