<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('approver')->anyAdminRequest();

        if ($request->query('status') === 'pending') {
            $query->onlyPendingAdminRequest();
        }

        $results = $query->latest('admin_requested_at')->get();
        //return response()->json(["data" => $results->approver], 200);
        return response()->json(["data" => $results], 200);
    }

    public function approve(Request $request, User $user)
    {
        $this->authorize('approve', $user);

        $user->update([
            'admin_status' => User::STATUS_APPROVED,
            'approved_by_id' => auth()->id(),
            'is_admin' => true,
        ]);

        return response()->json([
            'message' => 'Usuário aprovado com sucesso!',
            'data' => $user
        ], 200);
    }

    public function reject(Request $request, User $user)
    {
        $this->authorize('approve', $user);

        $user->update([
            'admin_status' => User::STATUS_REJECTED,
            'approved_by_id' => auth()->id(),
        ]);

        return response()->json([
            'message' => 'Usuário rejeitado com sucesso!',
            'data' => $user
        ], 200);
    }
}
