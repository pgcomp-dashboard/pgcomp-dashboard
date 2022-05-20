<?php

namespace App\Models;

use App\Enums\UserType;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * App\Models\Area
 *
 * @property int $id
 * @property string $area_name
 * @property int $program_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Program $program
 * @method static Builder|Area newModelQuery()
 * @method static Builder|Area newQuery()
 * @method static Builder|Area query()
 * @method static Builder|Area whereAreaName($value)
 * @method static Builder|Area whereCreatedAt($value)
 * @method static Builder|Area whereId($value)
 * @method static Builder|Area whereProgramId($value)
 * @method static Builder|Area whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Area extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'area_name',
        'program_id',
    ];

    public static function creationRules(): array
    {
        return [
            'area_name' => 'required|string|max:255',
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
                'required',
            ],
        ];
    }

    public static function createOrUpdateArea(array $data): Area
    {
        return Area::updateOrCreate(
            Arr::only($data, ['area_name']),
            $data
        );
    }

    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    public function subarea(): HasMany
    {
        return $this->hasMany(Subarea::class, 'area_id', 'id');
    }

    public function updateRules(): array
    {
        return [
            'area_name' => 'required|string|max:255',
            'program_id' => [
                'nullable',
                'int',
                Rule::exists(Program::class, 'id'),
                'required',
            ],
        ];
    }

    public function users(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, Subarea::class, 'area_id', 'subarea_id');
    }

    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, Subarea::class, 'area_id', 'subarea_id')
            ->where('type', UserType::STUDENT);
    }

    public function subareas(): HasMany
    {
        return $this->hasMany(Subarea::class, 'area_id', 'id')
            ->select("id", "subarea_name");
    }
}
