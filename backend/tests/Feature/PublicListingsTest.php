<?php

namespace Tests\Feature;

use App\Models\Award;
use App\Models\InternationalizationAction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicListingsTest extends TestCase
{
    use RefreshDatabase;

    private function awardWithWinners(array $attributes, array $winners): Award
    {
        $award = Award::factory()->create($attributes);
        foreach ($winners as $name => $type) {
            $award->winners()->create(['name' => $name, 'recipient_type' => $type]);
        }

        return $award;
    }

    public function test_guest_can_list_awards_newest_first_with_winners(): void
    {
        $this->awardWithWinners(['year' => 2023, 'scope' => 'national', 'url' => 'https://example.org/a'], ['Ana Souza' => 'student']);
        $this->awardWithWinners(['year' => 2025, 'scope' => 'international'], ['Profa. Carla Mendes' => 'professor', 'Bruno Lima' => 'student']);

        $response = $this->getJson('/api/public/awards')->assertOk()->assertJsonCount(2, 'data');

        $this->assertSame([2025, 2023], collect($response->json('data'))->pluck('year')->all());
        $response->assertJsonPath('data.0.scope', 'international')
            ->assertJsonPath('data.0.winners.0.name', 'Profa. Carla Mendes')
            ->assertJsonPath('data.0.winners.0.recipient_type', 'professor')
            ->assertJsonPath('data.0.winners.1.name', 'Bruno Lima')
            ->assertJsonPath('data.1.url', 'https://example.org/a');
        $this->assertNotEmpty($response->json('data.0.category_name'));
    }

    public function test_public_awards_never_expose_private_data(): void
    {
        $submitter = User::factory()->create(['email' => 'segredo@example.test', 'is_approved' => true]);
        $award = $this->awardWithWinners(
            ['user_id' => $submitter->id, 'attachment_path' => 'award-attachments/x.pdf', 'attachment_name' => 'x.pdf'],
            ['Ana Souza' => 'student'],
        );

        $body = $this->getJson('/api/public/awards')->assertOk()->getContent();

        $this->assertStringNotContainsString('segredo@example.test', $body);
        $this->assertStringNotContainsString($submitter->name, $body);
        $this->assertStringNotContainsString('x.pdf', $body);
        foreach (['submitted_by', 'user_id', 'attachment_name', 'attachment_path', 'email'] as $key) {
            $this->assertStringNotContainsString("\"{$key}\"", $body, "A chave {$key} não deveria ser pública");
        }
        $this->assertSame($award->id, json_decode($body, true)['data'][0]['id']);
    }

    public function test_guest_can_list_internationalization_actions_newest_first(): void
    {
        InternationalizationAction::factory()->create(['full_name' => 'Antiga', 'start_date' => '2023-02-01', 'end_date' => '2023-02-10']);
        InternationalizationAction::factory()->create([
            'full_name' => 'Recente', 'level' => 'student', 'course' => 'doctorate',
            'country' => 'Portugal', 'institution' => 'Universidade do Porto',
            'start_date' => '2025-03-01', 'end_date' => '2025-08-31',
        ]);

        $response = $this->getJson('/api/public/internationalization-actions')
            ->assertOk()->assertJsonCount(2, 'data');

        $this->assertSame(['Recente', 'Antiga'], collect($response->json('data'))->pluck('full_name')->all());
        $response->assertJsonPath('data.0.level', 'student')
            ->assertJsonPath('data.0.course', 'doctorate')
            ->assertJsonPath('data.0.country', 'Portugal')
            ->assertJsonPath('data.0.start_date', '2025-03-01')
            ->assertJsonPath('data.0.end_date', '2025-08-31');
    }

    public function test_public_internationalization_never_exposes_private_data(): void
    {
        $submitter = User::factory()->create(['email' => 'segredo@example.test', 'is_approved' => true]);
        $action = InternationalizationAction::factory()->create([
            'user_id' => $submitter->id,
            'registration_number' => '987654321',
            'advisor_name' => 'Orientador Secreto',
            'foreign_researcher' => 'Pesquisador Exterior',
        ]);
        $action->files()->create(['slot' => 'document', 'path' => 'internationalization-files/c.pdf', 'name' => 'comprovante-privado.pdf']);

        $body = $this->getJson('/api/public/internationalization-actions')->assertOk()->getContent();

        foreach (['segredo@example.test', $submitter->name, '987654321', 'Orientador Secreto', 'comprovante-privado.pdf'] as $secret) {
            $this->assertStringNotContainsString($secret, $body);
        }
        foreach (['registration_number', 'advisor_name', 'lattes_status', 'files', 'submitted_by', 'user_id', 'email'] as $key) {
            $this->assertStringNotContainsString("\"{$key}\"", $body, "A chave {$key} não deveria ser pública");
        }
    }

    public function test_public_endpoints_are_read_only(): void
    {
        // O Handler global do projeto devolve 500 para método não permitido; o que importa é não aceitar.
        $this->assertFalse($this->postJson('/api/public/awards', [])->isSuccessful());
        $this->assertFalse($this->deleteJson('/api/public/internationalization-actions')->isSuccessful());
        $this->assertDatabaseCount('awards', 0);
    }
}
