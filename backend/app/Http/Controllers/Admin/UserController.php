<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Lattes\LattesZipXml;
use App\Http\Controllers\BaseApiResourceController;
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

    public function importLattesFileForUser(Request $request, User $user)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed,application/xml,text/xml', 'max:5120'],
        ]);

        $file = $request->file('file');

        $path = $file->store('lattes-files');

        $data = LattesZipXml::extractProductions($path);

        $user->updateLattes($data);

        return response()->json(['data' => $data], 201);
    }
}
