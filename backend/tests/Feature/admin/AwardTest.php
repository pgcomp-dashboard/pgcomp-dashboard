<?php

namespace Tests\Feature\Admin;

use App\Models\Award;
use App\Models\AwardCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AwardTest extends TestCase
{
    use RefreshDatabase;

    private const JSON = ['Accept' => 'application/json'];

    private function admin(): User
    {
        return User::factory()->admin()->create(['is_approved' => true]);
    }

    private function member(): User
    {
        return User::factory()->create(['is_approved' => true]);
    }

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'winners' => [['name' => 'Ana Souza', 'recipient_type' => 'student']],
            'year' => 2024,
            'scope' => 'national',
            'award_category_id' => AwardCategory::where('name', 'Best paper')->value('id'),
            'description' => 'Best paper em conferência nacional de engenharia de software.',
        ], $overrides);
    }

    /** Cria um prêmio já com os vencedores (um por vínculo informado). */
    private function awardWith(array $types, array $attributes = []): Award
    {
        $award = Award::factory()->create($attributes);
        foreach ($types as $i => $type) {
            $award->winners()->create(['name' => "Pessoa {$i}", 'recipient_type' => $type]);
        }

        return $award;
    }

    // ── Categorias (admin) ────────────────────────────────────────────────────

    public function test_categories_come_seeded_by_the_migration(): void
    {
        $this->assertSame(42, AwardCategory::count());

        $response = $this->actingAs($this->admin())->getJson('/api/admin/award-categories');

        $response->assertOk()->assertJsonCount(42, 'data');
        $names = collect($response->json('data'))->pluck('name');
        $this->assertTrue($names->contains('Melhor dissertação de mestrado'));
        $this->assertTrue($names->contains('Keynote Speaker'));
    }

    public function test_category_crud_and_unique_name(): void
    {
        $admin = $this->admin();

        $created = $this->actingAs($admin)
            ->postJson('/api/admin/award-categories', ['name' => 'Melhor Artigo'])
            ->assertCreated();
        $id = $created->json('data.id');

        $this->actingAs($admin)
            ->postJson('/api/admin/award-categories', ['name' => 'Melhor Artigo'])
            ->assertStatus(422);

        $this->actingAs($admin)
            ->putJson("/api/admin/award-categories/{$id}", ['name' => 'Melhor Artigo Curto'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Melhor Artigo Curto');

        $this->actingAs($admin)
            ->deleteJson("/api/admin/award-categories/{$id}")
            ->assertOk();
        $this->assertDatabaseMissing('award_categories', ['id' => $id]);
    }

    public function test_cannot_delete_category_with_awards(): void
    {
        $award = Award::factory()->create();

        $this->actingAs($this->admin())
            ->deleteJson("/api/admin/award-categories/{$award->award_category_id}")
            ->assertStatus(409);

        $this->assertDatabaseHas('award_categories', ['id' => $award->award_category_id]);
    }

    public function test_regular_user_cannot_manage_categories_nor_use_admin_endpoints(): void
    {
        $user = $this->member();

        $this->actingAs($user)->getJson('/api/admin/award-categories')->assertForbidden();
        $this->actingAs($user)->postJson('/api/admin/award-categories', ['name' => 'X Y'])->assertForbidden();
        $this->actingAs($user)->getJson('/api/admin/awards')->assertForbidden();
        $this->actingAs($user)->getJson('/api/admin/awards-dashboard')->assertForbidden();
    }

    // ── Portal: prêmios do próprio usuário ────────────────────────────────────

    public function test_user_can_read_categories_from_portal(): void
    {
        $this->actingAs($this->member())
            ->getJson('/api/portal/award-categories')
            ->assertOk()
            ->assertJsonCount(42, 'data');
    }

    public function test_user_registers_award_with_attachment_and_becomes_owner(): void
    {
        Storage::fake();
        $user = $this->member();

        $response = $this->actingAs($user)->post(
            '/api/portal/awards',
            $this->payload([
                'url' => 'https://example.org/premio',
                'attachment' => UploadedFile::fake()->create('certificado.pdf', 200, 'application/pdf'),
            ]),
            self::JSON,
        );

        $response->assertCreated()
            ->assertJsonPath('data.winners.0.name', 'Ana Souza')
            ->assertJsonPath('data.winners.0.recipient_type', 'student')
            ->assertJsonPath('data.attachment_name', 'certificado.pdf')
            ->assertJsonPath('data.category_name', 'Best paper')
            ->assertJsonPath('data.submitted_by.id', $user->id);

        $award = Award::firstOrFail();
        $this->assertSame($user->id, $award->user_id);
        Storage::assertExists($award->attachment_path);
    }

    public function test_award_can_have_several_winners_with_their_own_role(): void
    {
        $user = $this->member();

        $response = $this->actingAs($user)->postJson('/api/portal/awards', $this->payload([
            'winners' => [
                ['name' => 'Profa. Carla Mendes', 'recipient_type' => 'professor'],
                ['name' => 'Bruno Lima', 'recipient_type' => 'student'],
                ['name' => 'Helena Duarte', 'recipient_type' => 'staff'],
            ],
        ]))->assertCreated();

        $response->assertJsonCount(3, 'data.winners')
            ->assertJsonPath('data.winners.0.name', 'Profa. Carla Mendes')
            ->assertJsonPath('data.winners.0.recipient_type', 'professor')
            ->assertJsonPath('data.winners.1.recipient_type', 'student')
            ->assertJsonPath('data.winners.2.recipient_type', 'staff');
        $this->assertDatabaseCount('award_winners', 3);

        // Editar troca a lista inteira de vencedores.
        $award = Award::firstOrFail();
        $this->actingAs($user)->postJson("/api/portal/awards/{$award->id}", $this->payload([
            'winners' => [['name' => 'Só Bruno Lima', 'recipient_type' => 'student']],
        ]))->assertOk()->assertJsonCount(1, 'data.winners');
        $this->assertDatabaseCount('award_winners', 1);

        // Excluir o prêmio leva os vencedores junto.
        $this->actingAs($user)->deleteJson("/api/portal/awards/{$award->id}")->assertOk();
        $this->assertDatabaseCount('award_winners', 0);
    }

    public function test_winners_are_validated(): void
    {
        $user = $this->member();

        foreach ([
            [],
            [['name' => '', 'recipient_type' => 'student']],
            [['name' => 'Ana Souza', 'recipient_type' => 'alien']],
            [['name' => 'Ana Souza']],
        ] as $winners) {
            $this->actingAs($user)->postJson('/api/portal/awards', $this->payload(['winners' => $winners]))
                ->assertStatus(422);
        }

        $this->assertDatabaseCount('awards', 0);
    }

    public function test_user_lists_only_own_awards(): void
    {
        $me = $this->member();
        $other = $this->member();
        Award::factory()->count(2)->create(['user_id' => $me->id]);
        Award::factory()->create(['user_id' => $other->id]);

        $this->actingAs($me)->getJson('/api/portal/awards')
            ->assertOk()
            ->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_touch_awards_of_other_users(): void
    {
        Storage::fake();
        $owner = $this->member();
        $intruder = $this->member();
        $path = UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')->store('award-attachments');
        $award = Award::factory()->create([
            'user_id' => $owner->id,
            'attachment_path' => $path,
            'attachment_name' => 'a.pdf',
        ]);

        $this->actingAs($intruder)->post("/api/portal/awards/{$award->id}", $this->payload(), self::JSON)
            ->assertForbidden();
        $this->actingAs($intruder)->deleteJson("/api/portal/awards/{$award->id}")->assertForbidden();
        $this->actingAs($intruder)->get("/api/portal/awards/{$award->id}/attachment", self::JSON)->assertForbidden();

        $this->assertDatabaseHas('awards', ['id' => $award->id]);
        Storage::assertExists($path);
    }

    public function test_unapproved_user_cannot_use_portal_awards(): void
    {
        $pending = User::factory()->create(['is_approved' => false]);

        $this->actingAs($pending)->getJson('/api/portal/awards')->assertStatus(403);
    }

    public function test_store_validates_required_fields_and_attachment(): void
    {
        Storage::fake();
        $user = $this->member();

        // O Handler do projeto devolve os erros como lista de {description}.
        $empty = $this->actingAs($user)->postJson('/api/portal/awards', [])->assertStatus(422);
        $this->assertCount(5, $empty->json('errors'));

        $this->actingAs($user)->post(
            '/api/portal/awards',
            $this->payload([
                'attachment' => UploadedFile::fake()->create('virus.exe', 10, 'application/x-msdownload'),
            ]),
            self::JSON,
        )->assertStatus(422);

        $this->actingAs($user)->post(
            '/api/portal/awards',
            $this->payload([
                'attachment' => UploadedFile::fake()->create('grande.pdf', 10241, 'application/pdf'),
            ]),
            self::JSON,
        )->assertStatus(422);

        $this->assertDatabaseCount('awards', 0);
    }

    public function test_owner_updates_replaces_and_removes_attachment_then_deletes(): void
    {
        Storage::fake();
        $user = $this->member();

        $this->actingAs($user)->post('/api/portal/awards', $this->payload([
            'attachment' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf'),
        ]), self::JSON)->assertCreated();
        $award = Award::firstOrFail();
        $oldPath = $award->attachment_path;

        $this->actingAs($user)->post("/api/portal/awards/{$award->id}", $this->payload([
            'winners' => [
                ['name' => 'Ana Souza', 'recipient_type' => 'student'],
                ['name' => 'Bruno Lima', 'recipient_type' => 'student'],
            ],
            'attachment' => UploadedFile::fake()->image('foto.png'),
        ]), self::JSON)
            ->assertOk()
            ->assertJsonCount(2, 'data.winners')
            ->assertJsonPath('data.attachment_name', 'foto.png');

        Storage::assertMissing($oldPath);
        $award->refresh();
        Storage::assertExists($award->attachment_path);

        $this->actingAs($user)->get("/api/portal/awards/{$award->id}/attachment", self::JSON)
            ->assertOk()
            ->assertDownload('foto.png');

        $this->actingAs($user)->post("/api/portal/awards/{$award->id}", $this->payload([
            'remove_attachment' => true,
        ]), self::JSON)
            ->assertOk()
            ->assertJsonPath('data.attachment_name', null);
        $this->assertNull($award->fresh()->attachment_path);

        $this->actingAs($user)->deleteJson("/api/portal/awards/{$award->id}")->assertOk();
        $this->assertDatabaseMissing('awards', ['id' => $award->id]);
    }

    public function test_download_returns_404_when_award_has_no_attachment(): void
    {
        $user = $this->member();
        $award = Award::factory()->create(['user_id' => $user->id]);

        $this->actingAs($user)->get("/api/portal/awards/{$award->id}/attachment", self::JSON)->assertNotFound();
    }

    // ── Admin: visão geral, edição, exclusão e dashboard ──────────────────────

    public function test_admin_sees_all_awards_with_submitter_and_can_edit_and_delete(): void
    {
        Storage::fake();
        $admin = $this->admin();
        $owner = $this->member();
        $path = UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')->store('award-attachments');
        $award = Award::factory()->create([
            'user_id' => $owner->id,
            'attachment_path' => $path,
            'attachment_name' => 'a.pdf',
        ]);
        Award::factory()->create(['user_id' => $this->member()->id]);

        $this->actingAs($admin)->getJson('/api/admin/awards')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $owner->id, 'name' => $owner->name, 'email' => $owner->email]);

        $this->actingAs($admin)->post("/api/admin/awards/{$award->id}", $this->payload([
            'winners' => [['name' => 'Nome Corrigido pela Coordenação', 'recipient_type' => 'professor']],
        ]), self::JSON)->assertOk()->assertJsonPath('data.winners.0.name', 'Nome Corrigido pela Coordenação');
        // A edição da coordenação não muda o dono.
        $this->assertSame($owner->id, $award->fresh()->user_id);

        $this->actingAs($admin)->get("/api/admin/awards/{$award->id}/attachment", self::JSON)
            ->assertOk()->assertDownload('a.pdf');

        $this->actingAs($admin)->deleteJson("/api/admin/awards/{$award->id}")->assertOk();
        Storage::assertMissing($path);
        $this->assertDatabaseMissing('awards', ['id' => $award->id]);
    }

    public function test_dashboard_counts_each_person_even_when_they_share_the_same_role(): void
    {
        // Um único prêmio com 2 docentes e 1 discente: 1 prêmio, 3 pessoas.
        $this->awardWith(['professor', 'professor', 'student'], ['year' => 2025, 'scope' => 'national']);

        $this->actingAs($this->admin())->getJson('/api/admin/awards-dashboard')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonPath('by_recipient_type.professor', 2)
            ->assertJsonPath('by_recipient_type.student', 1)
            ->assertJsonPath('by_recipient_type.staff', 0)
            ->assertJsonPath('by_scope.national', 1);
    }

    public function test_dashboard_summary_filters_by_year(): void
    {
        $admin = $this->admin();
        $this->awardWith(['professor'], ['year' => 2023, 'scope' => 'international']);
        $this->awardWith(['student'], ['year' => 2024, 'scope' => 'national']);
        // Um prêmio com duas pessoas conta as duas no vínculo de cada uma.
        $this->awardWith(['student', 'professor'], ['year' => 2024, 'scope' => 'national']);
        $this->awardWith(['staff'], ['year' => 2024, 'scope' => 'national']);

        $all = $this->actingAs($admin)->getJson('/api/admin/awards-dashboard')->assertOk();
        $all->assertJsonPath('total', 4)
            ->assertJsonPath('years', [2024, 2023])
            ->assertJsonPath('by_recipient_type.student', 2)
            ->assertJsonPath('by_recipient_type.professor', 2)
            ->assertJsonPath('by_scope.international', 1);

        $filtered = $this->actingAs($admin)->getJson('/api/admin/awards-dashboard?year=2024')->assertOk();
        $filtered->assertJsonPath('total', 3)
            ->assertJsonPath('by_recipient_type.professor', 1)
            ->assertJsonPath('by_recipient_type.student', 2)
            ->assertJsonPath('by_recipient_type.staff', 1)
            ->assertJsonPath('by_scope.international', 0);
        // A evolução por ano ignora o filtro.
        $this->assertCount(2, $filtered->json('per_year'));
        $this->assertSame(3, collect($filtered->json('per_category'))->sum('total'));
    }
}
