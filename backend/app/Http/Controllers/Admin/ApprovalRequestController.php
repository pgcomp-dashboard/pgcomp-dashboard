<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ApprovalRequestController extends Controller
{
    /**
     * List all pending requests (Registration and Admin).
     */
    public function index(): JsonResponse
    {
        $registrations = User::where('is_approved', false)
            ->where('type', UserType::PROFESSOR)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type,
                    'request_type' => 'registration',
                    'created_at' => $user->created_at,
                ];
            });

        $adminRequests = User::where('admin_status', 'pending')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'type' => $user->type,
                    'request_type' => 'admin',
                    'created_at' => $user->created_at,
                ];
            });

        return response()->json([
            'data' => $registrations->concat($adminRequests)
        ]);
    }

    /**
     * Approve a request.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $requestType = $request->input('request_type');

        if ($requestType === 'registration') {
            $user->is_approved = true;
            $user->save();
        } elseif ($requestType === 'admin') {
            $user->is_admin = true;
            $user->admin_status = 'approved';
            $user->save();
        }

        return response()->json([
            'message' => 'Solicitação aprovada com sucesso!',
            'data' => $user
        ]);
    }

    /**
     * Reject a request.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $requestType = $request->input('request_type');

        if ($requestType === 'registration') {
            // Delete user if registration is rejected
            $user->delete();
            return response()->json(['message' => 'Cadastro rejeitado e usuário removido.']);
        } elseif ($requestType === 'admin') {
            // Set as rejected if admin request is rejected
            $user->admin_status = 'rejected';
            $user->save();
            return response()->json(['message' => 'Solicitação de admin rejeitada.', 'data' => $user]);
        }

        return response()->json(['message' => 'Tipo de solicitação inválido.'], 400);
    }
}
