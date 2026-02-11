<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BaseApiResourceController;
use App\Http\Controllers\Controller;
use App\Http\Resources\JournalResource;
use App\Models\BaseModel;
use App\Models\Journal;
use App\Models\Publishers;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $results = Publishers::onlyJournals()->paginate(15);

        return JournalResource::collection($results);
    }

    public function show(int $id){
        return new JournalResource(Publishers::onlyJournals()->findOrFail($id));
    }
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $model = Publishers::create($request->all());

        return new JournalResource($model);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, int $id)
    {
        $model = Publishers::findOrFail($id);

        $model->update($request->all());

        return new JournalResource($model);
    }
}
