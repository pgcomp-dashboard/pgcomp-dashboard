<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AdminApprovalService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Services\Admin\AdminApprovalService;

class AdminApprovalController extends Controller
{
    private AdminApprovalService $approvalService;

    public function __construct(AdminApprovalService $approvalService)
    {
        $this->approvalService = $approvalService;
    }

    public function index(Request $request)
    {
        if ($request->query('status') === 'pending') {
            $results = $this->approvalService->listPending();
        } else {
            $results = $this->approvalService->listAll();
        }

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

        $result = $this->approvalService->approveOrReject($user, $validated['status'], auth()->id());

        return response()->json([
            'message' => $result['message'],
            'data' => $result['user']
        ], 200);
    }
}
