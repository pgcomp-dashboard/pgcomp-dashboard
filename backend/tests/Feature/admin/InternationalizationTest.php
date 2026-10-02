<?php

namespace Tests\Feature\Admin;

use App\Models\InternationalizationAction;
use App\Models\InternationalizationCategory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class InternationalizationTest extends TestCase
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
            'category_id' => InternationalizationCategory::where('name', 'Doutorado sanduíche')->value('id'),
            'full_name' => 'Ana Souza',
            'registration_number' => '2021123456',
            'level' => 'student',
            'course' => 'doctorate',
            'lattes_status' => 'registered',
            'advisor_name' => 'Profa. Carla Mendes',
            'country' => 'Portugal',
            'institution' => 'Universidade do Porto',
            'description' => 'Doutorado sanduíche de 6 meses na Universidade do Porto.',
            'start_date' => '2025-03-01',
            'end_date' => '2025-08-31',
        ], $overrides);
    }

    // ── Categorias ────────────────────────────────────────────────────────────

    public function test_categories_come_seeded_by_the_migration(): void
    {
        $this->assertSame(23, InternationalizationCategory::count());

        $names = collect(
            $this->actingAs($this->admin())->getJson('/api/admin/internationalization-categories')
                ->assertOk()->assertJsonCount(23, 'data')->json('data')
        )->pluck('name');

        $this->assertTrue($names->contains('Mestrado sanduíche'));
        $this->assertTrue($names->contains('Cooperação/parceria internacional'));
        $this->assertTrue($names->contains('Outro'));
    }

    public function test_category_crud_unique_name_and_blocked_delete(): void
    {
        $admin = $this->admin();

        $id = $this->actingAs($admin)
            ->postJson('/api/admin/internationalization-categories', ['name' => 'Dupla titulação'])
            ->assertCreated()->json('data.id');

        $this->actingAs($admin)
            ->postJson('/api/admin/internationalization-categories', ['name' => 'Dupla titulação'])
            ->assertStatus(422);

        $this->actingAs($admin)
            ->putJson("/api/admin/internationalization-categories/{$id}", ['name' => 'Dupla titulação (curso)'])
            ->assertOk()->assertJsonPath('data.name', 'Dupla titulação (curso)');

        $this->actingAs($admin)->deleteJson("/api/admin/internationalization-categories/{$id}")->assertOk();
        $this->assertDatabaseMissing('internationalization_categories', ['id' => $id]);

        $action = InternationalizationAction::factory()->create();
        $this->actingAs($admin)
            ->deleteJson("/api/admin/internationalization-categories/{$action->category_id}")
            ->assertStatus(409);
    }

    public function test_regular_user_cannot_use_admin_endpoints_but_can_read_categories(): void
    {
        $user = $this->member();

        $this->actingAs($user)->getJson('/api/admin/internationalization-categories')->assertForbidden();
        $this->actingAs($user)->postJson('/api/admin/internationalization-categories', ['name' => 'X Y'])->assertForbidden();
        $this->actingAs($user)->getJson('/api/admin/internationalization-actions')->assertForbidden();
        $this->actingAs($user)->getJson('/api/admin/internationalization-dashboard')->assertForbidden();

        $this->actingAs($user)->getJson('/api/portal/internationalization-categories')
            ->assertOk()->assertJsonCount(23, 'data');
    }

    // ── Portal: ações do próprio usuário ──────────────────────────────────────

    public function test_user_registers_action_with_document_and_photos(): void
    {
        Storage::fake();
        $user = $this->member();

        $response = $this->actingAs($user)->post('/api/portal/internationalization-actions', $this->payload([
            'url' => 'https://example.org/acao',
            'call_notice' => 'Edital CAPES PrInt 2025',
            'files' => [
                'document' => UploadedFile::fake()->create('comprovante.pdf', 500, 'application/pdf'),
                'photo_1' => UploadedFile::fake()->image('predio.jpg'),
                'photo_3' => UploadedFile::fake()->image('banner.png'),
            ],
        ]), self::JSON);

        $response->assertCreated()
            ->assertJsonPath('data.full_name', 'Ana Souza')
            ->assertJsonPath('data.level', 'student')
            ->assertJsonPath('data.category_name', 'Doutorado sanduíche')
            ->assertJsonPath('data.submitted_by.id', $user->id)
            ->assertJsonPath('data.files.document', 'comprovante.pdf')
            ->assertJsonPath('data.files.photo_1', 'predio.jpg')
            ->assertJsonPath('data.files.photo_2', null)
            ->assertJsonPath('data.files.photo_3', 'banner.png');

        $action = InternationalizationAction::firstOrFail();
        $this->assertSame($user->id, $action->user_id);
        $this->assertCount(3, $action->files);
        foreach ($action->files as $file) {
            Storage::assertExists($file->path);
        }
    }

    public function test_optional_fields_can_be_left_empty(): void
    {
        $this->actingAs($this->member())->postJson('/api/portal/internationalization-actions', [
            'category_id' => InternationalizationCategory::where('name', 'Outro')->value('id'),
            'full_name' => 'Fábio Torres',
            'registration_number' => '1234567',
            'level' => 'professor',
            'course' => 'professor',
            'lattes_status' => 'pending',
            'description' => 'Palestra convidada em congresso internacional.',
            'start_date' => '2026-05-10',
            'end_date' => '2026-05-10',
        ])->assertCreated()->assertJsonPath('data.country', null);
    }

    public function test_validation_rules(): void
    {
        Storage::fake();
        $user = $this->member();

        // Obrigatórios: categoria, nome, matrícula, nível, curso, lattes, descrição, início e fim = 9.
        $empty = $this->actingAs($user)->postJson('/api/portal/internationalization-actions', [])->assertStatus(422);
        $this->assertCount(9, $empty->json('errors'));

        $invalid = [
            'end before start' => ['start_date' => '2025-05-10', 'end_date' => '2025-05-01'],
            'bad level' => ['level' => 'alien'],
            'bad course' => ['course' => 'phd'],
            'bad lattes' => ['lattes_status' => 'maybe'],
            'bad url' => ['url' => 'not-a-url'],
            'short description' => ['description' => 'curta'],
            'document is not a pdf' => ['files' => ['document' => UploadedFile::fake()->image('a.png')]],
            'document over 1 MB' => ['files' => ['document' => UploadedFile::fake()->create('a.pdf', 1025, 'application/pdf')]],
            'photo is not an image' => ['files' => ['photo_1' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')]],
            'photo over 10 MB' => ['files' => ['photo_2' => UploadedFile::fake()->create('a.jpg', 10241, 'image/jpeg')]],
        ];
        foreach ($invalid as $case => $override) {
            $this->actingAs($user)->post('/api/portal/internationalization-actions', $this->payload($override), self::JSON)
                ->assertStatus(422, "esperava 422 para: {$case}");
        }

        $this->assertDatabaseCount('internationalization_actions', 0);
    }

    public function test_user_lists_only_own_actions(): void
    {
        $me = $this->member();
        InternationalizationAction::factory()->count(2)->create(['user_id' => $me->id]);
        InternationalizationAction::factory()->create(['user_id' => $this->member()->id]);

        $this->actingAs($me)->getJson('/api/portal/internationalization-actions')
            ->assertOk()->assertJsonCount(2, 'data');
    }

    public function test_user_cannot_touch_actions_of_other_users(): void
    {
        Storage::fake();
        $owner = $this->member();
        $intruder = $this->member();
        $action = InternationalizationAction::factory()->create(['user_id' => $owner->id]);
        $path = UploadedFile::fake()->create('a.pdf', 10, 'application/pdf')->store('internationalization-files');
        $action->files()->create(['slot' => 'document', 'path' => $path, 'name' => 'a.pdf']);

        $this->actingAs($intruder)->post("/api/portal/internationalization-actions/{$action->id}", $this->payload(), self::JSON)
            ->assertForbidden();
        $this->actingAs($intruder)->deleteJson("/api/portal/internationalization-actions/{$action->id}")->assertForbidden();
        $this->actingAs($intruder)->get("/api/portal/internationalization-actions/{$action->id}/files/document", self::JSON)
            ->assertForbidden();

        $this->assertDatabaseHas('internationalization_actions', ['id' => $action->id]);
        Storage::assertExists($path);
    }

    public function test_unapproved_user_cannot_use_the_portal(): void
    {
        $pending = User::factory()->create(['is_approved' => false]);

        $this->actingAs($pending)->getJson('/api/portal/internationalization-actions')->assertStatus(403);
    }

    public function test_owner_replaces_removes_downloads_and_deletes_files(): void
    {
        Storage::fake();
        $user = $this->member();

        $this->actingAs($user)->post('/api/portal/internationalization-actions', $this->payload([
            'files' => [
                'document' => UploadedFile::fake()->create('a.pdf', 10, 'application/pdf'),
                'photo_1' => UploadedFile::fake()->image('p1.jpg'),
            ],
        ]), self::JSON)->assertCreated();
        $action = InternationalizationAction::firstOrFail();
        $oldPhoto = $action->files()->where('slot', 'photo_1')->value('path');
        $oldDoc = $action->files()->where('slot', 'document')->value('path');

        // Troca a foto 1, remove o documento, adiciona a foto 2 e edita um campo.
        $this->actingAs($user)->post("/api/portal/internationalization-actions/{$action->id}", $this->payload([
            'country' => 'França',
            'files' => [
                'photo_1' => UploadedFile::fake()->image('novo.png'),
                'photo_2' => UploadedFile::fake()->image('p2.jpg'),
            ],
            'remove_files' => ['document'],
        ]), self::JSON)
            ->assertOk()
            ->assertJsonPath('data.country', 'França')
            ->assertJsonPath('data.files.document', null)
            ->assertJsonPath('data.files.photo_1', 'novo.png')
            ->assertJsonPath('data.files.photo_2', 'p2.jpg');

        Storage::assertMissing($oldPhoto);
        Storage::assertMissing($oldDoc);
        $this->assertCount(2, $action->fresh()->files);

        $this->actingAs($user)->get("/api/portal/internationalization-actions/{$action->id}/files/photo_1", self::JSON)
            ->assertOk()->assertDownload('novo.png');
        $this->actingAs($user)->get("/api/portal/internationalization-actions/{$action->id}/files/document", self::JSON)
            ->assertNotFound();
        $this->actingAs($user)->get("/api/portal/internationalization-actions/{$action->id}/files/outro", self::JSON)
            ->assertNotFound();

        $paths = $action->fresh()->files->pluck('path');
        $this->actingAs($user)->deleteJson("/api/portal/internationalization-actions/{$action->id}")->assertOk();
        $this->assertDatabaseCount('internationalization_actions', 0);
        $this->assertDatabaseCount('internationalization_files', 0);
        $paths->each(fn ($p) => Storage::assertMissing($p));
    }

    public function test_optional_fields_can_be_cleared_when_editing(): void
    {
        $user = $this->member();
        $action = InternationalizationAction::factory()->create([
            'user_id' => $user->id,
            'url' => 'https://example.org/acao',
            'call_notice' => 'Edital X',
            'advisor_name' => 'Fulano',
        ]);

        // O front envia os campos opcionais vazios como "" (multipart, como o FormData do navegador).
        $this->actingAs($user)->post("/api/portal/internationalization-actions/{$action->id}", $this->payload([
            'url' => '',
            'call_notice' => '',
            'advisor_name' => '',
        ]), self::JSON)->assertOk()->assertJsonPath('data.url', null);

        $fresh = $action->fresh();
        $this->assertNull($fresh->url);
        $this->assertNull($fresh->call_notice);
        $this->assertNull($fresh->advisor_name);
    }

    // ── Admin: visão geral, edição, exclusão e dashboard ──────────────────────

    public function test_admin_sees_all_actions_with_submitter_and_can_edit_and_delete(): void
    {
        Storage::fake();
        $admin = $this->admin();
        $owner = $this->member();
        $action = InternationalizationAction::factory()->create(['user_id' => $owner->id]);
        InternationalizationAction::factory()->create(['user_id' => $this->member()->id]);

        $this->actingAs($admin)->getJson('/api/admin/internationalization-actions')
            ->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonFragment(['id' => $owner->id, 'name' => $owner->name, 'email' => $owner->email]);

        $this->actingAs($admin)->post("/api/admin/internationalization-actions/{$action->id}", $this->payload([
            'full_name' => 'Nome Corrigido pela Coordenação',
            'files' => ['document' => UploadedFile::fake()->create('c.pdf', 10, 'application/pdf')],
        ]), self::JSON)->assertOk()->assertJsonPath('data.full_name', 'Nome Corrigido pela Coordenação');
        // A edição da coordenação não muda o dono.
        $this->assertSame($owner->id, $action->fresh()->user_id);

        $this->actingAs($admin)->get("/api/admin/internationalization-actions/{$action->id}/files/document", self::JSON)
            ->assertOk()->assertDownload('c.pdf');

        $path = $action->fresh()->files->first()->path;
        $this->actingAs($admin)->deleteJson("/api/admin/internationalization-actions/{$action->id}")->assertOk();
        Storage::assertMissing($path);
    }

    public function test_dashboard_summary_filters_by_year(): void
    {
        $admin = $this->admin();
        InternationalizationAction::factory()->create(['start_date' => '2023-02-01', 'end_date' => '2023-02-10', 'level' => 'professor', 'lattes_status' => 'registered', 'country' => 'Portugal']);
        InternationalizationAction::factory()->create(['start_date' => '2024-03-01', 'end_date' => '2024-03-10', 'level' => 'student', 'lattes_status' => 'registered', 'country' => 'Portugal']);
        InternationalizationAction::factory()->create(['start_date' => '2024-06-01', 'end_date' => '2024-06-10', 'level' => 'student', 'lattes_status' => 'pending', 'country' => 'França']);
        InternationalizationAction::factory()->create(['start_date' => '2024-09-01', 'end_date' => '2024-09-10', 'level' => 'student', 'lattes_status' => 'pending', 'country' => null]);

        $all = $this->actingAs($admin)->getJson('/api/admin/internationalization-dashboard')->assertOk();
        $all->assertJsonPath('total', 4)
            ->assertJsonPath('years', [2024, 2023])
            ->assertJsonPath('countries_count', 2)
            ->assertJsonPath('by_level.student', 3)
            ->assertJsonPath('by_level.professor', 1)
            ->assertJsonPath('by_lattes_status.pending', 2);
        $this->assertSame('Portugal', $all->json('per_country.0.name'));
        $this->assertSame(2, $all->json('per_country.0.total'));

        $filtered = $this->actingAs($admin)->getJson('/api/admin/internationalization-dashboard?year=2024')->assertOk();
        $filtered->assertJsonPath('total', 3)
            ->assertJsonPath('countries_count', 2)
            ->assertJsonPath('by_level.professor', 0)
            ->assertJsonPath('by_lattes_status.registered', 1);
        // A evolução por ano ignora o filtro.
        $this->assertCount(2, $filtered->json('per_year'));
        $this->assertSame(3, collect($filtered->json('per_category'))->sum('total'));
    }
}
