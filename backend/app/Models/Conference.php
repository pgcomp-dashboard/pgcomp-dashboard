<?php

namespace App\Models;

use App\Traits\PublishProductions;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * App\Models\Conference
 *
 * @property int $id
 * @property string $initials
 * @property string $name
 * @property int|null $category
 * @property string|null $link
 * @property string|null $ce_indicated
 * @property string|null $h5
 * @property string|null $last_qualis
 * @property string|null $logs
 * @property string|null $h5_old
 * @property bool|null $use_scholar
 * @property string|null $qualis_2016
 * @property int|null $qualis_2016_id
 * @property string|null $qualis_without_induction
 * @property int|null $qualis_without_induction_id
 * @property string|null $sbc_adjustment_or_event
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property int|null $stratum_qualis_id
 * @property-read Collection|Production[] $productions
 * @property-read int|null $productions_count
 * @method static Builder|Conference newModelQuery()
 * @method static Builder|Conference newQuery()
 * @method static Builder|Conference query()
 * @method static Builder|Conference whereCategory($value)
 * @method static Builder|Conference whereCeIndicated($value)
 * @method static Builder|Conference whereCreatedAt($value)
 * @method static Builder|Conference whereH5($value)
 * @method static Builder|Conference whereH5Old($value)
 * @method static Builder|Conference whereId($value)
 * @method static Builder|Conference whereInitials($value)
 * @method static Builder|Conference whereLastQualis($value)
 * @method static Builder|Conference whereLink($value)
 * @method static Builder|Conference whereLogs($value)
 * @method static Builder|Conference whereName($value)
 * @method static Builder|Conference whereQualis2016($value)
 * @method static Builder|Conference whereQualis2016Id($value)
 * @method static Builder|Conference whereQualisWithoutInduction($value)
 * @method static Builder|Conference whereQualisWithoutInductionId($value)
 * @method static Builder|Conference whereSbcAdjustmentOrEvent($value)
 * @method static Builder|Conference whereStratumQualisId($value)
 * @method static Builder|Conference whereUpdatedAt($value)
 * @method static Builder|Conference whereUseScholar($value)
 * @mixin Eloquent
 */
class Conference extends BaseModel
{
    use HasFactory, PublishProductions;

    protected $fillable = [
        'initials',
        'name',
        'category',
        'link',
        'ce_indicated',
        'h5',
        'last_qualis',
        'stratum_qualis_id',
        'logs',
        'h5_old',
        'use_scholar',
        'qualis_2016',
        'qualis_without_induction',
        'sbc_adjustment_or_event',
        'qualis_2016_id',
        'qualis_without_induction_id',
    ];

    protected $casts = [
        'use_scholar' => 'boolean',
        'qualis_2016_id' => 'integer',
        'qualis_without_induction_id' => 'integer',
    ];

    /**
     * @return array creation rules to validate attributes.
     */
    public static function creationRules(): array
    {
        return [
            'initials' => 'string|max:255|required',
            'name' => 'string|max:255|required',
            'category' => 'integer',
            'link' => 'string|max:500|nullable',
            'ce_indicated' => 'string|max:255|nullable',
            'h5' => 'string|max:255|nullable',
            'last_qualis' => 'string|max:255|nullable',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'logs' => 'string|max:255|nullable',
            'h5_old' => 'string|max:255|nullable',
            'use_scholar' => 'boolean',
            'qualis_2016' => 'string|max:255|nullable',
            'qualis_without_induction' => 'string|max:255|nullable',
            'sbc_adjustment_or_event' => 'string|max:255|nullable',
            'qualis_2016_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
            'qualis_without_induction_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
        ];
    }


    /**
     * @return array update rules to validate attributes.
    */
    public function updateRules(): array
    {
        return [
            'initials' => 'string|max:255|required',
            'name' => 'string|max:255|required',
            'category' => 'integer',
            'link' => 'string|max:500|nullable',
            'ce_indicated' => 'string|max:255|nullable',
            'h5' => 'string|max:255|nullable',
            'last_qualis' => 'string|max:255|nullable',
            'stratum_qualis_id' => [
                'nullable',
                'int',
                Rule::exists(StratumQualis::class, 'id'),
            ],
            'logs' => 'string|max:255|nullable',
            'h5_old' => 'string|max:255|nullable',
            'use_scholar' => 'boolean',
            'qualis_2016' => 'string|max:255|nullable',
            'qualis_without_induction' => 'string|max:255|nullable',
            'sbc_adjustment_or_event' => 'string|max:255|nullable',
            'qualis_2016_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
            'qualis_without_induction_id' => ['nullable', 'integer', Rule::exists(StratumQualis::class, 'id')],
        ];
    }

    /**
     * Establishes a relationship of belonging with the stratumQualis model
     *
     * @return BelongsTo Relation of belonging conference -> stratumQualis
     */
    public function stratumQualis(): BelongsTo
    {
        return $this->belongsTo(StratumQualis::class, 'stratum_qualis_id');
    }
}
