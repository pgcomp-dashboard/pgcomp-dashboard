<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('approver:id,name')->anyAdminRequest();

        if ($request->query('status') === 'pending') {
            $query->onlyPendingAdminRequest();
        }

        $results = $query->latest('admin_requested_at')->get();

        return response()->json(["data" => $results], 200);
    }

    public function update(Request $request, User $user)
{
    $this->authorize('approve', $user);

    // Validate that the status is either approved or rejected
    $validated = $request->validate([
        //'status' => 'required|in:' . User::STATUS_APPROVED . ',' . User::STATUS_REJECTED,
        'status' => ['required', Rule::in([User::STATUS_APPROVED, User::STATUS_REJECTED ])]
    ]);

    $isAdmin = $validated['status'] === User::STATUS_APPROVED;

    $user->update([
        'admin_status' => $validated['status'],
        'approved_by_id' => auth()->id(),
        'is_admin' => $isAdmin,
    ]);

    $message = $isAdmin ? 'Usuário aprovado!' : 'Usuário rejeitado!';

    return response()->json([
        'message' => $message,
        'data' => $user->load('approver:id,name')
    ], 200);
}
}
