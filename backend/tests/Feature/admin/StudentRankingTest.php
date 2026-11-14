<?php

namespace Tests\Feature\Admin;

use App\Models\Configuration;
use App\Models\Production;
use App\Models\Publishers;
use App\Models\StratumQualis;
use App\Models\User;
use App\Services\Admin\StudentRankingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudentRankingTest extends TestCase
{
    use RefreshDatabase;

    public function test_ranking_only_contains_students_who_meet_configured_minimums(): void
    {
        $year = 2024;
        Configuration::set('student_ranking', 'rules', [
            'initial_year' => $year,
            'final_year' => $year,
            'min_journals' => 3,
            'min_journals_a1a2' => 2,
            'min_score' => 6,
        ]);

        $eligibleByJournalCount = User::factory()->create(['name' => 'Eligible by A1-A4']);
        $this->addJournalProductions($eligibleByJournalCount, 'A3', 2, 3, $year);

        $eligibleByA1A2Count = User::factory()->create(['name' => 'Eligible by A1-A2']);
        $this->addJournalProductions($eligibleByA1A2Count, 'A1', 3, 2, $year);

        $belowJournalMinimum = User::factory()->create(['name' => 'Below journal minimum']);
        $this->addJournalProductions($belowJournalMinimum, 'A3', 3, 2, $year);

        $belowScoreMinimum = User::factory()->create(['name' => 'Below score minimum']);
        $this->addJournalProductions($belowScoreMinimum, 'A1', 2, 2, $year);

        $ranking = app(StudentRankingService::class)->getRanking($year, $year);
        $rankedUserIds = collect($ranking->items())->pluck('user_id')->all();
        $positions = collect($ranking->items())
            ->pluck('position')
            ->map(fn ($position) => (int) $position)
            ->all();

        $this->assertEqualsCanonicalizing(
            [$eligibleByJournalCount->id, $eligibleByA1A2Count->id],
            $rankedUserIds,
        );
        $this->assertSame([1, 2], $positions);

        $rankingWithIneligible = app(StudentRankingService::class)
            ->getRanking($year, $year, includeIneligible: true);
        $rankedWithIneligible = collect($rankingWithIneligible->items())->keyBy('user_id');

        $this->assertEqualsCanonicalizing(
            [
                $eligibleByJournalCount->id,
                $eligibleByA1A2Count->id,
                $belowJournalMinimum->id,
                $belowScoreMinimum->id,
            ],
            $rankedWithIneligible->keys()->all(),
        );
        $this->assertFalse((bool) $rankedWithIneligible[$belowJournalMinimum->id]->is_eligible);
        $this->assertFalse((bool) $rankedWithIneligible[$belowScoreMinimum->id]->is_eligible);
    }

    private function addJournalProductions(
        User $student,
        string $qualisCode,
        int $score,
        int $count,
        int $year,
    ): void {
        $stratum = StratumQualis::factory()->create([
            'code' => $qualisCode,
            'score' => $score,
        ]);
        $publisher = Publishers::factory()->create([
            'publisher_type' => 'journal',
            'stratum_qualis_id' => $stratum->id,
        ]);
        $productionIds = Production::factory()
            ->count($count)
            ->create([
                'year' => $year,
                'publisher_id' => $publisher->id,
            ])
            ->pluck('id');

        $student->writerOf()->attach($productionIds);
    }
}
