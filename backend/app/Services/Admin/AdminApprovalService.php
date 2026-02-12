<?php

namespace App\Services\Admin;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class AdminApprovalService
{
    public function listPending(): Collection
    {
        return User::with('approver:id,name')
            ->anyAdminRequest()
            ->onlyPendingAdminRequest()
            ->latest('admin_requested_at')
            ->get();
    }

    public function listAll(): Collection
    {
        return User::with('approver:id,name')
            ->anyAdminRequest()
            ->latest('admin_requested_at')
            ->get();
    }

    public function approveOrReject(User $user, string $status, int $reviewerId): array
    {
        $isAdmin = $status === User::STATUS_APPROVED;

        $user->update([
            'admin_status' => $status,
            'approved_by_id' => $reviewerId,
            'is_admin' => $isAdmin,
        ]);

        return [
            'message' => $isAdmin ? 'Usuário aprovado!' : 'Usuário rejeitado!',
            'user' => $user->load('approver:id,name')
        ];
    }
}
