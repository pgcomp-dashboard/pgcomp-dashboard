<?php

namespace Tests\Feature;

use App\Enums\UserType;
use App\Mail\AdminMail;
use App\Mail\RegistrationMail;
use App\Mail\StudentRegistrationVerificationMail;
use App\Models\Course;
use App\Models\Area;
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
        $email = 'student-'.uniqid().'@ufba.br';
        $secondaryEmail = 'student-alt-'.uniqid().'@example.com';

        $response = $this->postJson('/api/student-registration', [
            'name' => 'Estudante de Teste',
            'registration' => $registration,
            'email' => $email,
            'secondary_email' => $secondaryEmail,
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
        $this->assertSame($secondaryEmail, $student->secondaryEmail->email);
        $this->assertSame($email, $student->email);
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

    public function test_existing_student_can_request_verification_with_both_emails(): void
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
            'email' => 'student-'.uniqid().'@ufba.br',
            'secondary_email' => 'student-alt-'.uniqid().'@example.com',
        ])->assertOk();

        Mail::assertSent(
            StudentRegistrationVerificationMail::class,
            fn (StudentRegistrationVerificationMail $mail) =>
                str_contains($mail->verificationUrl, 'secondary_email=student-alt-'),
        );
    }

    public function test_confirming_existing_student_registration_returns_login_token(): void
    {
        $registration = random_int(100000000, 2147483647);
        $email = 'student-'.uniqid().'@ufba.br';
        $secondaryEmail = 'student-alt-'.uniqid().'@example.com';
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
            'secondary_email' => $secondaryEmail,
            'token' => $resetToken,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['token', 'name', 'role', 'type', 'is_approved']);
        $this->assertDatabaseHas('user_email', [
            'user_id' => $student->id,
            'email' => $secondaryEmail,
        ]);
        $this->withToken($response->json('token'))
            ->getJson('/api/portal/user')
            ->assertOk();
    }

    public function test_new_student_requires_ufba_and_alternative_emails(): void
    {
        $course = Course::firstOrCreate(['name' => 'Mestrado']);
        $advisor = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);

        $payload = [
            'name' => 'Discente sem emails válidos',
            'registration' => random_int(3000000000, 9000000000),
            'email' => 'discente@example.com',
            'secondary_email' => '',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'degree' => 'mestrado',
            'advisor_id' => $advisor->id,
        ];

        $this->postJson('/api/student-registration', $payload)
            ->assertUnprocessable()
            ->assertJsonCount(2, 'errors');

        $this->assertDatabaseMissing('users', [
            'registration' => $payload['registration'],
        ]);
    }

    public function test_student_can_complete_both_emails_from_profile(): void
    {
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'email' => 'legacy-'.uniqid().'@example.com',
        ]);
        $primaryEmail = 'discente-'.uniqid().'@ufba.br';
        $secondaryEmail = 'alternativo-'.uniqid().'@example.com';

        $this->actingAs($student)
            ->putJson('/api/portal/user', [
                'name' => $student->name,
                'email' => $primaryEmail,
                'secondary_email' => $secondaryEmail,
            ])
            ->assertOk()
            ->assertJsonPath('data.email', $primaryEmail)
            ->assertJsonPath('data.secondary_email', $secondaryEmail);

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'email' => $primaryEmail,
        ]);
        $this->assertDatabaseHas('user_email', [
            'user_id' => $student->id,
            'email' => $secondaryEmail,
        ]);
    }

    public function test_student_primary_email_cannot_match_another_users_secondary_email(): void
    {
        $owner = User::factory()->create(['type' => UserType::STUDENT]);
        $conflictingEmail = 'shared-'.uniqid().'@ufba.br';
        $owner->secondaryEmail()->create(['email' => $conflictingEmail]);
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'email' => 'current-'.uniqid().'@ufba.br',
        ]);
        $secondaryEmail = 'alternate-'.uniqid().'@example.com';

        $this->actingAs($student)
            ->putJson('/api/portal/user', [
                'name' => $student->name,
                'email' => $conflictingEmail,
                'secondary_email' => $secondaryEmail,
            ])
            ->assertUnprocessable()
            ->assertJsonFragment([
                'description' => 'Este e-mail já está cadastrado para outro usuário.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $student->id,
            'email' => $student->email,
        ]);
    }

    public function test_student_secondary_email_cannot_match_another_users_primary_email(): void
    {
        $owner = User::factory()->create([
            'type' => UserType::STUDENT,
            'email' => 'shared-'.uniqid().'@ufba.br',
        ]);
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'email' => 'current-'.uniqid().'@ufba.br',
        ]);

        $this->actingAs($student)
            ->putJson('/api/portal/user', [
                'name' => $student->name,
                'email' => $student->email,
                'secondary_email' => strtoupper($owner->email),
            ])
            ->assertUnprocessable()
            ->assertJsonFragment([
                'description' => 'Este e-mail já está cadastrado para outro usuário.',
            ]);

        $this->assertDatabaseMissing('user_email', [
            'user_id' => $student->id,
            'email' => strtolower($owner->email),
        ]);
    }

    public function test_student_can_keep_their_own_existing_emails_without_duplicate_validation_errors(): void
    {
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'email' => 'current-'.uniqid().'@ufba.br',
        ]);
        $secondaryEmail = 'alternate-'.uniqid().'@example.com';
        $student->secondaryEmail()->create(['email' => $secondaryEmail]);

        $this->actingAs($student)
            ->putJson('/api/portal/user', [
                'name' => $student->name,
                'email' => strtoupper($student->email),
                'secondary_email' => strtoupper($secondaryEmail),
            ])
            ->assertOk()
            ->assertJsonPath('data.email', strtolower($student->email))
            ->assertJsonPath('data.secondary_email', strtolower($secondaryEmail));
    }

    public function test_admin_user_listing_includes_student_secondary_email(): void
    {
        $admin = User::factory()->create([
            'type' => UserType::MANAGER,
            'is_admin' => true,
            'is_approved' => true,
        ]);
        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'email' => 'discente-'.uniqid().'@ufba.br',
        ]);
        $secondaryEmail = 'alternativo-'.uniqid().'@example.com';
        $student->secondaryEmail()->create(['email' => $secondaryEmail]);

        $this->actingAs($admin)
            ->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonFragment(['secondary_email' => $secondaryEmail]);
    }

    public function test_admin_student_registration_requires_both_emails(): void
    {
        $admin = User::factory()->create([
            'type' => UserType::MANAGER,
            'is_admin' => true,
            'is_approved' => true,
        ]);
        $course = Course::firstOrCreate(['name' => 'Mestrado']);
        $area = Area::create(['area' => 'Area teste '.uniqid()]);
        $registration = random_int(3000000000, 9000000000);
        $payload = [
            'name' => 'Discente cadastrado pela administração',
            'registration' => $registration,
            'email' => 'admin-discente-'.uniqid().'@ufba.br',
            'course_id' => $course->id,
            'area_id' => $area->id,
        ];

        $this->actingAs($admin)
            ->postJson('/api/admin/students', $payload)
            ->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['registration' => $registration]);

        $payload['secondary_email'] = 'alternativo-'.uniqid().'@example.com';
        $this->actingAs($admin)
            ->postJson('/api/admin/students', $payload)
            ->assertCreated()
            ->assertJsonPath('data.secondary_email', $payload['secondary_email']);
    }
}
