<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AdminApprovalService
{
    public function listPending(): Collection
    {
        return User::anyAdminRequest()
            ->onlyPendingAdminRequest()
            ->latest()
            ->get();
    }

    public function listAll(): Collection
    {
        return User::anyAdminRequest()
            ->latest()
            ->get();
    }

    public function approveOrReject(User $user, string $status, int $reviewerId): array
    {
        $isAdmin = $status === User::STATUS_APPROVED;

        $user->update([
            'admin_status' => $status,
            'is_admin' => $isAdmin,
        ]);

        return [
            'message' => $isAdmin ? 'Usuário aprovado!' : 'Usuário rejeitado!',
            'user' => $user
        ];
    }
}
