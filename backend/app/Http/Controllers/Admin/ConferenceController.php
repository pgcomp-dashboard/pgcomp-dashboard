<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Resources\ConferenceResource;
use App\Models\BaseModel;
use App\Models\Conference;
use App\Http\Requests\Admin\Conference\StoreConferenceRequest;
use App\Http\Requests\Admin\Conference\UpdateConferenceRequest;
use App\Models\Publishers;

class ConferenceController extends Controller
{
    public function index()
    {
        $results = Publishers::onlyJournals()->paginate(15);

        return ConferenceResource::collection($results);
    }

    public function show(int $id){
        return new ConferenceResource(Publishers::onlyJournals()->findOrFail($id));
    }

    public function store(StoreConferenceRequest $request)
    {
        $model = Publishers::create($request->all());

        return new ConferenceResource($model);
    }

    public function update(UpdateConferenceRequest $request, int $id)
    {
        $model = Publishers::findOrFail($id);

        $model->update($request->all());

        return new ConferenceResource($model);
    }
}
