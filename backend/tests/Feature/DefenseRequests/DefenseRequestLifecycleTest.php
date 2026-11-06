<?php

namespace Tests\Feature\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestConflict;
use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Domain\DefenseRequests\DefenseRequestWorkflow;
use App\Enums\DefenseRequestStatus;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Models\DefenseRequest;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use LogicException;
use Tests\TestCase;

/**
 * Máquina de estados da solicitação de banca: transições, invariantes do modelo
 * e "quem é o orientador" quando o cadastro muda depois da abertura.
 */
class DefenseRequestLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/portal/defense-requests';

    private function professor(): User
    {
        return User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR]);
    }

    private function advisee(User $advisor): User
    {
        $student = User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT]);
        $advisor->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        return $student;
    }

    private function answers(bool $confirmations = true): array
    {
        $data = [];
        foreach (DefenseRequestForms::get('masters_qualification')['fields'] as $f) {
            if ($f['type'] === 'confirm' && ! $confirmations) {
                continue;
            }
            $data[$f['key']] = match ($f['type']) {
                'text', 'textarea' => "Valor {$f['key']}",
                'date' => now()->addMonth()->format('Y-m-d'),
                'time' => '10:00',
                'confirm' => true,
                'member' => ['name' => "Pessoa {$f['key']}", 'affiliation' => 'UFPE', 'lattes' => 'http://lattes.cnpq.br/'.crc32($f['key'])],
            };
        }

        return $data;
    }

    /** Discente abre; devolve o id (status awaiting_advisor). */
    private function openByStudent(User $student): int
    {
        return $this->actingAs($student)->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers(false)])
            ->assertCreated()->json('data.id');
    }

    public function test_transition_table(): void
    {
        $this->assertTrue(DefenseRequestStatus::AWAITING_ADVISOR->canTransitionTo(DefenseRequestStatus::SUBMITTED));
        $this->assertFalse(DefenseRequestStatus::SUBMITTED->canTransitionTo(DefenseRequestStatus::AWAITING_ADVISOR));
        $this->assertSame([], DefenseRequestStatus::SUBMITTED->next());
        $this->assertSame(DefenseRequestStatus::values(), array_map(fn ($s) => $s->value, DefenseRequestStatus::inProgress()));
    }

    public function test_model_refuses_record_without_status(): void
    {
        $this->expectException(LogicException::class);
        DefenseRequest::create(['type' => 'masters_qualification', 'data' => []]);
    }

    public function test_model_ties_submitted_status_to_submitted_at(): void
    {
        foreach ([
            'enviada sem data' => ['status' => DefenseRequestStatus::SUBMITTED, 'submitted_at' => null],
            'aguardando com data' => ['status' => DefenseRequestStatus::AWAITING_ADVISOR, 'submitted_at' => now()],
        ] as $case => $attributes) {
            try {
                DefenseRequest::create($attributes + ['type' => 'masters_qualification', 'data' => []]);
                $this->fail("gravou estado inválido: {$case}");
            } catch (LogicException) {
                $this->addToAssertionCount(1);
            }
        }
        $this->assertDatabaseCount('defense_requests', 0);
    }

    public function test_model_refuses_going_back_from_submitted(): void
    {
        $request = DefenseRequest::create(['type' => 'masters_qualification', 'data' => [], 'status' => DefenseRequestStatus::SUBMITTED, 'submitted_at' => now()]);

        $this->expectException(LogicException::class);
        $request->update(['status' => DefenseRequestStatus::AWAITING_ADVISOR, 'submitted_at' => null]);
    }

    public function test_submitted_request_cannot_be_reviewed_again(): void
    {
        $advisor = $this->professor();
        $id = $this->openByStudent($this->advisee($advisor));

        $this->actingAs($advisor)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])->assertOk();
        $this->actingAs($advisor)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])
            ->assertForbidden()->assertJsonPath('errors.0.description', 'Esta solicitação já foi enviada à coordenação.');
    }

    /** Dois envios ao mesmo tempo: o segundo encontra o estado já mudado (lock) e recebe 409. */
    public function test_stale_submit_is_a_conflict(): void
    {
        $advisor = $this->professor();
        $id = $this->openByStudent($this->advisee($advisor));
        $stale = DefenseRequest::findOrFail($id);
        $workflow = app(DefenseRequestWorkflow::class);

        $workflow->submit(DefenseRequest::findOrFail($id), $advisor, 'masters_qualification', $this->answers());

        try {
            $workflow->submit($stale, $advisor, 'masters_qualification', $this->answers());
            $this->fail('segundo envio passou');
        } catch (DefenseRequestConflict $e) {
            $this->assertSame(409, $e->render()->getStatusCode());
        }
        $this->assertSame(DefenseRequestStatus::SUBMITTED, DefenseRequest::findOrFail($id)->status);
    }

    /** A secretaria troca o orientador depois da abertura: o novo assume a revisão. */
    public function test_new_advisor_takes_over_when_the_record_changes(): void
    {
        $old = $this->professor();
        $new = $this->professor();
        $student = $this->advisee($old);
        $id = $this->openByStudent($student);

        $student->advisors()->detach($old->id);
        $new->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        $this->actingAs($old)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])->assertForbidden();
        $listed = collect($this->actingAs($new)->getJson(self::URL)->json('data'))->firstWhere('id', $id);
        $this->assertTrue($listed['can_review'] ?? false, 'novo orientador não vê a pendência');

        $this->actingAs($new)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])
            ->assertOk()->assertJsonPath('data.advisor.id', $new->id)->assertJsonPath('data.answers.advisor', $new->name);
    }

    /** O orientador é removido (advisor_user_id vira null): não trava se houver novo orientador. */
    public function test_removed_advisor_does_not_strand_the_request(): void
    {
        $old = $this->professor();
        $new = $this->professor();
        $student = $this->advisee($old);
        $id = $this->openByStudent($student);

        // user_user impede apagar docente com orientandos: a secretaria desvincula e depois remove.
        $student->advisors()->detach($old->id);
        $old->delete();
        $new->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);
        $this->assertNull(DefenseRequest::findOrFail($id)->advisor_user_id);

        $this->actingAs($new)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])
            ->assertOk()->assertJsonPath('data.status', DefenseRequestStatus::SUBMITTED->value);
    }
}
