<?php

namespace Tests\Feature;

use App\Enums\UserType;
use App\Mail\AdminMail;
use App\Mail\RegistrationMail;
use App\Mail\StudentRegistrationVerificationMail;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class StudentRegistrationAccessTest extends TestCase
{
    public function test_student_registration_does_not_require_admin_approval(): void
    {
        Mail::fake();
        $course = Course::firstOrCreate(['name' => 'Mestrado']);
        $advisor = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);
        $registration = random_int(3000000000, 9000000000);

        $response = $this->postJson('/api/student-registration', [
            'name' => 'Estudante de Teste',
            'registration' => $registration,
            'email' => 'student-'.uniqid().'@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'degree' => 'mestrado',
            'advisor_id' => $advisor->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath(
                'message',
                'Cadastro realizado com sucesso. Você já pode acessar o sistema.',
            )
            ->assertJsonStructure(['token', 'name', 'role', 'type', 'is_approved']);

        $student = User::where('registration', $registration)->firstOrFail();
        $this->assertTrue($student->is_approved);
        $this->assertSame($course->id, $student->course_id);
        $this->assertTrue($student->advisors->contains($advisor));
        $this->withToken($response->json('token'))
            ->getJson('/api/portal/user')
            ->assertOk();
        Mail::assertSent(RegistrationMail::class, fn (RegistrationMail $mail) => $mail->status === 'self_registered');
        Mail::assertNotSent(AdminMail::class);
    }

    public function test_unapproved_students_can_access_portal_but_unapproved_professors_cannot(): void
    {
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'is_approved' => false,
        ]);
        $this->actingAs($student)
            ->getJson('/api/portal/user')
            ->assertOk();

        $professor = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => false,
        ]);
        $this->actingAs($professor)
            ->getJson('/api/portal/user')
            ->assertForbidden();
    }

    public function test_existing_student_can_request_verification_with_a_non_ufba_email(): void
    {
        Mail::fake();
        $registration = random_int(100000000, 2147483647);
        User::factory()->create([
            'type' => UserType::STUDENT,
            'registration' => $registration,
            'email' => null,
        ]);

        $this->postJson('/api/student-registration/request', [
            'registration' => (string) $registration,
            'email' => 'student-'.uniqid().'@example.com',
        ])->assertOk();

        Mail::assertSent(StudentRegistrationVerificationMail::class);
    }

    public function test_confirming_existing_student_registration_returns_login_token(): void
    {
        $registration = random_int(100000000, 2147483647);
        $email = 'student-'.uniqid().'@example.com';
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'registration' => $registration,
            'email' => $email,
            'is_approved' => false,
        ]);
        $resetToken = Password::broker()->createToken($student);

        $response = $this->postJson('/api/student-registration/confirm', [
            'registration' => (string) $registration,
            'email' => $email,
            'token' => $resetToken,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'name', 'role', 'type', 'is_approved']);
        $this->withToken($response->json('token'))
            ->getJson('/api/portal/user')
            ->assertOk();
    }
}
