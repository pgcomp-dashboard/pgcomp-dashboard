<?php

namespace App\Services;

use App\Models\Area;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Spatie\QueryBuilder\QueryBuilder;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;

class AreaService
{
    public function list()
    {
        return QueryBuilder::for(Area::class)
            ->withCount('students')
            ->allowedFilters(['area'])
            ->allowedSorts(['area'])
            ->paginate(request()->input('per_page', 15));
    }

    public function find(int $id): Area
    {
        return Area::findOrFail($id);
    }

    public function create(array $data): Area
    {
        return Area::create($data);
    }

    public function update(int $id, array $data): Area
    {
        $area = $this->find($id);
        $area->update($data);
        return $area;
    }

    public function delete(Area $area): bool
    {
        if ($area->users()->exists()) {
            throw new ConflictHttpException('Erro: Usuários cadastrados nessa área');
        }

        return DB::transaction(fn () => $area->delete());
    }
}
