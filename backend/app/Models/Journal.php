<?php

namespace App\Models;

use App\Traits\PublishProductions;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * App\Models\Journal
 *
 * @property int $id
 * @property string $issn
 * @property string $name
 * @property string|null $sbc_adjustment
 * @property string|null $scopus_url
 * @property string|null $percentile
 * @property string|null $last_qualis
 * @property string|null $update_date
 * @property string|null $tentative_date
 * @property string|null $logs
 * @property int|null $stratum_qualis_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection|Production[] $productions
 * @property-read int|null $productions_count
 * @property-read StratumQualis|null $stratumQualis
 * @method static Builder|Journal newModelQuery()
 * @method static Builder|Journal newQuery()
 * @method static Builder|Journal query()
 * @method static Builder|Journal whereCreatedAt($value)
 * @method static Builder|Journal whereId($value)
 * @method static Builder|Journal whereIssn($value)
 * @method static Builder|Journal whereLastQualis($value)
 * @method static Builder|Journal whereLogs($value)
 * @method static Builder|Journal whereName($value)
 * @method static Builder|Journal wherePercentile($value)
 * @method static Builder|Journal whereSbcAdjustment($value)
 * @method static Builder|Journal whereScopusUrl($value)
 * @method static Builder|Journal whereStratumQualisId($value)
 * @method static Builder|Journal whereTentativeDate($value)
 * @method static Builder|Journal whereUpdateDate($value)
 * @method static Builder|Journal whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Journal extends BaseModel
{
    use HasFactory, PublishProductions;

    protected $fillable = [
        'name',
        'stratum_qualis_id',
        'issn',
        'sbc_adjustment',
        'scopus_url',
        'percentile',
        'last_qualis',
        'update_date',
        'tentative_date',
        'logs',
    ];

    public static function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'issn' => 'string|nullable|max:255',
            'sbc_adjustment' => 'string|nullable|max:255',
            'scopus_url' => 'string|nullable|max:255',
            'percentile' => 'string|nullable|max:255',
            'last_qualis' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
        ];
    }

    public static function createOrUpdateJournal(array $data): Journal
    {
        return Journal::updateOrCreate(
            Arr::only($data, ['name']),
            $data
        );
    }

    public function updateRules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'issn' => 'string|nullable|max:255',
            'sbc_adjustment' => 'string|nullable|max:255',
            'scopus_url' => 'string|nullable|max:255',
            'percentile' => 'string|nullable|max:255',
            'last_qualis' => 'string|nullable|max:255',
            'update_date' => 'date|nullable',
            'tentative_date' => 'date|nullable',
            'logs' => 'string|nullable|max:255',
        ];
    }

    public function stratumQualis(): BelongsTo
    {
        return $this->belongsTo(StratumQualis::class, 'stratum_qualis_id');
    }

    public function deleteJournal($name): bool
    {
        $journal = Journal::where('name', $name)->firstOrFail();
        return $journal->delete();
    }
}
