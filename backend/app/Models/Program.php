<?php

namespace App\Models;

use Illuminate\Validation\Rule;

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

    public function findAllCourses(): \Illuminate\Database\Eloquent\Collection|array
    {
        return Program::all();
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
}
