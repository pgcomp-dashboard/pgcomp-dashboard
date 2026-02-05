<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminRequestController extends Controller
{
    public function getStatus(){
        $user = auth()->user();

        return response()->json(['data' => $user->admin_status], 200);
    }
    public function store(Request $request)
    {
        $user = auth()->user();

        // Validar se o usuário já tem uma solicitação ou já é admin
        if ($user->admin_status === 'pending') {
            return response()->json(['message' => 'Você já tem uma solicitação pendente.'], 422);
        }

        if ($user->is_admin) {
            return response()->json(['message' => 'Você já possui privilégios de administrador.'], 400);
        }

        // Atualizar o Model User
        $user->update([
            'admin_status' => 'pending',
            'admin_requested_at' => now(),
            'approved_by_id' => null,
        ]);

        // Notificar Admins existentes
        // Notification::send($admins, new NewAdminRequest($user));

        return response()->json([
            'message' => 'Solicitação enviada com sucesso! Aguarde a aprovação.',
            'status' => 'pending'
        ], 201);
    }
}
