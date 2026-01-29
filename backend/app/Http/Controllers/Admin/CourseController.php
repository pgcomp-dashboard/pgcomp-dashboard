<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Course;

class CourseController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Course::class;
    }
}
