<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Resources\CourseResource;
use App\Models\BaseModel;
use App\Models\Course;
use Illuminate\Http\Request;

class CourseController extends BaseApiResourceController
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $model = $this->modelClass()::create($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $model = $this->findOrFail($id);

        $model->update($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }
    protected function modelClass(): string|BaseModel
    {
        return Course::class;
    }

    protected function resourceClass(): string
    {
        return CourseResource::class;
    }
}
