<?php

namespace Tests\Feature\Console\Mail;

use App\Enums\UserCategory;
use App\Enums\UserType;
use App\Mail\ProfessorLattesReminderMail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendLattesReminderEmailTest extends TestCase
{
    use RefreshDatabase;

    public function test_envia_email_para_professor_permanente(): void
    {
        Mail::fake();

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::PERMANENTE,
            'email'    => 'prof@example.com',
        ]);

        $this->artisan('mail:send-lattes-reminder');

        Mail::assertSent(ProfessorLattesReminderMail::class, 1);
    }

    public function test_nao_envia_para_professor_colaborador(): void
    {
        Mail::fake();

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::COLABORADOR,
            'email'    => 'colab@example.com',
        ]);

        $this->artisan('mail:send-lattes-reminder');

        Mail::assertNothingSent();
    }

    public function test_nao_envia_para_professor_sem_email(): void
    {
        Mail::fake();

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::PERMANENTE,
            'email'    => null,
        ]);

        $this->artisan('mail:send-lattes-reminder');

        Mail::assertNothingSent();
    }

    public function test_envia_somente_para_elegiveis_em_lista_mista(): void
    {
        Mail::fake();

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::PERMANENTE,
            'email'    => 'perm1@example.com',
        ]);

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::PERMANENTE,
            'email'    => 'perm2@example.com',
        ]);

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::COLABORADOR,
            'email'    => 'colab@example.com',
        ]);

        User::factory()->create([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::PERMANENTE,
            'email'    => null,
        ]);

        $this->artisan('mail:send-lattes-reminder');

        Mail::assertSent(ProfessorLattesReminderMail::class, 2);
    }

    public function test_comando_retorna_codigo_zero_sem_professores(): void
    {
        Mail::fake();

        $this->artisan('mail:send-lattes-reminder')
            ->assertExitCode(0);

        Mail::assertNothingSent();
    }
}
