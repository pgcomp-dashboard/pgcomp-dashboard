<?php

namespace App\Services;

use App\Models\StratumQualis;
use Illuminate\Database\Eloquent\Collection;

class StratumQualisService
{
    public function list(): Collection
    {
        return StratumQualis::all();
    }

    public function create(array $data): StratumQualis
    {
        return StratumQualis::create($data);
    }

    public function update(int $id, array $data): StratumQualis
    {
        $qualis = $this->find($id);
        $qualis->update($data);
        return $qualis;
    }

    public function find(int $id): StratumQualis
    {
        return StratumQualis::findOrFail($id);
    }

    public function delete(int $id): ?string
    {
        $qualis = $this->find($id);

        if ($qualis->productions()->exists()) {
             return 'Não é possível deletar este Qualis pois existem produções vinculadas a ele. Por favor remova essas produções antes.';
        }

        $qualis->delete();

        return null;
    }
}
