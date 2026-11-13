<?php

namespace Tests\Feature\DefenseRequests;

use App\Console\Commands\Scraping\SigaaScrapingCommand;
use App\Console\Commands\Scraping\SigaaStudentsCommand;
use App\Domain\DefenseRequests\DefenseRequestForms;
use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Models\User;
use Illuminate\Console\OutputStyle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;
use Tests\TestCase;

/**
 * A importação do SIGAA também passa pela trava do último orientador (UserService::syncAdvisors):
 * solicitação aguardando nunca fica sem orientador, e um discente recusado não para a importação.
 */
class SigaaImportAdvisorGuardTest extends TestCase
{
    use RefreshDatabase;

    private User $advisor;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        $this->advisor = User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR, 'siape' => '1111111']);
    }

    private function student(string $registration): User
    {
        $student = User::factory()->create(['is_approved' => true, 'type' => UserType::STUDENT, 'registration' => $registration]);
        $this->advisor->advisedes()->attach($student->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        return $student;
    }

    private function openRequest(User $student): int
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

        return $this->actingAs($student)->postJson('/api/portal/defense-requests', ['type' => 'masters_qualification', 'data' => $data])
            ->assertCreated()->json('data.id');
    }

    /** Como o SIGAA devolve: o orientador sem SIAPE no link é pulado pelo scraper. */
    private function scraped(User $student, ?string $siape, string $name = 'Novo Nome'): array
    {
        return [
            'registration' => $student->registration,
            'name' => $name,
            'teachers' => [['siape' => $siape, 'name' => 'Fulano', 'relation_type' => UserRelationType::ADVISOR->value]],
            'course_id' => null,
        ];
    }

    private function import(string $command, array $students): string
    {
        $cmd = app($command);
        $cmd->setLaravel(app());
        $cmd->setOutput(new OutputStyle(new ArrayInput([]), $out = new BufferedOutput));
        (fn () => $this->createOrUpdateStudents($students))->call($cmd);

        return $out->fetch();
    }

    public static function commands(): array
    {
        return [[SigaaStudentsCommand::class], [SigaaScrapingCommand::class]];
    }

    /** @dataProvider commands */
    public function test_import_cannot_orphan_an_awaiting_request(string $command): void
    {
        $student = $this->student('2024000001');
        $id = $this->openRequest($student);
        $other = $this->student('2024000002');

        $output = $this->import($command, [$this->scraped($student, null), $this->scraped($other, null, 'Outro Discente')]);

        // Recusado, explicado no log, e nada desse discente muda (a transação dele é desfeita).
        $this->assertStringContainsString('Vincule outro orientador antes', $output);
        $this->assertTrue($student->fresh()->advisors()->whereKey($this->advisor->id)->exists());
        $this->assertSame($student->name, $student->fresh()->name);
        $this->assertContains($id, $this->actingAs($this->advisor)->getJson('/api/portal/defense-requests')->json('data.*.id'));

        // A importação segue: o discente sem pedido aguardando é atualizado como antes.
        $this->assertSame('Outro Discente', $other->fresh()->name);
        $this->assertFalse($other->fresh()->advisors()->exists());
    }

    /** @dataProvider commands */
    public function test_import_can_still_swap_the_advisor_of_an_awaiting_request(string $command): void
    {
        $student = $this->student('2024000001');
        $this->openRequest($student);
        $new = User::factory()->create(['is_approved' => true, 'type' => UserType::PROFESSOR, 'siape' => '2222222']);

        $this->import($command, [$this->scraped($student, '2222222')]);

        $this->assertSame([$new->id], $student->fresh()->advisors()->pluck('users.id')->all());
    }
}
