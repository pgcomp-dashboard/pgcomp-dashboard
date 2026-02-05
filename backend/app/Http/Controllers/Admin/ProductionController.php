<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Lattes\LattesZipXml;
use App\Enums\ProductionSource;
use App\Enums\UserType;
use App\Http\Controllers\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\User;
use Auth;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use function PHPUnit\Framework\isArray;

class ProductionController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Production::class;
    }

    public function importLattesFile(Request $request, User $user)
    {
        $user = auth()->user();

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
