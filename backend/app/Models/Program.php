<?php

namespace App\Models;

use App\Enums\UserType;
use Illuminate\Validation\Rule;

/**
 * App\Models\Program
 *
 * @property int $id
 * @property int $sigaa_id
 * @property string $name
 * @property string|null $description
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $professors
 * @property-read int|null $professors_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $students
 * @property-read int|null $students_count
 * @property-read \Illuminate\Database\Eloquent\Collection|\App\Models\User[] $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder|Program newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Program newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Program query()
 * @method static \Illuminate\Database\Eloquent\Builder|Program whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Program whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Program whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Program whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Program whereSigaaId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Program whereUpdatedAt($value)
 * @mixin \Eloquent
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
        $course = Program::where('name', $courseName)->firstOrFail();
        if(is_null($course)){
            return "error";
        }
        return $course;
    }

    public function findBySigaaID($sigaaId): static
    {
        return Program::checkIfCourseAlreadyExist($sigaaId);
    }

    public function findAllCourses($columns): \Illuminate\Database\Eloquent\Collection|array
    {
        return Program::all($columns);
    }

    public function findAllCoursesByColumns($columns, $pattern): \Illuminate\Database\Eloquent\Collection|array
    {
        $data = Program::all($columns);
        $data = $data[0];
        $dataInNewPattern = array();
        for($counter = 0; $counter < count($columns); $counter++){
            $dataInNewPattern[$pattern[$counter]] = $data[$columns[$counter]];
        }

        return $dataInNewPattern;
    }

    protected function checkIfCourseAlreadyExist(int $sigaaId): static
    {
        $course = new Program();
        $course = Program::find($sigaaId);
        if(is_null($course)){
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

    public static function creationRules(): array
    {
        return [
            'sigaa_id' => ['required', 'int', Rule::unique(self::class, 'id')],
            'name' => 'required|string|max:255',
            'description' => 'string|max:2500',
        ];
    }

    public static function updateRules(): array
    {
        return [
            'name' => 'string|max:255',
            'description' => 'string|max:2500',
        ];
    }

    public function users(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(User::class, 'program_id');
    }

    public function professors(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->users()->where('type', UserType::PROFESSOR->value);
    }

    public function students(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->users()->where('type', UserType::STUDENT->value);
    }
}
