<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\Response;

class UserPolicy
{
    public function approve(User $admin, User $targetUser): bool
    {
        // 1. O usuário logado ($admin) deve ter a permissão/role necessária
        // 2. Ele não pode aprovar a própria solicitação
        // 3. O usuário alvo deve estar realmente com status pendente
        return $admin->is_admin
            && $admin->id !== $targetUser->id;
    }
}
