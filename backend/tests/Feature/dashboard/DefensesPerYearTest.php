<?php

namespace Tests\Feature\Dashboard;

use App\Enums\UserType;
use App\Models\Course;
use App\Models\Defense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DefensesPerYearTest extends TestCase
{
    use RefreshDatabase;

    private const ENDPOINT = '/api/admin/dashboard/defenses_per_year';

    private function admin(): User
    {
        return User::factory()->admin()->create(['is_approved' => true]);
    }

    private function registerDefense(string $courseName, string $type, string $date): void
    {
        $course = Course::firstOrCreate(['name' => $courseName]);

        $student = User::factory()->create([
            'type' => UserType::STUDENT,
            'course_id' => $course->id,
        ]);

        Defense::create([
            'user_id' => $student->id,
            'course_id' => $course->id,
            'defended_at' => $date,
            'type' => $type,
        ]);
    }

    public function test_returns_defenses_grouped_by_year_and_level()
    {
        $this->registerDefense('Mestrado', Defense::TYPE_MESTRADO, '2021-03-10');
        $this->registerDefense('Mestrado', Defense::TYPE_MESTRADO, '2021-08-22');
        $this->registerDefense('Doutorado', Defense::TYPE_DOUTORADO, '2021-12-01');
        $this->registerDefense('Doutorado', Defense::TYPE_DOUTORADO, '2022-06-15');

        $response = $this->actingAs($this->admin())->getJson(self::ENDPOINT);

        $response->assertStatus(200);
        $data = collect($response->json());

        $y2021 = $data->firstWhere('year', 2021);
        $this->assertNotNull($y2021, 'Esperava um registro para 2021');
        $this->assertSame(2, $y2021['mestrado']);
        $this->assertSame(1, $y2021['doutorado']);

        $y2022 = $data->firstWhere('year', 2022);
        $this->assertSame(0, $y2022['mestrado']);
        $this->assertSame(1, $y2022['doutorado']);

        foreach ($data as $item) {
            $this->assertArrayHasKey('year', $item);
            $this->assertMatchesRegularExpression('/^\d{4}$/', (string) $item['year']);
            $this->assertIsInt($item['mestrado']);
            $this->assertIsInt($item['doutorado']);
        }
    }

    public function test_counts_come_from_the_defenses_table_not_the_legacy_column()
    {
        // Defesa registrada na nova tabela.
        $this->registerDefense('Mestrado', Defense::TYPE_MESTRADO, '2020-05-10');

        // Aluno apenas com o campo legado users.defended_at, sem linha em defenses.
        $course = Course::firstOrCreate(['name' => 'Mestrado']);
        User::factory()->create([
            'type' => UserType::STUDENT,
            'course_id' => $course->id,
            'defended_at' => '2019-04-04',
        ]);

        $data = collect($this->actingAs($this->admin())->getJson(self::ENDPOINT)->json());

        $this->assertSame(1, $data->firstWhere('year', 2020)['mestrado']);
        $this->assertNull(
            $data->firstWhere('year', 2019),
            'users.defended_at não deve alimentar o gráfico sem uma linha correspondente em defenses'
        );
    }

    public function test_requires_admin_authentication()
    {
        $this->getJson(self::ENDPOINT)->assertStatus(401);

        $student = User::factory()->create(['is_approved' => true]);
        $this->actingAs($student)->getJson(self::ENDPOINT)->assertStatus(403);
    }
}
