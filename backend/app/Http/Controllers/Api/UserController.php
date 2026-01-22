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
        error_log("Estou no import lattes file");
        //$user = $request->user()->id;
        $user = Auth::user();
        //dd($request->all());
        //error_log($request->file('file'));

        $request->validate([
            'file' => ['required', 'file', 'mimetypes:application/zip,application/x-zip-compressed,application/xml,text/xml', 'max:5120'],
        ]);

        $file = $request->file('file');
        //dd($file);
        $path = $file->store('lattes-files');

        $data = LattesZipXml::extractProductions($path);
        //if($data){
        //    return $data['productions'];
        dd($data);
        //}
        $user->updateLattes($data);
        return response()->json($data, 201);
    }
}
