<?php

namespace Tests\Feature\Admin;

use App\Enums\UserType;
use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectTest extends TestCase
{
    use RefreshDatabase;

    // ── Helpers ──────────────────────────────────────────────────────────────

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

    private function attachProject(User $professor, array $projectState = []): Project
    {
        $project = Project::factory()->state($projectState)->create();
        $project->participants()->attach($professor->id, [ 'role' => 'Coordenador' ]);
        return $project;
    }

    // ── Admin: CRUD de projetos por professor ─────────────────────────────────

    public function test_admin_can_list_professor_projects(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();
        $this->attachProject($professor);
        $this->attachProject($professor);

        $response = $this->actingAs($admin)
            ->getJson("/api/admin/professors/{$professor->id}/projects");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_admin_can_create_project_for_professor(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();

        $response = $this->actingAs($admin)
            ->postJson("/api/admin/professors/{$professor->id}/projects", [
                'name'       => 'Projeto Teste',
                'start_year' => 2022,
                'status'     => 'EM_ANDAMENTO',
                'nature'     => 'PESQUISA',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('projects', [ 'name' => 'Projeto Teste' ]);
        $this->assertDatabaseHas('project_user', [
            'user_id' => $professor->id,
        ]);
    }

    public function test_admin_can_update_project(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();
        $project   = $this->attachProject($professor, [ 'name' => 'Nome Antigo' ]);

        $response = $this->actingAs($admin)
            ->putJson("/api/admin/professors/{$professor->id}/projects/{$project->id}", [
                'name'       => 'Nome Atualizado',
                'start_year' => $project->start_year,
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('projects', [ 'id' => $project->id, 'name' => 'Nome Atualizado' ]);
    }

    public function test_admin_can_delete_project(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();
        $project   = $this->attachProject($professor);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/admin/professors/{$professor->id}/projects/{$project->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('projects', [ 'id' => $project->id ]);
    }

    public function test_admin_can_delete_all_professor_projects(): void
    {
        $admin     = $this->makeAdmin();
        $professor = $this->makeProfessor();
        $this->attachProject($professor);
        $this->attachProject($professor);

        $response = $this->actingAs($admin)
            ->deleteJson("/api/admin/professors/{$professor->id}/projects-all");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('project_user', [ 'user_id' => $professor->id ]);
    }

    public function test_non_admin_cannot_access_admin_project_endpoints(): void
    {
        $professor = $this->makeProfessor();

        $this->actingAs($professor)
            ->getJson("/api/admin/professors/{$professor->id}/projects")
            ->assertStatus(403);
    }

    // ── Portal: professor acessa os próprios projetos ─────────────────────────

    public function test_professor_can_list_own_projects(): void
    {
        $professor = $this->makeProfessor();
        $this->attachProject($professor);
        $this->attachProject($professor);

        $response = $this->actingAs($professor)
            ->getJson('/api/portal/projects');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data');
    }

    public function test_professor_cannot_see_other_professor_projects(): void
    {
        $professor1 = $this->makeProfessor();
        $professor2 = $this->makeProfessor();
        $this->attachProject($professor2);

        $response = $this->actingAs($professor1)
            ->getJson('/api/portal/projects');

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data');
    }

    public function test_unauthenticated_user_cannot_access_portal_projects(): void
    {
        $this->getJson('/api/portal/projects')
            ->assertStatus(401);
    }
}