<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\User;

class UsersController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }
}
