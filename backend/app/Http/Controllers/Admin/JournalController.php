<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Controllers\Controller;
use App\Http\Resources\JournalResource;
use App\Models\BaseModel;
use App\Models\Journal;
use App\Models\Publishers;
use App\Services\PublisherService;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    protected PublisherService $service;

    public function __construct(PublisherService $service)
    {
        $this->service = $service;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $results = $this->service->listJournals(15);

        return JournalResource::collection($results);
    }

    public function show(int $id){
        return new JournalResource($this->service->findJournal($id));
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $model = $this->service->create($request->all());

        return new JournalResource($model);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $model = $this->service->update($id, $request->all());

        return new JournalResource($model);
    }
}
