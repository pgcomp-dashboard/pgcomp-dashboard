<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Program;

class ProgramController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Program::class;
    }
}
