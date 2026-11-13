<?php

namespace Tests\Feature\Admin;

use App\Enums\UserType;
use App\Enums\ProductionSource;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\StratumQualis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductionStatisticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_view_production_statistics_and_non_admin_cannot(): void
    {
        $admin = User::factory()->admin()->create(['is_approved' => true]);
        $professorWithTwo = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);
        $professorWithOne = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);
        User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);

        $a1 = StratumQualis::create(['code' => 'A1', 'score' => 10, 'type' => 'conference']);
        $b1 = StratumQualis::create(['code' => 'B1', 'score' => 5, 'type' => 'periodico']);
        $conference = Publishers::factory()->create([
            'publisher_type' => 'conference',
            'stratum_qualis_id' => $a1->id,
        ]);
        $unclassifiedConference = Publishers::factory()->create([
            'publisher_type' => 'conference',
            'stratum_qualis_id' => null,
        ]);
        $journal = Publishers::factory()->create([
            'publisher_type' => 'journal',
            'stratum_qualis_id' => $b1->id,
        ]);

        $firstConferenceProduction = Production::factory()->create([
            'year' => 2022,
            'publisher_type' => 'conference',
            'publisher_id' => $conference->id,
            'source' => ProductionSource::SCRIPT,
        ]);
        $secondConferenceProduction = Production::factory()->create([
            'year' => 2024,
            'publisher_type' => 'conference',
            'publisher_id' => $conference->id,
            'source' => ProductionSource::XML,
        ]);
        $manualProduction = Production::factory()->create([
            'year' => 2024,
            'publisher_type' => 'conference',
            'publisher_id' => $unclassifiedConference->id,
            'source' => ProductionSource::MANUAL,
        ]);
        Production::factory()->create([
            'year' => 2023,
            'publisher_type' => 'journal',
            'publisher_id' => $journal->id,
            'source' => ProductionSource::DOI,
        ]);
        $firstConferenceProduction->isWroteBy()->attach([
            $professorWithTwo->id,
            $professorWithOne->id,
        ]);
        $secondConferenceProduction->isWroteBy()->attach($professorWithTwo->id);
        $manualProduction->isWroteBy()->attach($professorWithOne->id);

        $this->actingAs(User::factory()->create(['is_approved' => true]))
            ->getJson('/api/admin/dashboard/production-statistics')
            ->assertForbidden();

        $response = $this->actingAs($admin)
            ->getJson('/api/admin/dashboard/production-statistics')
            ->assertOk()
            ->assertJsonPath('faculty_summary.faculty_count', 3)
            ->assertJsonPath('faculty_summary.faculty_with_productions_count', 2)
            ->assertJsonPath('faculty_summary.mean', 1.33)
            ->assertJsonPath('faculty_summary.median', 2)
            ->assertJsonPath('faculty_summary.standard_deviation', 0.94)
            ->assertJsonPath('faculty_summary.minimum', 0)
            ->assertJsonPath('faculty_summary.maximum', 2)
            ->assertJsonPath('conferences_by_qualis.0.qualis', 'A1')
            ->assertJsonPath('conferences_by_qualis.0.total', 2)
            ->assertJsonPath('conferences_by_qualis.0.percentage', 66.67)
            ->assertJsonPath('conferences_by_qualis.1.qualis', 'B1')
            ->assertJsonPath('conferences_by_qualis.1.total', 0)
            ->assertJsonPath('conferences_by_qualis.2.qualis', 'NI')
            ->assertJsonPath('conferences_by_qualis.2.total', 1)
            ->assertJsonPath('conferences_by_qualis.2.percentage', 33.33)
            ->assertJsonPath('journals_by_qualis.1.qualis', 'B1')
            ->assertJsonPath('journals_by_qualis.1.percentage', 100)
            ->assertJsonPath('productions_per_year.0.year', 2022)
            ->assertJsonPath('productions_per_year.0.total', 1)
            ->assertJsonPath('productions_per_year.2.year', 2024)
            ->assertJsonPath('productions_per_year.2.total', 2);

        $this->assertSame(
            [
                ['source' => 'script', 'total' => 1],
                ['source' => 'xml', 'total' => 1],
                ['source' => 'manual', 'total' => 1],
                ['source' => 'doi', 'total' => 1],
                ['source' => 'unknown', 'total' => 0],
            ],
            $response->json('productions_by_source'),
        );

        $facultySourceRows = collect($response->json('faculty_productions_by_source'))
            ->keyBy('id');
        $this->assertSame(1, $facultySourceRows[$professorWithTwo->id]['productions_by_source']['script']);
        $this->assertSame(1, $facultySourceRows[$professorWithTwo->id]['productions_by_source']['xml']);
        $this->assertSame(1, $facultySourceRows[$professorWithOne->id]['productions_by_source']['script']);
        $this->assertSame(1, $facultySourceRows[$professorWithOne->id]['productions_by_source']['manual']);
    }
}
