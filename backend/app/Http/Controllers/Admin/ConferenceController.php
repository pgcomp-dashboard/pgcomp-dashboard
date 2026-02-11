<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Models\BaseModel;
use App\Models\Conference;
use App\Http\Requests\Admin\Conference\StoreConferenceRequest;
use App\Http\Requests\Admin\Conference\UpdateConferenceRequest;

class ConferenceController extends BaseApiResourceController
{
    protected function modelClass(): string|BaseModel
    {
        return Conference::class;
    }

    protected function resourceClass(): string
    {
        return ConferenceResource::class;
    }

    public function store(StoreConferenceRequest $request)
    {
        $model = $this->modelClass()::create($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    public function update(UpdateConferenceRequest $request, int $id)
    {
        $model = $this->findOrFail($id);

        $model->update($request->all());

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }
}
