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

    /**
     * @return array creation rules to validate attributes.
     */
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

    /**
     * Create or update an area in the database
     *
     * @param array array counting the model area fields
     * @return \App\Models\Area an instance of the area model
     */
    public static function createOrUpdateArea(array $data): Area
    {
        return Area::updateOrCreate(
            Arr::only($data, ['area_name']),
            $data
        );
    }

    /**
     * Establishes a relationship of belonging with the program model
     *
     * @return BelongsTo Relation of belonging area -> program
     */
    public function program(): BelongsTo
    {
        return $this->belongsTo(Program::class, 'program_id');
    }

    /**
     * Establish a has-many relationship with the subarea model
     *
     * @return HasMany Relation that an area has more than one subarea
     */
    public function subarea(): HasMany
    {
        return $this->hasMany(Subarea::class, 'area_id', 'id');
    }

    /**
     * @return array update rules to validate attributes.
     */
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

    /**
     * Establish a relationship of, has-many-through, with the users model
     *
     * @return HasManyThrough An area has more than one user from a given subarea
     */
    public function users(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, Subarea::class, 'area_id', 'subarea_id');
    }

    /**
     * Establish a relationship of, has-many-through, with the users model with students type
     *
     * @return HasManyThrough An area has more than one user with students type from a given subarea
     */
    public function students(): HasManyThrough
    {
        return $this->hasManyThrough(User::class, Subarea::class, 'area_id', 'subarea_id')
            ->where('type', UserType::STUDENT);
    }

    /**
     * Establish a relationship of, has-many-through, with the usersSubarea model and subarea
     *
     * @return HasManyThrough An area has more than one usersSubarea with  from a given subarea
     */
    public function usersInSubarea(){
        return $this->hasManyThrough(UsersSubarea::class, Subarea::class,
            'area_id', 'subareas_id');
    }
}
