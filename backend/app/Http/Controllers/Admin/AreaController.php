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

class AreaController extends BaseApiResourceController
{
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
        $model = $this->modelClass()::create($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function update(UpdateAreaRequest $request, int $id)
    {
        $model = $this->findOrFail($id);

        $model->update($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function index(BaseResourceIndexRequest $request)
    {
        $areas = Area::withCount('students')->get();

        if ($areas->isEmpty()) {
            throw new NotFoundHttpException('Nenhuma área encontrada');
        }

        return AreaResource::collection($areas);
    }

    public function destroy(int $id)
    {
        $area = Area::find($id);

        if (! $area) {
            throw new NotFoundHttpException('Área não cadastrada');
        }

        if ($area->users()->exists()) {
            throw new ConflictHttpException('Erro: Usuários cadastrados nessa área');
        }

        $area->delete();

        return response()->json(['message' => 'Area excluida com sucesso'], 200);
    }
}
