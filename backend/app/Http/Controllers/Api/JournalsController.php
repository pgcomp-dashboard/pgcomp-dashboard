<?php

namespace App\Http\Controllers\Api;

use App\Models\BaseModel;
use App\Models\Journal;

class JournalsController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Journal::class;
    }
}
