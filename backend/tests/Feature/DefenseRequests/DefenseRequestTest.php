<?php

namespace Tests\Feature\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\DefenseRequestStatus;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Models\Course;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DefenseRequestTest extends TestCase
{
    use RefreshDatabase;

    private function professor(): User
    {
        return User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR]);
    }

    /** Orientando do docente (sem curso: qualquer nível vale). */
    private function advisee(User $professor, array $attrs = []): User
    {
        $student = User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT] + $attrs);
        $professor->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        return $student;
    }

    /** Respostas válidas para todos os campos obrigatórios (e alguns opcionais) de um tipo. */
    private function validData(string $type): array
    {
        $data = [];
        foreach (DefenseRequestForms::get($type)['fields'] as $field) {
            $data[$field['key']] = match ($field['type']) {
                'text' => "Valor de {$field['key']}",
                'textarea' => "Texto longo de {$field['key']}.",
                'date' => '2026-12-10',
                'time' => '14:30',
                'confirm' => true,
                'member' => ['name' => "Pessoa {$field['key']}", 'affiliation' => 'UFPE', 'lattes' => 'http://lattes.cnpq.br/1234567890123456'],
            };
        }

        return $data;
    }

    public function test_forms_endpoint_exposes_the_four_types_with_their_fields(): void
    {
        $response = $this->actingAs($this->professor())->getJson('/api/portal/defense-request-forms')->assertOk();

        $types = collect($response->json('data'));
        $this->assertSame(
            ['masters_qualification', 'masters_defense', 'doctoral_qualification', 'doctoral_defense'],
            $types->pluck('type')->all(),
        );
        // Membro de banca virou um campo só (nome + afiliação + Lattes): 17/25/17/29 campos viraram 13/19/13/21.
        $this->assertSame([13, 19, 13, 21], $types->map(fn ($t) => count($t['fields']))->all());
        $this->assertSame(['level' => 'doutorado', 'stage' => 'defense'], collect($types->firstWhere('type', 'doctoral_defense'))->only(['level', 'stage'])->all());
        $this->assertSame('Defesa de Doutorado', $types->firstWhere('type', 'doctoral_defense')['label']);
        // Campo que só existe nas defesas.
        $this->assertContains('impacts', collect($types->firstWhere('type', 'masters_defense')['fields'])->pluck('key'));
        $this->assertNotContains('impacts', collect($types->firstWhere('type', 'masters_qualification')['fields'])->pluck('key'));
    }

    public function test_professor_submits_each_of_the_four_types(): void
    {
        $professor = $this->professor();
        $student = $this->advisee($professor);

        foreach (DefenseRequestForms::types() as $type) {
            $this->actingAs($professor)->postJson('/api/portal/defense-requests', [
                'type' => $type,
                'student_user_id' => $student->id,
                'data' => $this->validData($type),
            ])->assertCreated()
                ->assertJsonPath('data.type', $type)
                ->assertJsonPath('data.status', 'submitted')
                // Nomes vêm do cadastro, não do texto enviado.
                ->assertJsonPath('data.answers.student_name', $student->name)
                ->assertJsonPath('data.answers.advisor', $professor->name)
                ->assertJsonPath('data.answers.member_1.affiliation', 'UFPE');
        }

        $this->assertDatabaseCount('defense_requests', 4);
        $this->assertSame($professor->id, DefenseRequest::first()->user_id);
    }

    public function test_required_fields_depend_on_the_selected_type(): void
    {
        $professor = $this->professor();
        $student = $this->advisee($professor);

        // "impacts" é obrigatório na defesa de mestrado...
        $data = $this->validData('masters_defense');
        unset($data['impacts']);
        $this->actingAs($professor)->postJson('/api/portal/defense-requests', ['type' => 'masters_defense', 'student_user_id' => $student->id, 'data' => $data])
            ->assertStatus(422);

        // ...e não existe na qualificação de mestrado, onde o co-orientador é opcional.
        $data = $this->validData('masters_qualification');
        unset($data['co_advisor']);
        $this->actingAs($professor)->postJson('/api/portal/defense-requests', ['type' => 'masters_qualification', 'student_user_id' => $student->id, 'data' => $data])
            ->assertCreated();
    }

    public function test_validation_rejects_bad_values(): void
    {
        $professor = $this->professor();
        $student = $this->advisee($professor);
        $cases = [
            'tipo inexistente' => ['type' => 'pos_doc', 'data' => ['x' => 1]],
            'sem dados' => ['type' => 'masters_qualification'],
            'data inválida' => ['type' => 'masters_qualification', 'data' => ['date' => '10/12/2026'] + $this->validData('masters_qualification')],
            'hora inválida' => ['type' => 'masters_qualification', 'data' => ['time' => '25:99'] + $this->validData('masters_qualification')],
            'confirmação não marcada' => ['type' => 'masters_qualification', 'data' => ['confirm_aware' => false] + $this->validData('masters_qualification')],
            'membro sem afiliação' => ['type' => 'masters_qualification', 'data' => ['member_1' => ['name' => 'X', 'lattes' => 'http://lattes.cnpq.br/1']] + $this->validData('masters_qualification')],
            'docente sem discente' => ['type' => 'masters_qualification', 'student_user_id' => null, 'data' => $this->validData('masters_qualification')],
            'Lattes que não é URL' => ['type' => 'masters_qualification', 'data' => ['member_1' => ['name' => 'X', 'affiliation' => 'UFPE', 'lattes' => 'lattes']] + $this->validData('masters_qualification')],
            'suplente opcional sem afiliação' => ['type' => 'masters_qualification', 'data' => ['substitute_1' => ['name' => 'X']] + $this->validData('masters_qualification')],
        ];

        foreach ($cases as $case => $payload) {
            $this->actingAs($professor)->postJson('/api/portal/defense-requests', $payload + ['student_user_id' => $student->id])
                ->assertStatus(422, "esperava 422 para: {$case}");
        }
        $this->assertDatabaseCount('defense_requests', 0);
    }

    public function test_only_schema_fields_are_stored(): void
    {
        $professor = $this->professor();
        $this->actingAs($professor)->postJson('/api/portal/defense-requests', [
            'type' => 'doctoral_qualification',
            'student_user_id' => $this->advisee($professor)->id,
            'data' => $this->validData('doctoral_qualification') + ['hacker' => 'x', 'status' => 'approved'],
        ])->assertCreated();

        $stored = DefenseRequest::firstOrFail();
        $this->assertArrayNotHasKey('hacker', $stored->data);
        $this->assertSame(DefenseRequestStatus::SUBMITTED, $stored->status);
        // O MySQL reordena as chaves de colunas JSON; o que importa é o conjunto.
        $this->assertEqualsCanonicalizing(array_column(DefenseRequestForms::get('doctoral_qualification')['fields'], 'key'), array_keys($stored->data));
    }

    public function test_student_opens_request_and_advisor_reviews_and_submits(): void
    {
        $advisor = $this->professor();
        $student = User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT]);
        $advisor->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        // O discente envia sem as confirmações (são declarações do orientador).
        $data = collect($this->validData('masters_qualification'))->reject(fn ($v, $k) => str_starts_with($k, 'confirm_'))->all();
        $data['student_name'] = 'Outro nome qualquer';
        $id = $this->actingAs($student)->postJson('/api/portal/defense-requests', ['type' => 'masters_qualification', 'data' => $data])
            ->assertCreated()
            ->assertJsonPath('data.status', 'awaiting_advisor')
            ->assertJsonPath('data.answers.student_name', $student->name)
            ->assertJsonPath('data.advisor.id', $advisor->id)
            ->json('data.id');

        // O orientador vê a pendência e pode revisar; outro docente não.
        $this->actingAs($advisor)->getJson('/api/portal/defense-requests')->assertOk()
            ->assertJsonPath('data.0.can_review', true);
        $this->actingAs($this->professor())->putJson("/api/portal/defense-requests/{$id}", [
            'type' => 'masters_qualification', 'data' => $this->validData('masters_qualification'),
        ])->assertForbidden();

        // Sem as confirmações o orientador não envia; com elas, envia.
        $this->actingAs($advisor)->putJson("/api/portal/defense-requests/{$id}", ['type' => 'masters_qualification', 'data' => $data])
            ->assertStatus(422);
        $this->actingAs($advisor)->putJson("/api/portal/defense-requests/{$id}", [
            'type' => 'masters_qualification', 'data' => $this->validData('masters_qualification'),
        ])->assertOk()->assertJsonPath('data.status', 'submitted')->assertJsonPath('data.can_review', false);

        $this->assertNotNull(DefenseRequest::find($id)->submitted_at);
        // Depois de enviada, nem o orientador revisa de novo.
        $this->actingAs($advisor)->putJson("/api/portal/defense-requests/{$id}", [
            'type' => 'masters_qualification', 'data' => $this->validData('masters_qualification'),
        ])->assertForbidden();
    }

    public function test_lookups_prefill_student_and_suggest_members(): void
    {
        $course = Course::create(['name' => 'Doutorado']);
        $advisor = $this->professor();
        $coAdvisor = User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR, 'name' => 'Zélia Coorientadora', 'lattes_url' => 'http://lattes.cnpq.br/42']);
        $student = User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT, 'course_id' => $course->id, 'name' => 'Aluna Orientanda']);
        User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT, 'name' => 'Aluno De Outro']);
        $advisor->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);
        $coAdvisor->coadviseees()->attach($student->id, ['relation_type' => UserRelationType::CO_ADVISOR->value]);

        // Sem busca, o docente vê só os orientandos, já com nível, orientador e coorientador.
        $this->actingAs($advisor)->getJson('/api/portal/defense-requests/lookup/students')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.level', 'doutorado')
            ->assertJsonPath('data.0.advisor.id', $advisor->id)
            ->assertJsonPath('data.0.co_advisor.name', 'Zélia Coorientadora')
            ->assertJsonPath('data.0.is_mine', true);
        // A busca do docente fica entre os orientandos dele.
        $this->actingAs($advisor)->getJson('/api/portal/defense-requests/lookup/students?q=Outro')->assertOk()
            ->assertJsonCount(0, 'data');
        $this->actingAs($advisor)->getJson('/api/portal/defense-requests/lookup/students?q=Orientanda')->assertOk()
            ->assertJsonCount(1, 'data');

        // O discente só recebe a si mesmo.
        $this->actingAs($student)->getJson('/api/portal/defense-requests/lookup/students?q=Outro')->assertOk()
            ->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $student->id);

        // Membros: docentes do PGCOMP com Lattes do cadastro + externos de bancas anteriores.
        DefenseRequest::create(['user_id' => $advisor->id, 'status' => DefenseRequestStatus::SUBMITTED, 'submitted_at' => now(), 'type' => 'masters_defense', 'data' => [
            'member_1' => ['user_id' => null, 'name' => 'Externa Zeferina', 'affiliation' => 'UFPE', 'lattes' => 'http://lattes.cnpq.br/7'],
        ]]);
        $this->actingAs($advisor)->getJson('/api/portal/defense-requests/lookup/members?q=Z')->assertOk()
            ->assertJsonFragment(['name' => 'Zélia Coorientadora', 'affiliation' => 'PGCOMP/UFBA', 'lattes' => 'http://lattes.cnpq.br/42', 'source' => 'pgcomp'])
            ->assertJsonFragment(['name' => 'Externa Zeferina', 'affiliation' => 'UFPE', 'source' => 'previous']);
    }

    public function test_guests_are_blocked(): void
    {
        $this->getJson('/api/portal/defense-request-forms')->assertStatus(401);
        $this->postJson('/api/portal/defense-requests', [])->assertStatus(401);
    }

    public function test_user_lists_only_own_requests_and_admin_lists_all(): void
    {
        $me = $this->professor();
        $other = $this->professor();
        DefenseRequest::create(['user_id' => $me->id, 'status' => DefenseRequestStatus::SUBMITTED, 'submitted_at' => now(), 'type' => 'masters_defense', 'data' => ['student_name' => 'A']]);
        DefenseRequest::create(['user_id' => $other->id, 'status' => DefenseRequestStatus::SUBMITTED, 'submitted_at' => now(), 'type' => 'doctoral_defense', 'data' => ['student_name' => 'B']]);

        $this->actingAs($me)->getJson('/api/portal/defense-requests')->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.type_label', 'Defesa de Mestrado');

        $this->actingAs($me)->getJson('/api/admin/defense-requests')->assertForbidden();

        $admin = User::factory()->admin()->create(['is_approved' => true, 'type' => UserType::PROFESSOR]);
        $this->actingAs($admin)->getJson('/api/admin/defense-requests')->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['name' => $other->name]);
    }
}
