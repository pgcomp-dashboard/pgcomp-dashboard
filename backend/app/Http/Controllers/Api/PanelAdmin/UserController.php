<?php

namespace App\Http\Controllers\Api\PanelAdmin;

use App\Http\Controllers\Api\BaseApiResourceController;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\BaseModel;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;

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
                'data' => $user
            ]);
    }

    public function updateUserInfo(Request $request){
        $user = User::findOrFail(Auth::user()->id);
        $user->update($request->all());

        if($user){
            return response()->json([
                'status' => 200,
                'data' => $user,
            ]);
        }
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

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        return response()->noContent();
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function (User $user, string $password) {
            $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

            $user->save();

            event(new PasswordReset($user));
        }
        );

        return response()->noContent();
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
