<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UserController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return User::class;
    }

    public function getUserInfo(BaseResourceIndexRequest $request)
    {
        $user = $request->user();
        return response()->json([
                'data' => [
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);
    }

    public function changePassword(Request $request){
        $userId = $request->user()->id;

        $request->validate([
            'password' => 'required',
            'confirmPassword' => 'required'
        ]);

        if($request['password'] === $request['confirmPassword'])
        {
            $newPassword = Hash::make($request->password);

            User::where('id', $userId)->update(array('password' => $newPassword));

            return response()->json([
                'status' => 'success',
                'message' => 'Senha alterada com sucesso',
            ], 200);
        }
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
