<?php

namespace App\Http\Controllers\Admin;

use App\Mail\RegistrationMail;
use App\Mail\UserMail;
use Illuminate\Support\Facades\Mail;
use App\Enums\UserType;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

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

        $studentRegistrations = User::whereNotNull('registration_requested_at')
            ->where('type', UserType::STUDENT)
            ->with('advisors:id,name')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'registration' => $user->registration,
                    'advisor' => $user->advisors->first()?->name,
                    'type' => $user->type,
                    'request_type' => 'registration',
                    'created_at' => $user->registration_requested_at,
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
            'data' => $registrations->concat($studentRegistrations)->concat($adminRequests)
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
            $user->registration_requested_at = null;
            $user->save();
            Mail::to($user->email)->send(new RegistrationMail($user, 'approved'));
        } elseif ($requestType === 'admin') {
            $user->is_admin = true;
            $user->admin_status = 'approved';
            $user->save();
            Mail::to($user->email)->send(new UserMail($user, 'approved'));
        }

        return response()->json([
            'message' => 'Solicitação aprovada com sucesso!',
            'data' => $user
        ]);
    }

    /**
     * Approve multiple pending requests in one request.
     */
    public function approveMany(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'requests' => ['required', 'array', 'min:1'],
            'requests.*.id' => ['required', 'integer'],
            'requests.*.request_type' => ['required', 'in:registration,admin'],
        ]);

        $approvedRequests = DB::transaction(function () use ($validated) {
            $requests = [];

            foreach ($validated['requests'] as $requestData) {
                $user = User::query()
                    ->lockForUpdate()
                    ->find($requestData['id']);

                $isPending = $user && match ($requestData['request_type']) {
                    'registration' => $user->type === UserType::PROFESSOR
                        ? !$user->is_approved
                        : ($user->type === UserType::STUDENT
                            && $user->registration_requested_at !== null),
                    'admin' => $user->admin_status === 'pending',
                };

                if (!$isPending) {
                    throw ValidationException::withMessages([
                        'requests' => [
                            "A solicitação {$requestData['id']} não está mais pendente ou não existe.",
                        ],
                    ]);
                }

                $requests[] = [$user, $requestData['request_type']];
            }

            foreach ($requests as [$user, $requestType]) {
                if ($requestType === 'registration') {
                    $user->is_approved = true;
                    $user->registration_requested_at = null;
                } else {
                    $user->is_admin = true;
                    $user->admin_status = 'approved';
                }

                $user->save();
            }

            return $requests;
        });

        foreach ($approvedRequests as [$user, $requestType]) {
            if ($requestType === 'registration') {
                Mail::to($user->email)->send(new RegistrationMail($user, 'approved'));
            } else {
                Mail::to($user->email)->send(new UserMail($user, 'approved'));
            }
        }

        return response()->json([
            'message' => count($approvedRequests).' solicitações aprovadas com sucesso!',
            'data' => ['approved' => count($approvedRequests)],
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
            Mail::to($user->email)->send(new RegistrationMail($user, 'rejected'));
            $user->advisors()->detach();
            $user->coadvisors()->detach();
            $user->delete();
            return response()->json(['message' => 'Cadastro rejeitado e usuário removido.']);
        } elseif ($requestType === 'admin') {
            $user->admin_status = 'rejected';
            $user->save();
            Mail::to($user->email)->send(new UserMail($user, 'rejected'));
            return response()->json(['message' => 'Solicitação de admin rejeitada.', 'data' => $user]);
        }

        return response()->json(['message' => 'Tipo de solicitação inválido.'], 400);
    }
}
