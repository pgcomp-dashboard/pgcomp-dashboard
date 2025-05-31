<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }

    public function store(Request $request)
    {
        $user = parent::store($request);

        return $user;
    }

    public function update(Request $request, int $id)
    {
        $user = parent::update($request, $id);

        return $user;
    }
}
