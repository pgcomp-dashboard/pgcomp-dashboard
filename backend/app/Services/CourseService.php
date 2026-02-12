<?php

namespace App\Services;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class CourseService
{
    public function create(array $data): Course
    {
        return Course::create($data);
    }

    public function update(int $id, array $data): Course
    {
        $course = $this->find($id);
        $course->update($data);
        return $course;
    }

    public function find(int $id): Course
    {
        return Course::findOrFail($id);
    }
}
