<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Controllers\Controller;
use App\Http\Resources\ConferenceResource;
use App\Models\BaseModel;
use App\Models\Conference;
use App\Http\Requests\Admin\Conference\StoreConferenceRequest;
use App\Http\Requests\Admin\Conference\UpdateConferenceRequest;
use App\Models\Publishers;
use App\Services\PublisherService;

class ConferenceController extends Controller
{
    protected PublisherService $service;

    public function __construct(PublisherService $service)
    {
        $this->service = $service;
    }

    public function index()
    {
        $results = $this->service->listConferences(15);

        return ConferenceResource::collection($results);
    }

    public function show(int $id){
        return new ConferenceResource($this->service->findConference($id));
    }

    public function store(StoreConferenceRequest $request)
    {
        $model = $this->service->create($request->all());

        return new ConferenceResource($model);
    }

    public function update(UpdateConferenceRequest $request, int $id)
    {
        $model = $this->service->update($id, $request->all());

        return new ConferenceResource($model);
    }
}
