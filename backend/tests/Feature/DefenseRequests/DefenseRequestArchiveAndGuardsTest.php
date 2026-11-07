<?php

namespace Tests\Feature\DefenseRequests;

use App\Domain\DefenseRequests\DefenseRequestDenied;
use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Domain\DefenseRequests\DefenseRequestWorkflow;
use App\Enums\DefenseRequestStatus;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Mail\DefenseRequestMail;
use App\Models\DefenseRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * Arquivar/restaurar/apagar, a trava do último orientador, os avisos por e-mail e as
 * conferências dentro do lock (os contraexemplos do modelo TLA+ em _local/formal).
 */
class DefenseRequestArchiveAndGuardsTest extends TestCase
{
    use RefreshDatabase;

    private const URL = '/api/portal/defense-requests';

    private const ADMIN_URL = '/api/admin/defense-requests';

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

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

    private function coordination(): User
    {
        return tap(User::factory()->make(['type' => UserType::MANAGER]), fn (User $u) => $u->forceFill(['is_admin' => true, 'is_approved' => true])->save());
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

    private function open(User $student): int
    {
        return $this->actingAs($student)->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers(false)])
            ->assertCreated()->json('data.id');
    }

    // ---- arquivar, restaurar, apagar ---------------------------------------------

    public function test_archived_request_leaves_the_list_and_the_duplicate_rule(): void
    {
        $student = $this->advisee($this->professor());
        $id = $this->open($student);

        $this->actingAs($student)->deleteJson(self::URL."/{$id}")->assertOk()->assertJsonPath('data.archived_by.id', $student->id);
        $this->assertSoftDeleted('defense_requests', ['id' => $id]);
        $this->actingAs($student)->getJson(self::URL)->assertJsonCount(0, 'data');
        $this->actingAs($student)->getJson(self::URL.'?archived=1')->assertJsonCount(1, 'data')->assertJsonPath('data.0.can_restore', true);

        // Arquivada não bloqueia abrir outra do mesmo tipo.
        $this->open($student);
    }

    public function test_restore_checks_the_duplicate_rule_again(): void
    {
        $student = $this->advisee($this->professor());
        $archived = $this->open($student);
        $this->actingAs($student)->deleteJson(self::URL."/{$archived}")->assertOk();
        $active = $this->open($student);

        $this->actingAs($student)->postJson(self::URL."/{$archived}/restore")
            ->assertStatus(422)->assertJsonPath('errors.0.field', 'type');

        $this->actingAs($student)->deleteJson(self::URL."/{$active}")->assertOk();
        $this->actingAs($student)->postJson(self::URL."/{$archived}/restore")->assertOk()->assertJsonPath('data.archived_at', null);
        $this->assertNull(DefenseRequest::findOrFail($archived)->archived_by_user_id);
    }

    public function test_who_can_archive(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);

        $this->actingAs($this->professor())->deleteJson(self::URL."/{$id}")->assertForbidden()
            ->assertJsonPath('errors.0.description', 'Só quem abriu, o orientador atual ou a coordenação podem arquivar esta solicitação.');
        $this->actingAs($advisor)->deleteJson(self::URL."/{$id}")->assertOk();
        $this->actingAs($this->coordination())->postJson(self::ADMIN_URL."/{$id}/restore")->assertOk();
        $this->actingAs($this->coordination())->deleteJson(self::ADMIN_URL."/{$id}")->assertOk();
        $this->actingAs($this->coordination())->getJson(self::ADMIN_URL.'?archived=1')->assertJsonCount(1, 'data');
    }

    public function test_opener_deletes_only_while_awaiting_and_coordination_always(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);
        $this->actingAs($student)->getJson(self::URL)->assertJsonPath('data.0.can_delete', true);
        $this->actingAs($student)->deleteJson(self::URL."/{$id}/permanent")->assertNoContent();
        $this->assertDatabaseMissing('defense_requests', ['id' => $id]);

        $sent = $this->actingAs($advisor)->postJson(self::URL, ['type' => 'masters_qualification', 'data' => $this->answers(), 'student_user_id' => $student->id])
            ->assertCreated()->json('data.id');
        $this->actingAs($advisor)->deleteJson(self::URL."/{$sent}/permanent")->assertForbidden()
            ->assertJsonPath('errors.0.description', 'Só quem abriu pode apagar, e só enquanto aguarda o orientador. Arquive em vez de apagar.');
        $this->actingAs($this->coordination())->deleteJson(self::ADMIN_URL."/{$sent}/permanent")->assertNoContent();
        $this->assertDatabaseMissing('defense_requests', ['id' => $sent]);
    }

    public function test_archived_request_cannot_be_reviewed(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);
        $this->actingAs($student)->deleteJson(self::URL."/{$id}")->assertOk();

        $this->actingAs($advisor)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])->assertNotFound();
    }

    public function test_schema_version_is_recorded(): void
    {
        $id = $this->open($this->advisee($this->professor()));
        $this->assertSame(DefenseRequestForms::VERSION, DefenseRequest::findOrFail($id)->schema_version);
    }

    // ---- último orientador -------------------------------------------------------

    public function test_sole_advisor_cannot_be_removed_while_a_request_awaits(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $this->open($student);

        try {
            app(UserService::class)->delete($advisor);
            $this->fail('removeu o único orientador');
        } catch (ValidationException $e) {
            $this->assertStringContainsString('Vincule outro orientador antes', $e->errors()['advisor_id'][0]);
        }
        $this->assertTrue($student->advisors()->whereKey($advisor->id)->exists());

        // Com outro orientador vinculado, pode.
        $this->professor()->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);
        $this->assertTrue(app(UserService::class)->delete($advisor));
    }

    public function test_student_cannot_be_left_without_advisor_by_the_registry(): void
    {
        $student = $this->advisee($this->professor());
        $student->forceFill(['registration' => 202611060])->save();
        $this->open($student);

        try {
            app(UserService::class)->createOrUpdateStudent(['registration' => 202611060, 'name' => $student->name, 'advisor_id' => []]);
            $this->fail('deixou o discente sem orientador');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('advisor_id', $e->errors());
        }
        $this->assertTrue($student->advisors()->exists());
    }

    /** Contraexemplo do TLA+: arquivar → desvincular o único orientador → restaurar. */
    public function test_restoring_an_awaiting_request_needs_an_advisor(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);
        $this->actingAs($student)->deleteJson(self::URL."/{$id}")->assertOk();
        app(UserService::class)->delete($advisor); // arquivada não segura o último orientador

        $this->actingAs($student)->postJson(self::URL."/{$id}/restore")
            ->assertStatus(422)->assertJsonPath('errors.0.field', 'advisor_id');
        $this->assertSoftDeleted('defense_requests', ['id' => $id]);
    }

    // ---- conferências dentro do lock (contraexemplos do TLA+) ----------------------

    public function test_advisor_removed_after_validation_cannot_submit(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);
        // A secretaria troca o orientador entre a validação e a gravação.
        $this->professor()->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);
        $student->advisors()->detach($advisor->id);

        $this->expectException(DefenseRequestDenied::class);
        app(DefenseRequestWorkflow::class)->submit(DefenseRequest::findOrFail($id), $advisor, 'masters_qualification', fn () => $this->answers(), $this->answers());
    }

    public function test_member_turned_coadvisor_after_validation_is_refused(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);
        $member = $this->professor();
        $data = $this->answers();
        $data['member_1'] = ['user_id' => $member->id, 'name' => $member->name, 'affiliation' => 'UFBA', 'lattes' => 'http://lattes.cnpq.br/1'];
        $member->coadviseees()->attach($student->id, ['relation_type' => UserRelationType::CO_ADVISOR->value]);

        try {
            app(DefenseRequestWorkflow::class)->submit(DefenseRequest::findOrFail($id), $advisor, 'masters_qualification', fn () => $data, $data);
            $this->fail('gravou banca com o coorientador');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('data.member_1', $e->errors());
        }
        $this->assertSame(DefenseRequestStatus::AWAITING_ADVISOR, DefenseRequest::findOrFail($id)->status);
    }

    public function test_student_whose_advisor_vanished_gets_422_not_500(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $student->advisors()->detach($advisor->id);

        try {
            app(DefenseRequestWorkflow::class)->open($student, $student, 'masters_qualification', fn () => $this->answers(false), $this->answers(false));
            $this->fail('abriu sem orientador');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('student_user_id', $e->errors());
        }
    }

    public function test_old_advisor_stops_seeing_the_request(): void
    {
        $old = $this->professor();
        $student = $this->advisee($old);
        $this->open($student);
        $new = $this->professor();
        $new->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);
        $student->advisors()->detach($old->id);

        $this->actingAs($old)->getJson(self::URL)->assertJsonCount(0, 'data');
        $this->actingAs($new)->getJson(self::URL)->assertJsonCount(1, 'data')->assertJsonPath('data.0.advisor.id', $new->id);
    }

    // ---- avisos por e-mail ---------------------------------------------------------

    public function test_transitions_send_mail_to_the_right_people(): void
    {
        config(['services.pgcomp.coordination_email' => 'coordenacao@pgcomp.example']);
        $advisor = $this->professor();
        $student = $this->advisee($advisor);

        $id = $this->open($student);
        Mail::assertSent(DefenseRequestMail::class, fn ($m) => $m->event === 'opened' && $m->hasTo($advisor->email));
        Mail::assertNotSent(DefenseRequestMail::class, fn ($m) => $m->hasTo($student->email));

        $this->actingAs($advisor)->putJson(self::URL."/{$id}", ['type' => 'masters_qualification', 'data' => $this->answers()])->assertOk();
        Mail::assertSent(DefenseRequestMail::class, fn ($m) => $m->event === 'submitted' && $m->hasTo($student->email));
        Mail::assertSent(DefenseRequestMail::class, fn ($m) => $m->event === 'submitted' && $m->hasTo('coordenacao@pgcomp.example'));
        Mail::assertNotSent(DefenseRequestMail::class, fn ($m) => $m->event === 'submitted' && $m->hasTo($advisor->email));

        $this->actingAs($student)->deleteJson(self::URL."/{$id}")->assertOk();
        Mail::assertSent(DefenseRequestMail::class, fn ($m) => $m->event === 'archived' && $m->hasTo($advisor->email));
        Mail::assertNotSent(DefenseRequestMail::class, fn ($m) => $m->event === 'archived' && $m->hasTo($student->email));
    }

    public function test_refused_transition_sends_nothing(): void
    {
        $advisor = $this->professor();
        $student = $this->advisee($advisor);
        $id = $this->open($student);
        Mail::fake();

        $this->actingAs($this->professor())->deleteJson(self::URL."/{$id}")->assertForbidden();
        Mail::assertNothingSent();
    }
}
