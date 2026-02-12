<?php

namespace App\Models;

use App\Enums\PublisherType;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * App\Models\StratumQualis
 *
 * @property int $id
 * @property string $code
 * @property float $score
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder|StratumQualis newModelQuery()
 * @method static Builder|StratumQualis newQuery()
 * @method static Builder|StratumQualis query()
 * @method static Builder|StratumQualis whereCode($value)
 * @method static Builder|StratumQualis whereCreatedAt($value)
 * @method static Builder|StratumQualis whereId($value)
 * @method static Builder|StratumQualis whereScore($value)
 * @method static Builder|StratumQualis whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class StratumQualis extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'type',
        'code',
        'score',
    ];

    /**
     * The attributes that are used to filter.
     *
     * @var string[]
     */
    protected array $filterable = ['type', 'code', 'score'];

    /**
     * @return array creation rules to validate attributes.
     */
    public static function creationRules(): array
    {
        return [
            'type' => 'required|in:journal,conference',
            'code' => 'required|string|max:2',
            'score' => 'required|decimal:0,2',
        ];
    }

    /**
     * finds a certain stratum qualis from a code
     *
     * @param string code
     * @param array columns
     * @return self stratumQualis by code
     */
    public static function findByCode(string $code, string $type, array $columns = ['*']): self
    {
        return self::where('type', $type)
        ->where('code', $code)->firstOrFail($columns);
    }

    /**
     * @return array update rules to validate attributes.
     */
    public function updateRules(): array
    {
        return [
            'type' => 'string|in:journal,conference',
            'code' => 'string|max:2',
            'score' => 'decimal:0,2',
        ];
    }

    /**
     * Returns an array with all productions separated by qualis
     *
     * @param  string  $user_type  indicating whether you are a teacher or student
     * @param  int  $course_id  id do course.
     * @param  string  $publichser_type  can be conference or journal
     * @return array array with productions separated by qualis
     */
    public function totalProductionsPerQualis($user_type, $course_id, $publisher_type): array
    {
        $years = range(2014, Carbon::now()->year);

        // Define the desired Qualis order
        $qualisOrder = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C', 'NI'];

        // Fetch counts grouped by year and stratum_qualis_id
        $counts = Production::query()
            ->select('year', 'stratum_qualis_id', DB::raw('count(*) as total'))
            ->whereIn('year', $years)
            ->when($publisher_type, function (Builder $q, $publisherType) {
                $q->whereHas('publisher', function (Builder $pq) use ($publisherType) {
                    $pq->where('publisher_type', $publisherType);
                });
            })
            ->when($user_type, function (Builder $q, $userType) {
                $q->whereHas('isWroteBy', function (Builder $uq) use ($userType) {
                    $uq->where('type', $userType);
                });
            })
            ->when($course_id, function (Builder $q, $courseId) {
                $q->whereHas('isWroteBy', function (Builder $uq) use ($courseId) {
                    $uq->where('course_id', $courseId);
                });
            })
            ->groupBy('year', 'stratum_qualis_id')
            ->get();

        // Get Qualis codes mapping
        $qualisMap = StratumQualis::pluck('code', 'id');

        // Aggregate by code and year
        $aggregated = [];
        foreach ($counts as $count) {
            $code = $qualisMap[$count->stratum_qualis_id] ?? 'NI';
            foreach ($years as $year) {
                if (!isset($aggregated[$code][$year])) {
                    $aggregated[$code][$year] = 0;
                }
            }
            $aggregated[$code][$count->year] += $count->total;
        }

        $data = [];
        foreach ($qualisOrder as $code) {
            $yearData = [];
            foreach ($years as $year) {
                $yearData[] = $aggregated[$code][$year] ?? 0;
            }
            // Só adiciona se houver algum valor maior que zero em algum ano para esse qualis
            // OU se for um dos principais que sempre queremos mostrar na legenda?
            // O componente original filtrava se existia no retorno do banco.
            // Vamos manter a lógica de mostrar apenas os que tem dados pra não poluir.
            if (array_sum($yearData) > 0) {
                $data[] = ['label' => $code, 'data' => $yearData];
            }
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
