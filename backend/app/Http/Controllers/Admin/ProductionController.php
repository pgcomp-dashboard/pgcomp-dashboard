<?php

namespace App\Http\Controllers\Admin;

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
}
