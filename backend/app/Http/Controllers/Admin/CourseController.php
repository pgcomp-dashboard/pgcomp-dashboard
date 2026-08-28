<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseResource;
use App\Models\Course;
use App\Services\CourseService;
use App\Http\Requests\Admin\Course\StoreCourseRequest;
use App\Http\Requests\Admin\Course\UpdateCourseRequest;
use App\Http\Requests\Admin\Course\IndexCourseRequest;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    private CourseService $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCourseRequest $request)
    {
        $course = $this->courseService->create($request->validated());
        return new CourseResource($course);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCourseRequest $request, int $id)
    {
        $course = $this->courseService->update($id, $request->validated());
        return new CourseResource($course);
    }

    public function index(IndexCourseRequest $request)
    {
        $courses = $this->courseService->list();
        return CourseResource::collection($courses);
    }

    public function show(int $id)
    {
        $course = $this->courseService->find($id);
        return new CourseResource($course);
    }

    public function destroy(int $id)
    {
        $this->courseService->delete($id);
        return response()->noContent();
    }
}
