<?php

namespace App\Http\Controllers\Api;

use App\Domain\Lattes\LattesZipXml;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function importLattesFile(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/xml,text/xml', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store('lattes-files');

        $data = LattesZipXml::extractProductions($path);
        $user->updateLattes($data);

        return $user;
    }
}
