<?php

namespace App\Models;

use App\Enums\UserType;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    /**
     * @return array creation rules to validate attributes.
     */
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

    /**
     * Establishes a relationship of belonging with the area model
     *
     * @return BelongsTo Relation of belonging subarea -> area
    */
    public function area(): BelongsTo
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    /**
     * Establishes a relationship of belongsToMany with the users model
     *
     * @return BelongsToMany Relation of belonging sinto subarea and users
    */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_subareas','subareas_id', 'users_id');
    }

    /**
     * Establish a has-many relationship with the user model
     *
     * @return HasMany Relation that an subarea has more than one user
     */
    public function user(): HasMany
    {
        return $this->hasMany(User::class, 'subarea_id', 'id');
    }

    /**
     * @return array update rules to validate attributes.
     */
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

    /**
     * Within a given subarea, returns users of type student
     *
     * @return array with all users student in subarea
     */
    public function students()
    {
        return $this->users()->where('type', UserType::STUDENT);
    }

    /**
     * Delete an instance of
     *
     * @param int $id, id of the subarea that needs to be deleted
     * @return static subarea model that was deleted
     */
    public static function deleteInstance($id){
        return Subarea::destroy($id);
    }
}
