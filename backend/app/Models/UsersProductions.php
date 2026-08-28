<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Pagination\LengthAwarePaginator;

class UsersProductions extends Pivot
{
    protected $table = 'users_productions';

    protected $casts = [
        'is_featured' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'users_id');
    }

    public function production(): BelongsTo
    {
        return $this->belongsTo(Production::class, 'productions_id');
    }

    /**
     * Retorna as produções favoritadas/destacadas de um professor específico paginadas.
     *
     * @param int $userId ID do professor/usuário
     * @param int $perPage Quantidade por página (padrão: 4)
     * @return LengthAwarePaginator
     */
    public static function getFeaturedByTeacher(int $userId, int $perPage = 4): LengthAwarePaginator
    {
        return self::with(['production.publisher'])
            ->where('users_id', $userId)
            ->where('is_featured', true)
            ->orderByDesc('updated_at')
            ->paginate($perPage);
    }
}
