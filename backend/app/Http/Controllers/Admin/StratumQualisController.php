<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StratumQualisResource;
use App\Models\StratumQualis;
use App\Http\Requests\Admin\StratumQualis\StoreStratumQualisRequest;
use App\Http\Requests\Admin\StratumQualis\UpdateStratumQualisRequest;

class StratumQualisController extends Controller
{
    public function index()
    {
        $qualis = StratumQualis::all();

        return StratumQualisResource::collection($qualis);
    }

    public function show(int $id)
    {
        $qualis = StratumQualis::findOrFail($id);

        return new StratumQualisResource($qualis);
    }

    public function store(StoreStratumQualisRequest $request)
    {
        $model = StratumQualis::create($request->all());

        return new StratumQualisResource($model);
    }

    public function update(UpdateStratumQualisRequest $request, int $id)
    {
        $model = StratumQualis::findOrFail($id);

        $model->update($request->all());

        return new StratumQualisResource($model);
    }

    public function destroy(int $id)
    {
        $stratumQualis = StratumQualis::findOrFail($id);

        if ($stratumQualis->productions()->exists()) {
            return response()->json([
                'message' => 'Não é possível deletar este Qualis pois existem produções vinculadas a ele. Por favor remova essas produções antes.'
            ], 409);
        }

        $stratumQualis->delete();

        return response()->json(['message' => 'Qualis deletado com sucesso']);
    }
}
