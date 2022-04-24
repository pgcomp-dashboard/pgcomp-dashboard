<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\Area;
use App\Models\BaseModel;

class AreaController extends BaseApiResourceController
{

    protected function modelClass(): string|BaseModel
    {
        return Area::class;
    }
}
