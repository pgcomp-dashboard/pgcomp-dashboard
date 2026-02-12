<?php

namespace App\Services;

use App\Models\Area;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AreaService
{
    public function list(): Collection
    {
        return Area::withCount('students')->get();
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

    public function delete(int $id): bool
    {
        $area = $this->find($id);

        return $area->delete();
    }

    public function find(int $id): Area
    {
        return Area::findOrFail($id);
    }

    public function hasUsers(int $id): bool
    {
        $area = $this->find($id);
        return $area->users()->exists();
    }
}
