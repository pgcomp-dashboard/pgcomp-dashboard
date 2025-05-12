<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Course;

class CourseController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Course::class;
    }
}
