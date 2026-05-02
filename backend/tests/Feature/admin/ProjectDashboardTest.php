<?php

namespace Tests\Feature\Admin;

use App\Enums\UserType;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectDashboardTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        return User::factory()->admin()->create([ 'is_approved' => true ]);
    }

    private function makeProfessor(): User
    {
        return User::factory()->create([
            'type'        => UserType::PROFESSOR,
            'is_approved' => true,
        ]);
    }

    private function attachProject(User $professor, array $state = []): Project
    {
        $project = Project::factory()->state($state)->create();
        $project->participants()->attach($professor->id, [ 'role' => 'Coordenador' ]);
        return $project;
    }

    // ── Summary ───────────────────────────────────────────────────────────────

    public function test_summary_returns_correct_totals(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();

        $this->attachProject($professor, [ 'status' => 'EM_ANDAMENTO', 'nature' => 'PESQUISA' ]);
        $this->attachProject($professor, [ 'status' => 'EM_ANDAMENTO', 'nature' => 'PESQUISA' ]);
        $this->attachProject($professor, [ 'status' => 'CONCLUIDO',    'nature' => 'PESQUISA' ]);
        $this->attachProject($professor, [ 'status' => 'CONCLUIDO',    'nature' => 'INTERNACIONAL' ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/projects-dashboard/summary');

        $response->assertStatus(200)
            ->assertJsonPath('total', 4)
            ->assertJsonPath('total_abertos', 2)
            ->assertJsonPath('total_concluidos', 2)
            ->assertJsonPath('total_internacional', 1)
            ->assertJsonPath('total_nacional', 3);
    }

    public function test_summary_filters_by_professor(): void
    {
        $admin      = $this->makeAdmin();
        $professor1 = $this->makeProfessor();
        $professor2 = $this->makeProfessor();

        $this->attachProject($professor1);
        $this->attachProject($professor1);
        $this->attachProject($professor2);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/projects-dashboard/summary?professor_id={$professor1->id}");

        $response->assertStatus(200)
            ->assertJsonPath('total', 2);
    }

    public function test_summary_filters_by_status(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();

        $this->attachProject($professor, [ 'status' => 'EM_ANDAMENTO' ]);
        $this->attachProject($professor, [ 'status' => 'EM_ANDAMENTO' ]);
        $this->attachProject($professor, [ 'status' => 'CONCLUIDO' ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/projects-dashboard/summary?status=EM_ANDAMENTO');

        $response->assertStatus(200)
            ->assertJsonPath('total', 2);
    }

    public function test_summary_filters_by_year(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();

        $this->attachProject($professor, [ 'start_year' => 2020, 'end_year' => 2022 ]);
        $this->attachProject($professor, [ 'start_year' => 2023, 'end_year' => null ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/projects-dashboard/summary?year=2021');

        $response->assertStatus(200)
            ->assertJsonPath('total', 1);
    }

    // ── Table ─────────────────────────────────────────────────────────────────

    public function test_table_returns_projects_with_participants(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();
        $this->attachProject($professor, [ 'name' => 'Projeto Alpha' ]);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/projects-dashboard/table');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Projeto Alpha')
            ->assertJsonStructure([ 'data' => [[ 'id', 'name', 'status', 'nature', 'start_year', 'participants' ]] ]);
    }

    // ── Professors ────────────────────────────────────────────────────────────

    public function test_professors_endpoint_returns_only_professors_with_projects(): void
    {
        $admin      = $this->makeAdmin();
        $professor1 = $this->makeProfessor();
        $professor2 = $this->makeProfessor(); // sem projetos

        $this->attachProject($professor1);

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/projects-dashboard/professors');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $professor1->id);
    }

    // ── Auth ──────────────────────────────────────────────────────────────────

    public function test_non_admin_cannot_access_dashboard_endpoints(): void
    {
        $professor = $this->makeProfessor();

        $this->actingAs($professor)
            ->getJson('/api/admin/projects-dashboard/summary')
            ->assertStatus(403);

        $this->actingAs($professor)
            ->getJson('/api/admin/projects-dashboard/table')
            ->assertStatus(403);
    }
}