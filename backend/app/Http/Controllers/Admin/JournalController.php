<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Journal;

class JournalController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Journal::class;
    }
}
