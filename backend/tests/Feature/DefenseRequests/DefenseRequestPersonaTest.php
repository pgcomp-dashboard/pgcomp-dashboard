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

/**
 * Contrato da solicitação de banca, por persona.
 *
 * flow_*  = caminhos que precisam funcionar (discente → orientador → coordenação).
 * rule_*  = invariantes de lógica que cruzam o formulário com o cadastro.
 */
class DefenseRequestPersonaTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/portal/defense-requests';

    private Course $mestrado;

    private Course $doutorado;

    protected function setUp(): void
    {
        parent::setUp();
        $this->mestrado = Course::create(['name' => 'Mestrado']);
        $this->doutorado = Course::create(['name' => 'Doutorado']);
    }

    // ---- pessoas ---------------------------------------------------------------

    private function professor(array $attrs = []): User
    {
        return User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR] + $attrs);
    }

    private function student(?User $advisor, ?Course $course = null, array $attrs = []): User
    {
        $student = User::factory()->create($attrs + ['is_approved' => true, 'type' => UserType::STUDENT, 'course_id' => ($course ?? $this->mestrado)->id]);
        $advisor?->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        return $student;
    }

    private function coordination(): User
    {
        return tap(User::factory()->make(['type' => UserType::MANAGER]), fn (User $u) => $u->forceFill(['is_admin' => true, 'is_approved' => true])->save());
    }

    // ---- respostas -------------------------------------------------------------

    private function member(string $name, string $affiliation = 'UFPE', ?int $userId = null): array
    {
        return ['user_id' => $userId, 'name' => $name, 'affiliation' => $affiliation, 'lattes' => 'http://lattes.cnpq.br/'.crc32($name)];
    }

    /** Respostas válidas de um tipo; sem confirmações quando é o discente quem envia. */
    private function answers(string $type, bool $confirmations = true, bool $optional = true): array
    {
        $data = [];
        foreach (DefenseRequestForms::get($type)['fields'] as $f) {
            if ($f['type'] === 'confirm' && ! $confirmations) {
                continue;
            }
            if (! $f['required'] && ! $optional) {
                continue;
            }
            $data[$f['key']] = match ($f['type']) {
                'text' => "Valor {$f['key']}",
                'textarea' => "Texto {$f['key']}.",
                'date' => now()->addMonth()->format('Y-m-d'),
                'time' => '14:30',
                'confirm' => true,
                'member' => $this->member("Pessoa {$type} {$f['key']}"),
            };
        }

        return $data;
    }

    private function requiredOf(string $type, string $fieldType): array
    {
        return collect(DefenseRequestForms::get($type)['fields'])
            ->where('type', $fieldType)->where('required', true)->pluck('key')->all();
    }

    // ============================================================================
    // flow_*: caminhos por persona
    // ============================================================================

    public function test_flow_student_opens_and_advisor_submits_each_type(): void
    {
        $advisor = $this->professor();
        $admin = $this->coordination();

        foreach (DefenseRequestForms::types() as $type) {
            $level = DefenseRequestForms::TYPE_MATRIX[$type]['level'];
            $student = $this->student($advisor, $level === 'doutorado' ? $this->doutorado : $this->mestrado);

            $id = $this->actingAs($student)->postJson(self::URL, ['type' => $type, 'data' => $this->answers($type, confirmations: false)])
                ->assertCreated()
                ->assertJsonPath('data.status', DefenseRequestStatus::AWAITING_ADVISOR->value)
                ->assertJsonPath('data.advisor.id', $advisor->id)
                ->assertJsonPath('data.can_review', false)
                ->json('data.id');

            // O discente vê a própria solicitação; o orientador vê com can_review.
            $this->actingAs($student)->getJson(self::URL)->assertOk()->assertJsonCount(1, 'data');
            $mine = collect($this->actingAs($advisor)->getJson(self::URL)->json('data'))->firstWhere('id', $id);
            $this->assertTrue($mine['can_review'], $type);

            $this->actingAs($advisor)->putJson(self::URL."/{$id}", ['type' => $type, 'data' => $this->answers($type)])
                ->assertOk()->assertJsonPath('data.status', DefenseRequestStatus::SUBMITTED->value);

            $this->assertContains($id, collect($this->actingAs($admin)->getJson('/api/admin/defense-requests')->json('data'))->pluck('id'));
        }
    }

    public function test_flow_advisor_opens_directly_for_own_advisee(): void
    {
        $advisor = $this->professor();
        $student = $this->student($advisor, $this->doutorado);

        $id = $this->actingAs($advisor)->postJson(self::URL, [
            'type' => 'doctoral_defense', 'student_user_id' => $student->id, 'data' => $this->answers('doctoral_defense'),
        ])->assertCreated()
            ->assertJsonPath('data.status', DefenseRequestStatus::SUBMITTED->value)
            ->assertJsonPath('data.student_user_id', $student->id)
            ->assertJsonPath('data.advisor.id', $advisor->id)
            ->json('data.id');

        $this->assertNotNull(DefenseRequest::find($id)->submitted_at);
        // O discente acompanha a dele, mas não revisa.
        $this->actingAs($student)->getJson(self::URL)->assertOk()
            ->assertJsonPath('data.0.id', $id)->assertJsonPath('data.0.can_review', false);
        $this->actingAs($student)->putJson(self::URL."/{$id}", ['type' => 'doctoral_defense', 'data' => $this->answers('doctoral_defense')])
            ->assertForbidden();
    }

    public function test_flow_only_optional_fields_can_be_left_out(): void
    {
        $advisor = $this->professor();
        foreach (DefenseRequestForms::types() as $type) {
            $level = DefenseRequestForms::TYPE_MATRIX[$type]['level'];
            $student = $this->student($advisor, $level === 'doutorado' ? $this->doutorado : $this->mestrado);
            $this->actingAs($advisor)->postJson(self::URL, [
                'type' => $type, 'student_user_id' => $student->id, 'data' => $this->answers($type, optional: false),
            ])->assertCreated();
        }
    }

    public function test_flow_each_required_member_and_confirmation_is_enforced(): void
    {
        $advisor = $this->professor();
        // Sem curso: qualquer nível vale, então só o campo que falta pode causar o 422.
        $student = $this->student($advisor, null, ['course_id' => null]);
        $missing = [];

        foreach (DefenseRequestForms::types() as $type) {
            foreach ([...$this->requiredOf($type, 'member'), ...$this->requiredOf($type, 'confirm'), ...$this->requiredOf($type, 'text'), ...$this->requiredOf($type, 'textarea'), 'date', 'time'] as $key) {
                $data = $this->answers($type);
                unset($data[$key]);
                $status = $this->actingAs($advisor)->postJson(self::URL, ['type' => $type, 'student_user_id' => $student->id, 'data' => $data])->status();
                if ($status !== 422) {
                    $missing[] = "{$type}.{$key} → {$status}";
                }
            }
        }

        $this->assertSame([], $missing);
        $this->assertDatabaseCount('defense_requests', 0);

        // Controle: com tudo preenchido, o mesmo discente cria cada tipo.
        foreach (DefenseRequestForms::types() as $type) {
            $this->actingAs($advisor)->postJson(self::URL, ['type' => $type, 'student_user_id' => $student->id, 'data' => $this->answers($type)])->assertCreated();
        }
    }

    public function test_flow_member_slot_counts_match_the_original_forms(): void
    {
        $count = fn (string $type, bool $required) => collect(DefenseRequestForms::get($type)['fields'])
            ->where('type', 'member')->where('required', $required)->count();

        // Titulares + suplentes obrigatórios / opcionais, como nos Google Forms.
        $this->assertSame([2, 4, 4, 8], array_map(fn ($t) => $count($t, true), DefenseRequestForms::types()));
        $this->assertSame([2, 2, 0, 0], array_map(fn ($t) => $count($t, false), DefenseRequestForms::types()));
    }

    public function test_flow_visibility_is_scoped_by_persona(): void
    {
        $ana = $this->professor();
        $carlos = $this->professor();
        $bruno = $this->student($ana);
        $marcos = $this->student($carlos);

        $this->actingAs($bruno)->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers('masters_qualification', false)])->assertCreated();
        $this->actingAs($marcos)->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers('masters_qualification', false)])->assertCreated();

        $this->actingAs($bruno)->getJson(self::URL)->assertJsonCount(1, 'data');
        $this->actingAs($ana)->getJson(self::URL)->assertJsonCount(1, 'data');
        $this->actingAs($this->professor())->getJson(self::URL)->assertJsonCount(0, 'data');

        // Outro docente não revisa a solicitação do orientando de Ana.
        $id = DefenseRequest::where('student_user_id', $bruno->id)->value('id');
        $this->actingAs($carlos)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers('masters_qualification')])->assertForbidden();

        // Coordenação vê tudo; docente e discente não entram no /admin.
        $this->actingAs($this->coordination())->getJson('/api/admin/defense-requests')->assertOk()->assertJsonCount(2, 'data');
        $this->actingAs($ana)->getJson('/api/admin/defense-requests')->assertForbidden();
        $this->actingAs($bruno)->getJson('/api/admin/defense-requests')->assertForbidden();
    }

    public function test_flow_student_cannot_spoof_identity(): void
    {
        $advisor = $this->professor();
        $bruno = $this->student($advisor);
        $other = $this->student($this->professor());

        $this->actingAs($bruno)->postJson(self::URL, [
            'type' => 'masters_qualification',
            'student_user_id' => $other->id,
            'data' => ['student_name' => $other->name] + $this->answers('masters_qualification', false),
        ])->assertCreated()
            ->assertJsonPath('data.student_user_id', $bruno->id)
            ->assertJsonPath('data.answers.student_name', $bruno->name)
            ->assertJsonPath('data.status', DefenseRequestStatus::AWAITING_ADVISOR->value);
    }

    public function test_flow_lookups_hide_defended_students_and_dedupe_externals(): void
    {
        $advisor = $this->professor();
        $this->student($advisor, null, ['name' => 'Ativa Zqxw']);
        $this->student($advisor, null, ['name' => 'Formada Zqxw', 'defended_at' => now()->subYear()]);

        $names = collect($this->actingAs($advisor)->getJson(self::URL.'/lookup/students')->json('data'))->pluck('name');
        $this->assertContains('Ativa Zqxw', $names);
        $this->assertNotContains('Formada Zqxw', $names);

        foreach (['Externa Única', 'externa única'] as $name) {
            DefenseRequest::create(['user_id' => $advisor->id, 'status' => DefenseRequestStatus::SUBMITTED, 'submitted_at' => now(), 'type' => 'masters_defense', 'data' => ['member_1' => $this->member($name)]]);
        }
        $this->actingAs($advisor)->getJson(self::URL.'/lookup/members?q=única')->assertOk()->assertJsonCount(1, 'data');
        // Discente não aparece como membro de banca.
        $this->actingAs($advisor)->getJson(self::URL.'/lookup/members?q=Zqxw')->assertOk()->assertJsonCount(0, 'data');
    }

    // ============================================================================
    // rule_*: invariantes de lógica (vermelho = falha encontrada)
    // ============================================================================

    /** Sem orientador vinculado, a solicitação ficaria "Aguardando orientador" para sempre. */
    public function test_rule_student_without_advisor_is_rejected(): void
    {
        $orphan = $this->student(null);
        $this->actingAs($orphan)->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers('masters_qualification', false)])
            ->assertStatus(422);
        $this->assertDatabaseCount('defense_requests', 0);
    }

    /** As confirmações são declarações do orientador: o discente não pode deixá-las marcadas. */
    public function test_rule_student_cannot_pre_check_advisor_confirmations(): void
    {
        $bruno = $this->student($this->professor());
        $this->actingAs($bruno)->postJson(self::URL, ['type' => 'masters_defense', 'data' => $this->answers('masters_defense')])->assertCreated();

        $data = DefenseRequest::firstOrFail()->data;
        $checked = collect($data)->filter(fn ($v, $k) => str_starts_with($k, 'confirm_') && $v === true)->keys()->all();
        $this->assertSame([], $checked, 'confirmações que chegaram marcadas ao orientador');
    }

    /** O docente precisa dizer para qual discente é a banca. */
    public function test_rule_professor_must_choose_a_student(): void
    {
        $this->actingAs($this->professor())->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers('masters_qualification')])
            ->assertStatus(422);
    }

    /** Docente que não orienta o discente não vira "orientador" da solicitação dele. */
    public function test_rule_professor_cannot_open_for_someone_elses_advisee(): void
    {
        $ana = $this->professor();
        $carlos = $this->professor();
        $bruno = $this->student($ana);

        $status = $this->actingAs($carlos)->postJson(self::URL, [
            'type' => 'masters_qualification', 'student_user_id' => $bruno->id, 'data' => $this->answers('masters_qualification'),
        ])->status();

        $stored = DefenseRequest::first();
        $this->assertTrue(
            in_array($status, [403, 422], true) || $stored?->advisor_user_id === $ana->id,
            "status {$status}; advisor_user_id gravado = ".($stored?->advisor_user_id ?? 'null')." (Ana={$ana->id}, Carlos={$carlos->id})",
        );
    }

    /** A coordenação (manager) só lê; não abre solicitação como se fosse orientadora. */
    public function test_rule_coordination_cannot_create_as_advisor(): void
    {
        $bruno = $this->student($this->professor());
        $this->actingAs($this->coordination())->postJson(self::URL, [
            'type' => 'masters_qualification', 'student_user_id' => $bruno->id, 'data' => $this->answers('masters_qualification'),
        ])->assertForbidden();
    }

    /** Nome do discente e do orientador vêm do cadastro, não do texto enviado. */
    public function test_rule_student_and_advisor_names_come_from_the_records(): void
    {
        $ana = $this->professor(['name' => 'Ana Real']);
        $bruno = $this->student($ana, null, ['name' => 'Bruno Real']);

        // Discente tenta trocar o nome do orientador.
        $this->actingAs($bruno)->postJson(self::URL, [
            'type' => 'masters_qualification', 'data' => ['advisor' => 'Orientador Inventado'] + $this->answers('masters_qualification', false),
        ])->assertCreated()->assertJsonPath('data.answers.advisor', 'Ana Real');

        // Orientadora abre (outro tipo) com nome de discente diferente do cadastro.
        $this->actingAs($ana)->postJson(self::URL, [
            'type' => 'masters_defense', 'student_user_id' => $bruno->id,
            'data' => ['student_name' => 'Nome Trocado', 'advisor' => 'Outra Pessoa'] + $this->answers('masters_defense'),
        ])->assertCreated()->assertJsonPath('data.answers.student_name', 'Bruno Real')->assertJsonPath('data.answers.advisor', 'Ana Real');
    }

    /** O nível do tipo bate com o curso do discente (mestrando não pede defesa de doutorado). */
    public function test_rule_type_level_matches_student_course(): void
    {
        $ana = $this->professor();
        $bruno = $this->student($ana, $this->mestrado);

        $this->actingAs($bruno)->postJson(self::URL, ['type' => 'doctoral_defense', 'data' => $this->answers('doctoral_defense', false)])
            ->assertStatus(422);

        // Nem o orientador troca o tipo na revisão para outro nível.
        $id = $this->actingAs($bruno)->postJson(self::URL, ['type' => 'masters_defense', 'data' => $this->answers('masters_defense', false)])->json('data.id');
        $this->actingAs($ana)->putJson(self::URL."/{$id}", ['type' => 'doctoral_defense', 'data' => $this->answers('doctoral_defense')])
            ->assertStatus(422);
    }

    /** A mesma pessoa não ocupa duas vagas da banca. */
    public function test_rule_member_cannot_fill_two_slots(): void
    {
        $ana = $this->professor();
        $bruno = $this->student($ana);
        $data = $this->answers('masters_qualification');
        $data['member_2'] = $data['member_1'];

        $this->actingAs($ana)->postJson(self::URL, ['type' => 'masters_qualification', 'student_user_id' => $bruno->id, 'data' => $data])
            ->assertStatus(422);
    }

    /** Orientador e coorientador não entram como membros da banca (já presidem/participam). */
    public function test_rule_advisor_is_not_a_committee_member(): void
    {
        $ana = $this->professor();
        $bruno = $this->student($ana);
        $data = $this->answers('masters_qualification');
        $data['member_1'] = $this->member($ana->name, 'PGCOMP/UFBA', $ana->id);

        $this->actingAs($ana)->postJson(self::URL, ['type' => 'masters_qualification', 'student_user_id' => $bruno->id, 'data' => $data])
            ->assertStatus(422);
    }

    /** user_id de membro aponta para um docente, e o nome gravado é o do cadastro. */
    public function test_rule_member_user_id_is_a_professor_and_wins_over_typed_name(): void
    {
        $ana = $this->professor();
        $helena = $this->professor(['name' => 'Helena Real']);
        $bruno = $this->student($ana);

        // Discente não é membro de banca (antes do caso válido, para não esbarrar na regra de duplicata).
        $data = $this->answers('masters_qualification');
        $data['member_1'] = $this->member('Um Discente', 'PGCOMP/UFBA', $bruno->id);
        $this->actingAs($ana)->postJson(self::URL, ['type' => 'masters_qualification', 'student_user_id' => $bruno->id, 'data' => $data])
            ->assertStatus(422);

        $data['member_1'] = $this->member('Outro Nome Digitado', 'PGCOMP/UFBA', $helena->id);
        $this->actingAs($ana)->postJson(self::URL, ['type' => 'masters_qualification', 'student_user_id' => $bruno->id, 'data' => $data])
            ->assertCreated()->assertJsonPath('data.answers.member_1.name', 'Helena Real');
    }

    /** Não há duas solicitações abertas do mesmo discente para o mesmo tipo. */
    public function test_rule_no_duplicate_open_request(): void
    {
        $bruno = $this->student($this->professor());
        $payload = ['type' => 'masters_qualification', 'data' => $this->answers('masters_qualification', false)];

        $this->actingAs($bruno)->postJson(self::URL, $payload)->assertCreated();
        $this->assertContains($this->actingAs($bruno)->postJson(self::URL, $payload)->status(), [409, 422]);
    }
}
