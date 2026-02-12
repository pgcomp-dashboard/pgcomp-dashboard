<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Models\Area;
use App\Models\BaseModel;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use Illuminate\Http\Request;
use App\Http\Resources\AreaResource;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use App\Http\Requests\Admin\Area\StoreAreaRequest;
use App\Http\Requests\Admin\Area\UpdateAreaRequest;
use App\Services\AreaService;

class AreaController extends BaseApiResourceController
{
    private AreaService $areaService;

    public function __construct(AreaService $areaService)
    {
        parent::__construct();
        $this->areaService = $areaService;
    }

    protected function modelClass(): string|BaseModel
    {
        return Area::class;
    }

    protected function resourceClass(): string
    {
        return AreaResource::class;
    }

    public function store(StoreAreaRequest $request)
    {
        $model = $this->areaService->create($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function update(UpdateAreaRequest $request, int $id)
    {
        $model = $this->areaService->update($id, $request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function index(BaseResourceIndexRequest $request)
    {
        $areas = $this->areaService->list();

        if ($areas->isEmpty()) {
            throw new NotFoundHttpException('Nenhuma área encontrada');
        }

        return AreaResource::collection($areas);
    }

    public function destroy(int $id)
    {
        $area = $this->areaService->find($id);

        if ($this->areaService->hasUsers($id)) {
            throw new ConflictHttpException('Erro: Usuários cadastrados nessa área');
        }

        $this->areaService->delete($id);

        return response()->json(['message' => 'Area excluida com sucesso'], 200);
    }
}
