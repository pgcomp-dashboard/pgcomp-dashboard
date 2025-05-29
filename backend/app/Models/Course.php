<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

/**
 * App\Models\Course
 *
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 *
 * @method static Builder|Course newModelQuery()
 * @method static Builder|Course newQuery()
 * @method static Builder|Course query()
 * @method static Builder|Course whereCreatedAt($value)
 * @method static Builder|Course whereDescription($value)
 * @method static Builder|Course whereId($value)
 * @method static Builder|Course whereName($value)
 * @method static Builder|Course whereUpdatedAt($value)
 *
 * @mixin Eloquent
 */
class Course extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
    ];

    /**
     * @return array creation rules to validate attributes.
     */
    public static function creationRules(): array
    {
        return [
            'name' => 'required|string|max:255',
        ];
    }

    /**
     * @return array update rules to validate attributes.
     */
    public function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
        ];
    }
}
