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
    ];

    protected $casts = [
        'sigaa_id' => 'int',
    ];

    public static function creationRules(): array
    {
        return [
            'sigaa_id' => ['required', 'int', Rule::unique(self::class, 'id')],
            'name' => 'required|string|max:255',
            'description' => 'string|max:2500',
        ];
    }

    public function deleteCourse($sigaaId)
    {
        $course = Program::checkIfCourseAlreadyExist($sigaaId);
        if (is_null($course)) {
            return "error";
        }
        $course->delete();
        return true;
    }

    public function findCourseByName($courseName): static
    {
        $course = new Program();
        $course = Program::where('name', $courseName)->first();
        if (is_null($course)) {
            return "error";
        }
        return $course;
    }

    public function findBySigaaID($sigaaId): static
    {
        return Program::checkIfCourseAlreadyExist($sigaaId);
    }

    public function findAllCourses(): Collection|array
    {
        return Program::all();
    }

    public function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
            'description' => 'string|max:2500',
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

    protected function checkIfCourseAlreadyExist(int $sigaaId): static
    {
        $course = Program::find($sigaaId);
        if (is_null($course)) {
            return "error";
        }
        return $course;
    }

    protected function fillCourseFields($course, $courseArray)
    {
        $course->sigaa_id = $courseArray['sigaa_id'];
        $course->name = $courseArray['name'];
        return $course;
    }
}
