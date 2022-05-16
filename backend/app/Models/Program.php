<?php

namespace App\Models;

use App\Enums\UserType;
use Eloquent;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

/**
 * App\Models\Program
 *
 * @property int $id
 * @property int $sigaa_id
 * @property string $name
 * @property string|null $description
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection|User[] $professors
 * @property-read int|null $professors_count
 * @property-read Collection|User[] $students
 * @property-read int|null $students_count
 * @property-read Collection|User[] $users
 * @property-read int|null $users_count
 * @method static Builder|Program newModelQuery()
 * @method static Builder|Program newQuery()
 * @method static Builder|Program query()
 * @method static Builder|Program whereCreatedAt($value)
 * @method static Builder|Program whereDescription($value)
 * @method static Builder|Program whereId($value)
 * @method static Builder|Program whereName($value)
 * @method static Builder|Program whereSigaaId($value)
 * @method static Builder|Program whereUpdatedAt($value)
 * @mixin Eloquent
 */
class Program extends BaseModel
{
    protected $fillable = [
        'sigaa_id',
        'name',
        'description',
        'started_at',
    ];

    protected $casts = [
        'sigaa_id' => 'int',
        'started_at' => 'datetime',
    ];

    public static function creationRules(): array
    {
        return [
            'sigaa_id' => ['required', 'int', Rule::unique(self::class, 'sigaa_id')],
            'name' => 'required|string|max:255',
            'description' => 'string|max:2500',
            'started_at' => 'date|nullable',
        ];
    }

    public function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
            'description' => 'string|max:2500',
            'started_at' => 'date|nullable',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'program_id');
    }

    public function professors(): HasMany
    {
        return $this->users()->where('type', UserType::PROFESSOR->value);
    }

    public function students(): HasMany
    {
        return $this->users()->where('type', UserType::STUDENT->value);
    }

    public function findAllCoursesByColumns($columns, $pattern): Collection|array
    {
        /**
         * @todo todos os dados devem ser retornados de forma paginada!
         */
        $data = Program::all($columns);
        $data = $data[0];
        $dataInNewPattern = array();
        for ($counter = 0; $counter < count($columns); $counter++) {
            $dataInNewPattern[$pattern[$counter]] = $data[$columns[$counter]];
        }

        return $dataInNewPattern;
    }
}
