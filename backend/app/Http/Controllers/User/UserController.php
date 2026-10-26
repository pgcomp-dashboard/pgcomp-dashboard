<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateSelfRequest;
use App\Mail\StudentRegistrationVerificationMail;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Mail\RegistrationMail;
use App\Models\Course;
use App\Models\User;
use App\Services\ProductionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rule;

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
            'email' => ['required', 'email:rfc'],
        ]);

        $user = User::where('registration', trim((string) $validated['registration']))
            ->where('type', UserType::STUDENT)
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'Matrícula não encontrada no sistema.',
            ], 404);
        }

        $email = strtolower(trim($validated['email']));

        $existingUser = User::whereRaw('LOWER(email) = ?', [$email])
            ->whereKeyNot($user->getKey())
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

    public function studentRegistrationOptions()
    {
        return response()->json([
            'advisors' => User::query()
                ->where('type', UserType::PROFESSOR)
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function registerStudent(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'registration' => ['required', 'integer', 'min:1', Rule::unique('users', 'registration')],
            'email' => ['required', 'string', 'email:rfc'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'degree' => ['required', Rule::in(['mestrado', 'doutorado'])],
            'advisor_id' => ['required', Rule::exists('users', 'id')->where('type', UserType::PROFESSOR->value)],
        ]);

        $email = strtolower(trim($validated['email']));
        if (User::whereRaw('LOWER(email) = ?', [$email])->exists()) {
            return response()->json([
                'message' => 'Este e-mail já está cadastrado.',
            ], 422);
        }

        $courseName = $validated['degree'] === 'mestrado' ? 'Mestrado' : 'Doutorado';
        $course = Course::where('name', $courseName)->first();
        if (! $course) {
            return response()->json([
                'message' => "O curso de {$courseName} não está configurado no sistema.",
            ], 422);
        }

        $user = DB::transaction(function () use ($validated, $email, $course) {
            $user = User::create([
                'name' => $validated['name'],
                'registration' => $validated['registration'],
                'email' => $email,
                'password' => Hash::make($validated['password']),
                'type' => UserType::STUDENT,
                'course_id' => $course->id,
            ]);
            $user->is_approved = true;
            $user->save();
            $user->advisors()->attach($validated['advisor_id'], [
                'relation_type' => UserRelationType::ADVISOR->value,
            ]);

            return $user;
        });

        Mail::to($user->email)->send(new RegistrationMail($user, 'self_registered'));

        return $this->studentRegistrationResponse(
            $user,
            'Cadastro realizado com sucesso. Você já pode acessar o sistema.',
            201,
        );
    }

    public function confirmStudentRegistration(Request $request)
    {
        $validated = $request->validate([
            'registration' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email:rfc'],
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

        return $this->studentRegistrationResponse(
            $user,
            'Cadastro confirmado com sucesso.',
        );
    }

    private function studentRegistrationResponse(User $user, string $message, int $status = 200)
    {
        return response()->json([
            'message' => $message,
            'token' => $user->createToken('login')->plainTextToken,
            'name' => $user->name,
            'role' => $user->is_admin ? 'admin' : 'basic',
            'type' => $user->type->value,
            'is_approved' => $user->is_approved,
        ], $status);
    }
}
