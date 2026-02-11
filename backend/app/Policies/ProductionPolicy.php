<?php

namespace App\Policies;

use App\Models\Production;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ProductionPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the production.
     */
    public function view(User $user, Production $production): bool
    {
        return $user->is_admin || $production->isWroteBy()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the production.
     */
    public function update(User $user, Production $production): bool
    {
        return $user->is_admin || $production->isWroteBy()->where('users.id', $user->id)->exists();
    }

    /**
     * Determine whether the user can delete the production.
     */
    public function delete(User $user, Production $production): bool
    {
        return $user->is_admin || $production->isWroteBy()->where('users.id', $user->id)->exists();
    }
}
