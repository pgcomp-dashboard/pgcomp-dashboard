<?php

namespace Tests\Feature\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Formato dos erros que o front usa para mostrar onde corrigir:
 * 422 com o campo de origem, 404 em vez de 500, 401 com mensagem de sessão expirada.
 */
class DefenseRequestErrorResponseTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/portal/defense-requests';

    private function studentWithAdvisor(): User
    {
        $advisor = User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR]);
        $student = User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT]);
        $advisor->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        return $student;
    }

    private function answers(): array
    {
        $data = [];
        foreach (DefenseRequestForms::get('masters_qualification')['fields'] as $f) {
            if ($f['type'] === 'confirm') {
                continue;
            }
            $data[$f['key']] = match ($f['type']) {
                'text', 'textarea' => "Valor {$f['key']}",
                'date' => now()->addMonth()->format('Y-m-d'),
                'time' => '10:00',
                'member' => ['name' => "Pessoa {$f['key']}", 'affiliation' => 'UFPE', 'lattes' => 'http://lattes.cnpq.br/'.crc32($f['key'])],
            };
        }

        return $data;
    }

    public function test_validation_errors_carry_the_field(): void
    {
        $data = $this->answers();
        $data['title'] = '';
        $data['member_1']['lattes'] = 'nao-e-link';

        $this->actingAs($this->studentWithAdvisor())
            ->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $data])
            ->assertStatus(422)
            ->assertJsonFragment(['field' => 'data.title'])
            ->assertJsonFragment(['field' => 'data.member_1.lattes']);
    }

    public function test_duplicate_points_to_the_type(): void
    {
        $student = $this->studentWithAdvisor();
        $body = ['type' => 'masters_qualification', 'data' => $this->answers()];
        $this->actingAs($student)->postJson(self::URL, $body)->assertCreated();

        $response = $this->actingAs($student)->postJson(self::URL, $body)->assertStatus(422);
        $this->assertSame('type', $response->json('errors.0.field'));
        $this->assertStringContainsString('em andamento', $response->json('errors.0.description'));
    }

    public function test_missing_request_is_404_with_a_useful_message(): void
    {
        $this->actingAs($this->studentWithAdvisor())
            ->putJson(self::URL.'/999999', [])
            ->assertNotFound()
            ->assertJsonPath('errors.0.description', 'Registro não encontrado. Ele pode ter sido removido; atualize a página.');
    }

    public function test_expired_session_says_so(): void
    {
        $this->getJson(self::URL)
            ->assertUnauthorized()
            ->assertJsonPath('errors.0.description', 'Sua sessão expirou. Entre novamente para continuar.');
    }
}
