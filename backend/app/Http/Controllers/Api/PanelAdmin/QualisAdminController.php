<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\StratumQualis;

class QualisAdminController extends BaseApiResourceController{


    protected function modelClass(): string|BaseModel
    {
        return StratumQualis::class;
    }
}
