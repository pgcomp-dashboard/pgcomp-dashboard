<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Area;
use App\Http\Resources\AreaResource;
use App\Http\Requests\Admin\Area\StoreAreaRequest;
use App\Http\Requests\Admin\Area\UpdateAreaRequest;
use App\Http\Requests\Admin\Area\IndexAreaRequest;
use App\Services\AreaService;

class AreaController extends Controller
{
    private AreaService $areaService;

    public function __construct(AreaService $areaService)
    {
        $this->areaService = $areaService;
    }

     public function index(IndexAreaRequest $request)
    {
        $areas = $this->areaService->list($request->validated());

        return AreaResource::collection($areas);
    }

    public function show(int $id)
    {
        $area = $this->areaService->find($id);

        return new AreaResource($area);
    }

    public function store(StoreAreaRequest $request)
    {
        $area = $this->areaService->create($request->validated());

        return new AreaResource($area);
    }

    public function update(UpdateAreaRequest $request, int $id)
    {
        $model = $this->areaService->update($id, $request->validated());

        return new AreaResource($model);
    }

    public function destroy(Area $area)
    {
        $this->areaService->delete($area);

        return response()->noContent();
    }
}
