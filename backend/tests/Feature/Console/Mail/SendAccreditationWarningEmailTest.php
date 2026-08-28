<?php

namespace Tests\Feature\Console\Mail;

use App\Enums\UserCategory;
use App\Enums\UserType;
use App\Mail\ProfessorAccreditationMail;
use App\Models\User;
use App\Services\Admin\AccreditationService;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SendAccreditationWarningEmailTest extends TestCase
{

    private function makeEntry(array $overrides = []): User
    {
        $user = User::factory()->make([
            'type'     => UserType::PROFESSOR,
            'category' => UserCategory::PERMANENTE->value,
            'email'    => fake()->unique()->safeEmail(),
        ]);

        $user->is_accredited = false;
        $user->reasons = ['Pontuação insuficiente'];

        foreach ($overrides as $key => $value) {
            $user->$key = $value;
        }

        return $user;
    }

    public function test_envia_email_para_professor_permanente_em_risco(): void
    {
        Mail::fake();

        $entry = $this->makeEntry();

        $this->mock(AccreditationService::class)
            ->shouldReceive('getAccreditationRanking')
            ->once()
            ->andReturn(collect([$entry]));

        $this->artisan('mail:send-accreditation-warning');

        Mail::assertSent(ProfessorAccreditationMail::class, 1);
    }

    public function test_nao_envia_para_professor_colaborador(): void
    {
        Mail::fake();

        $entry = $this->makeEntry(['category' => UserCategory::COLABORADOR->value]);

        $this->mock(AccreditationService::class)
            ->shouldReceive('getAccreditationRanking')
            ->once()
            ->andReturn(collect([$entry]));

        $this->artisan('mail:send-accreditation-warning');

        Mail::assertNothingSent();
    }

    public function test_nao_envia_para_professor_sem_email(): void
    {
        Mail::fake();

        $entry = $this->makeEntry(['email' => '']);

        $this->mock(AccreditationService::class)
            ->shouldReceive('getAccreditationRanking')
            ->once()
            ->andReturn(collect([$entry]));

        $this->artisan('mail:send-accreditation-warning');

        Mail::assertNothingSent();
    }

    public function test_nao_envia_para_professor_credenciado(): void
    {
        Mail::fake();

        $entry = $this->makeEntry(['is_accredited' => true]);

        $this->mock(AccreditationService::class)
            ->shouldReceive('getAccreditationRanking')
            ->once()
            ->andReturn(collect([$entry]));

        $this->artisan('mail:send-accreditation-warning');

        Mail::assertNothingSent();
    }

    public function test_envia_somente_para_elegiveis_em_lista_mista(): void
    {
        Mail::fake();

        $valid       = $this->makeEntry();
        $accredited  = $this->makeEntry(['is_accredited' => true]);
        $colaborador = $this->makeEntry(['category' => UserCategory::COLABORADOR->value]);
        $semEmail    = $this->makeEntry(['email' => '']);

        $this->mock(AccreditationService::class)
            ->shouldReceive('getAccreditationRanking')
            ->once()
            ->andReturn(collect([$valid, $accredited, $colaborador, $semEmail]));

        $this->artisan('mail:send-accreditation-warning');

        Mail::assertSent(ProfessorAccreditationMail::class, 1);
    }

    public function test_comando_retorna_codigo_zero(): void
    {
        Mail::fake();

        $this->mock(AccreditationService::class)
            ->shouldReceive('getAccreditationRanking')
            ->once()
            ->andReturn(collect([]));

        $this->artisan('mail:send-accreditation-warning')
            ->assertExitCode(0);
    }
}
