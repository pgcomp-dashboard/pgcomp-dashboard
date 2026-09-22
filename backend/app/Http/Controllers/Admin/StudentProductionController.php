<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\User\ProductionController;
use App\Http\Resources\ProductionResource;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\User\StoreProductionRequest;
use App\Http\Requests\User\UpdateProductionRequest;
use App\Services\ProductionService;

class StudentProductionController extends Controller
{
    protected ProductionController $productionController;
    protected ProductionService $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    public function index(Request $request, $students)
    {
        User::students()->findOrFail($students);

        return ProductionResource::collection(
            $this->productionService->getProductionsForUser((int) $students, $request->all())
        );
    }

    public function show($students, $productions)
    {
        if (!$this->productionService->checkOwnership($students, $productions)) {
            abort(400);
        } else {
            $this->productionController = $this->newInstance();

            return $this->productionController->show($productions);
        }
    }

    public function store(StoreProductionRequest $request, $students)
    {
        if ($students != $request->input('users_id')) {
            abort(400);
        }
        $this->productionController = $this->newInstance();

        return $this->productionController->store($request);
    }

    public function update(UpdateProductionRequest $request, $students, $productions)
    {
        $this->productionController = $this->newInstance();

        return $this->productionController->update($request, $productions);
    }

    public function destroy($students, $productions)
    {
        $this->productionController = $this->newInstance();

        return $this->productionController->destroy($productions);
    }
}
