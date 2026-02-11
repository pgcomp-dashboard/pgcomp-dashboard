<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Lattes\LattesZipXml;
use App\Enums\ProductionSource;
use App\Enums\UserType;
use App\Http\Controllers\BaseApiResourceController;
use App\Http\Resources\ProductionResource;
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
use App\Http\Requests\Admin\ImportLattesRequest;
use App\Http\Requests\Admin\Production\StoreProductionRequest;
use App\Http\Requests\Admin\Production\UpdateProductionRequest;
use App\Services\ProductionService;

class ProductionController extends BaseApiResourceController
{
    private ProductionService $service;

    public function __construct(ProductionService $service)
    {
        $this->service = $service;
        parent::__construct();
    }

    protected function modelClass(): string|BaseModel
    {
        return Production::class;
    }

    protected function resourceClass(): string
    {
        return ProductionResource::class;
    }

    public function store(StoreProductionRequest $request)
    {
        $model = $this->modelClass()::create($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function update(UpdateProductionRequest $request, int $id)
    {
        $model = $this->findOrFail($id);

        $model->update($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function importLattesFile(ImportLattesRequest $request, User $user)
    {
        $file = $request->file('file');
        $path = $file->store('lattes-files');

        try {
             $data = $this->service->importFromLattes($user, $path);
             return response()->json(['data' => $data], 201);
        } catch (Exception $e) {
            return response()->json(['message' => 'Erro ao importar arquivo', 'error' => $e->getMessage()], 500);
        }
    }
}
