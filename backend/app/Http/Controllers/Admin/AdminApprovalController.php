<?php

namespace App\Http\Controllers\Admin;

use App\Mail\UserMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use App\Http\Requests\Admin\UpdateAdminApprovalRequest;
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

    public function update(UpdateAdminApprovalRequest $request, User $user)
    {
        //$this->authorize('approve', $user);
        $validated = $request->validated();

        if ($user->admin_status !== 'pending') {
            return response()->json(['message' => 'Pedido não está pendente.'], 400);
        }

        $result = $this->approvalService->approveOrReject($user, $validated['status'], auth()->id());
        Mail::to($user->email)->send(new UserMail($user, $validated['status']));

        return response()->json([
            'message' => $result['message'],
            'data' => $result['user']
        ], 200);
    }
}
