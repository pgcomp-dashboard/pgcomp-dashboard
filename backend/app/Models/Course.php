<?php

namespace App\Models;

class Course extends BaseModel
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
        $course = Course::checkIfCourseAlreadyExist($sigaaId);
        if (is_null($course)) {
            return "error";
        }
        $course->delete();
        return true;
    }

    public function findCourseByName($courseName): static
    {
        $course = new Course();
        $course = Course::where('name', $courseName)->first();
        if(is_null($course)){
            return "error";
        }
        return $course;
    }

    public function findBySigaaID($sigaaId): static
    {
        return Course::checkIfCourseAlreadyExist($sigaaId);
    }

    public function findAllCourses(): \Illuminate\Database\Eloquent\Collection|array
    {
        return Course::all();
    }

    protected function checkIfCourseAlreadyExist(int $sigaaId): static
    {
        $course = new Course();
        $course = Course::find($sigaaId);
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
            'sigaa_id' => 'required|int|unique:courses,sigaa_id',
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
