<?php

namespace Tests\Feature\Dashboard;

use App\Enums\UserRelationType;
use App\Enums\UserType;
use App\Models\Course;
use App\Models\Defense;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvisorStudentsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create(['is_approved' => true]);
    }

    private function professor(): User
    {
        return User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);
    }

    private function attachStudent(User $professor, array $state = []): User
    {
        $student = User::factory()->create(array_merge([
            'type' => UserType::STUDENT,
        ], $state));

        $student->advisors()->attach($professor->id, ['relation_type' => UserRelationType::ADVISOR->value]);

        return $student;
    }

    public function test_requires_admin_authentication()
    {
        $professor = $this->professor();

        $this->getJson("/api/admin/dashboard/advisor/{$professor->id}/students")->assertStatus(401);

        $student = User::factory()->create(['is_approved' => true]);
        $this->actingAs($student)
            ->getJson("/api/admin/dashboard/advisor/{$professor->id}/students")
            ->assertStatus(403);
    }

    public function test_unknown_professor_fails_consistently_with_other_dashboard_endpoints()
    {
        // Este app não possui tratamento dedicado para ModelNotFoundException (ver
        // app/Exceptions/Handler.php): qualquer Throwable não listado explicitamente cai no
        // renderable genérico e vira 500. Mantém o mesmo comportamento dos demais endpoints do
        // DashboardController (ex: professor/{id}/productions) em vez de criar um 404 isolado
        // só para esta rota.
        $response = $this->actingAs($this->admin())
            ->getJson('/api/admin/dashboard/advisor/999999/students');

        $response->assertStatus(500);
    }

    public function test_lists_active_students_by_default()
    {
        $admin = $this->admin();
        $professor = $this->professor();
        $mestrado = Course::firstOrCreate(['name' => 'Mestrado']);

        $active = $this->attachStudent($professor, [
            'name' => 'Aluno Ativo',
            'registration' => 202610001,
            'course_id' => $mestrado->id,
        ]);

        $completed = $this->attachStudent($professor, [
            'name' => 'Aluno Concluído',
            'registration' => 202010002,
            'course_id' => $mestrado->id,
        ]);
        Defense::create([
            'user_id' => $completed->id,
            'course_id' => $mestrado->id,
            'defended_at' => '2024-01-10',
            'type' => Defense::TYPE_MESTRADO,
        ]);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/dashboard/advisor/{$professor->id}/students");

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $active->id)
            ->assertJsonPath('data.0.registration', 202610001)
            ->assertJsonPath('data.0.course', 'Mestrado')
            ->assertJsonPath('data.0.status', 'Ativo');
    }

    public function test_filters_by_mestrando_doutorando_and_completed()
    {
        $admin = $this->admin();
        $professor = $this->professor();
        $mestrado = Course::firstOrCreate(['name' => 'Mestrado']);
        $doutorado = Course::firstOrCreate(['name' => 'Doutorado']);

        $mestrando = $this->attachStudent($professor, ['course_id' => $mestrado->id]);
        $doutorando = $this->attachStudent($professor, ['course_id' => $doutorado->id]);
        $concluido = $this->attachStudent($professor, ['course_id' => $mestrado->id]);
        Defense::create([
            'user_id' => $concluido->id,
            'course_id' => $mestrado->id,
            'defended_at' => '2023-06-01',
            'type' => Defense::TYPE_MESTRADO,
        ]);

        $base = "/api/admin/dashboard/advisor/{$professor->id}/students";

        $this->actingAs($admin)->getJson("{$base}?user_type=mestrando")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $mestrando->id);

        $this->actingAs($admin)->getJson("{$base}?user_type=doutorando")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $doutorando->id);

        $this->actingAs($admin)->getJson("{$base}?user_type=completed")
            ->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $concluido->id)
            ->assertJsonPath('data.0.status', 'Concluído');
    }

    public function test_rejects_invalid_user_type()
    {
        $professor = $this->professor();

        $response = $this->actingAs($this->admin())
            ->getJson("/api/admin/dashboard/advisor/{$professor->id}/students?user_type=invalido");

        $response->assertStatus(422);
    }
}
