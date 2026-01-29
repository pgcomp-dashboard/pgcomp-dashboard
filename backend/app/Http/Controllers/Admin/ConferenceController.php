<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Conference;

class ConferenceController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Conference::class;
    }
}
