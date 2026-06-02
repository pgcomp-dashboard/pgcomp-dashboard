<?php

namespace Tests\Unit\Services;

use App\Enums\UserType;
use App\Models\Project;
use App\Models\User;
use App\Services\ProjectService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ProjectService();
    }

    private function makeProfessor(): User
    {
        return User::factory()->create([
            'type'        => UserType::PROFESSOR,
            'is_approved' => true,
        ]);
    }

    public function test_store_creates_project_and_links_to_user(): void
    {
        $professor = $this->makeProfessor();

        $project = $this->service->store([
            'name'       => 'Projeto Novo',
            'start_year' => 2022,
        ], $professor->id, 'Coordenador');

        $this->assertDatabaseHas('projects', [ 'name' => 'Projeto Novo' ]);
        $this->assertDatabaseHas('project_user', [
            'project_id' => $project->id,
            'user_id'    => $professor->id,
            'role'       => 'Coordenador',
        ]);
    }

    public function test_update_changes_project_fields(): void
    {
        $project = Project::factory()->create([ 'name' => 'Nome Antigo' ]);

        $updated = $this->service->update($project, [ 'name' => 'Nome Novo', 'start_year' => 2020 ]);

        $this->assertEquals('Nome Novo', $updated->name);
        $this->assertDatabaseHas('projects', [ 'id' => $project->id, 'name' => 'Nome Novo' ]);
    }

    public function test_delete_for_user_removes_project_when_single_participant(): void
    {
        $professor = $this->makeProfessor();
        $project   = Project::factory()->create();
        $project->participants()->attach($professor->id, [ 'role' => 'Coordenador' ]);

        $this->service->deleteForUser($professor->id, $project->id);

        $this->assertDatabaseMissing('projects', [ 'id' => $project->id ]);
    }

    public function test_delete_for_user_only_detaches_when_multiple_participants(): void
    {
        $professor1 = $this->makeProfessor();
        $professor2 = $this->makeProfessor();
        $project    = Project::factory()->create();
        $project->participants()->attach($professor1->id, [ 'role' => 'Coordenador' ]);
        $project->participants()->attach($professor2->id, [ 'role' => 'Integrante' ]);

        $this->service->deleteForUser($professor1->id, $project->id);

        $this->assertDatabaseHas('projects', [ 'id' => $project->id ]);
        $this->assertDatabaseMissing('project_user', [
            'project_id' => $project->id,
            'user_id'    => $professor1->id,
        ]);
    }

    public function test_delete_all_user_projects_removes_owned_projects(): void
    {
        $professor = $this->makeProfessor();
        $project1  = Project::factory()->create();
        $project2  = Project::factory()->create();
        $project1->participants()->attach($professor->id, [ 'role' => 'Coordenador' ]);
        $project2->participants()->attach($professor->id, [ 'role' => 'Coordenador' ]);

        $count = $this->service->deleteAllUserProjects($professor);

        $this->assertEquals(2, $count);
        $this->assertDatabaseMissing('projects', [ 'id' => $project1->id ]);
        $this->assertDatabaseMissing('projects', [ 'id' => $project2->id ]);
    }

    public function test_get_projects_for_user_returns_only_user_projects(): void
    {
        $professor1 = $this->makeProfessor();
        $professor2 = $this->makeProfessor();

        $project1 = Project::factory()->create();
        $project2 = Project::factory()->create();
        $project1->participants()->attach($professor1->id, [ 'role' => 'Coordenador' ]);
        $project2->participants()->attach($professor2->id, [ 'role' => 'Coordenador' ]);

        $projects = $this->service->getProjectsForUser($professor1->id);

        $this->assertCount(1, $projects);
        $this->assertEquals($project1->id, $projects->first()->id);
    }
}