<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\StratumQualisResource;
use App\Models\StratumQualis;
use App\Http\Requests\Admin\StratumQualis\StoreStratumQualisRequest;
use App\Http\Requests\Admin\StratumQualis\UpdateStratumQualisRequest;
use App\Services\StratumQualisService;

class StratumQualisController extends Controller
{
    private StratumQualisService $stratumQualisService;

    public function __construct(StratumQualisService $stratumQualisService)
    {
        $this->stratumQualisService = $stratumQualisService;
    }

    public function index()
    {
        $qualis = $this->stratumQualisService->list();

        return StratumQualisResource::collection($qualis);
    }

    public function show(int $id)
    {
        $qualis = $this->stratumQualisService->find($id);

        return new StratumQualisResource($qualis);
    }

    public function store(StoreStratumQualisRequest $request)
    {
        $model = $this->stratumQualisService->create($request->all());

        return new StratumQualisResource($model);
    }

    public function update(UpdateStratumQualisRequest $request, int $id)
    {
        $model = $this->stratumQualisService->update($id, $request->all());

        return new StratumQualisResource($model);
    }

    public function destroy(int $id)
    {
        $error = $this->stratumQualisService->delete($id);

        if ($error) {
            return response()->json([
                'message' => $error
            ], 409);
        }

        return response()->json(['message' => 'Qualis deletado com sucesso']);
    }
}
