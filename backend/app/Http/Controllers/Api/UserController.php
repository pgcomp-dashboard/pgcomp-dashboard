<?php

namespace App\Http\Controllers\Api;

use App\Domain\Lattes\LattesXml;
use App\Domain\Lattes\LattesZipXml;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function importLattesFile(Request $request)
    {
        $user = Auth::user();
        //error_log($user->id);
        //error_log($request['file']);

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed,application/xml,text/xml', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store('lattes-files');

        $data = LattesZipXml::extractProductions($path);
        //if($data){
        //    return $data['productions'];
        //}
        $user->updateLattes($data);
        return $data;
    }
}
