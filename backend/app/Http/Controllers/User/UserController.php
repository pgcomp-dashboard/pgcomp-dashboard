<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateSelfRequest;
use App\Mail\StudentRegistrationVerificationMail;
use App\Models\User;
use App\Services\ProductionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

class UserController extends Controller
{
    protected ProductionService $productionService;

    public function __construct(ProductionService $productionService)
    {
        $this->productionService = $productionService;
    }

    public function userInfo(Request $request)
    {
        $user = auth()->user();
        $user->loadCount('writerOf');

        return response()->json([
                'data' => $user
            ]);
    }

    public function updateUserInfo(UpdateSelfRequest $request)
    {
        $user = auth()->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Usuário atualizado com sucesso!',
            'data' => $user,
        ], 200);
    }

    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed'
        ]);

        $user = $request->user();

        $user->update([
            'password' => Hash::make($validated['password'])
            ]);

        return response()->json([
            'message' => 'Senha alterada com sucesso',
            ], 200);
    }

    public function requestStudentRegistration(Request $request)
    {
        $validated = $request->validate([
            'registration' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc,dns', 'ends_with:@ufba.br'],
        ]);

        $user = User::where('registration', trim((string) $validated['registration']))->first();

        if (! $user) {
            return response()->json([
                'message' => 'Matrícula não encontrada no sistema.',
            ], 404);
        }

        $email = strtolower(trim($validated['email']));

        $existingUser = User::whereRaw('LOWER(email) = ?', [$email])
            ->first();

        if ($existingUser) {
            return response()->json([
                'message' => 'Este e-mail já está cadastrado para outra matrícula.',
            ], 422);
        }

        $originalEmail = $user->email;

        $user->email = $email;
        Password::broker()->deleteToken($user);
        $token = Password::broker()->createToken($user);
        $user->email = $originalEmail;

        $verificationUrl = config('app.front_url') . '/student-set-password?' . http_build_query([
            'token' => $token,
            'email' => $email,
            'registration' => $user->registration,
        ]);

        Mail::to($email)->send(new StudentRegistrationVerificationMail($user, $verificationUrl));

        return response()->json([
            'message' => 'E-mail de confirmação enviado com sucesso.',
        ], 200);
    }

    public function confirmStudentRegistration(Request $request)
    {
        $validated = $request->validate([
            'registration' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc,dns', 'ends_with:@ufba.br'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::where('registration', trim((string) $validated['registration']))->first();

        if (! $user) {
            return response()->json([
                'message' => 'Matrícula não encontrada no sistema.',
            ], 404);
        }

        $email = strtolower(trim($validated['email']));
        $originalEmail = $user->email;

        $emailAlreadyUsedByAnotherUser = User::whereRaw('LOWER(email) = ?', [$email])
            ->whereKeyNot($user->getKey())
            ->exists();

        if ($emailAlreadyUsedByAnotherUser) {
            return response()->json([
                'message' => 'Este e-mail já está cadastrado para outra matrícula.',
            ], 422);
        }

        $user->email = $email;

        if (strtolower((string) $originalEmail) !== '' && strtolower((string) $originalEmail) !== $email) {
            $user->email = $originalEmail;
            return response()->json([
                'message' => 'Este e-mail não está associado a essa matrícula.',
            ], 422);
        }

        if (! Password::broker()->tokenExists($user, $validated['token'])) {
            $user->email = $originalEmail;
            return response()->json([
                'message' => 'Link de confirmação inválido ou expirado.',
            ], 422);
        }

        $user->forceFill([
            'email' => $email,
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
            'is_approved' => true,
        ])->save();

        Password::broker()->deleteToken($user);

        return response()->json([
            'message' => 'Cadastro confirmado com sucesso.',
        ], 200);
    }
}
