<?php

namespace App\Models;

use App\Enums\UserType;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * App\Models\Subarea
 *
 * @property int $id
 * @property string $subarea_name
 * @property int $area_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Area $area
 * @method static Builder|Subarea newModelQuery()
 * @method static Builder|Subarea newQuery()
 * @method static Builder|Subarea query()
 * @method static Builder|Subarea whereAreaId($value)
 * @method static Builder|Subarea whereCreatedAt($value)
 * @method static Builder|Subarea whereId($value)
 * @method static Builder|Subarea whereSubareaName($value)
 * @method static Builder|Subarea whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Subarea extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'subarea_name',
        'area_id',
    ];

    public static function creationRules(): array
    {
        return [
            'subarea_name' => 'required|string|max:255',
            'area_id' => [
                'nullable',
                'int',
                Rule::exists(Area::class, 'id'),
                'required',
            ],
        ];
    }

    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function updateRules(): array
    {
        return [
            'subarea_name' => 'required|string|max:255',
            'area_id' => [
                'nullable',
                'int',
                Rule::exists(Area::class, 'id'),
                'required',
            ],
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'subarea_id', 'id');
    }

    public function students(): HasMany
    {
        return $this->users()->where('type', UserType::STUDENT);
    }
}
