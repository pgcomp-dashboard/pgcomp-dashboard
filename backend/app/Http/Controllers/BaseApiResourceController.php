<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Filters;
use App\Http\Requests\Api\BaseResourceIndexRequest;
use App\Models\BaseModel;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

abstract class BaseApiResourceController extends Controller
{
    protected Builder $query;

    public function __construct()
    {
        $this->query = $this->newBaseQuery();
    }

    /**
     * Display a listing of the resource.
     */
    public function index(BaseResourceIndexRequest $request)
    {
        $model = $this->newModelInstance();

        $orderBy = $request->input('order_by');
        if ($orderBy && $model->canSortBy($orderBy)) {
            $this->query->orderBy($orderBy, $request->input('dir', 'asc'));
        }

        (new Filters($this->query))->applyFilters($request->input('filters', []));

        $results = $this->query->paginate($request->input('per_page'));

        if ($resourceClass = $this->resourceClass()) {
            return $resourceClass::collection($results);
        }

        return $results;
    }




    /**
     * Display the specified resource.
     */
    public function show(int $id)
    {
        $model = $this->findOrFail($id);

        if ($resourceClass = $this->resourceClass()) {
            return new $resourceClass($model);
        }

        return $model;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(int $id)
    {
        $model = $this->findOrFail($id);

        return $model->delete();
    }

    protected function findOrFail(int $id, array $columns = ['*']): BaseModel
    {
        return $this->newBaseQuery()->findOrFail($id, $columns);
    }

    protected function newModelInstance(): BaseModel
    {
        return $this->modelClass()::newModelInstance();
    }

    protected function newBaseQuery(): Builder
    {
        return $this->modelClass()::query();
    }

    /**
     * Return class name.
     */
    abstract protected function modelClass(): string|BaseModel;

    /**
     * Return resource class name.
     */
    protected function resourceClass(): ?string
    {
        return null;
    }

    /**
     * Get the query builder instance.
     */
    public function getQuery(): Builder
    {
        return $this->query;
    }
}
