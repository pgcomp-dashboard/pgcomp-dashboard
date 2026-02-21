<?php

namespace App\Services;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\QueryBuilder;

class CourseService
{
    public function list()
    {
        return QueryBuilder::for(Course::class)
            ->allowedFilters(['name'])
            ->allowedSorts(['name'])
            ->paginate(request()->input('per_page', 15));
    }

    public function find(int $id): Course
    {
        return Course::findOrFail($id);
    }

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

    public function delete(int $id): bool
    {
        $course = $this->find($id);
        return $course->delete();
    }
}
