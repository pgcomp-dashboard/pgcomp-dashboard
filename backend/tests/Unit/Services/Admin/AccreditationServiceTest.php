<?php

namespace Tests\Unit\Services\Admin;

use App\Models\Configuration;
use App\Models\User;
use App\Models\Production;
use App\Models\Publisher;
use App\Models\StratumQualis;
use App\Services\Admin\AccreditationService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AccreditationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AccreditationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AccreditationService();
    }

    public function test_accreditation_logic_or_condition()
    {
        // Setup rules
        Configuration::updateOrCreate(
            ['group' => 'accreditation', 'name' => 'rules'],
            ['value' => [
                'initial_year' => 2020,
                'final_year' => 2024,
                'is_pq_required' => true,
                'min_journals' => 2,
                'min_score' => 100,
            ]]
        );

        // Case 1: Meets score and journals -> Accredited
        $user1 = User::factory()->professor()->create(['pq' => false]);
        $this->createProductions($user1, 2, 'A1', 2022); // 2 * 100 = 200 score

        // Case 2: Is PQ and is_pq_required is true -> Accredited (even if failing score/journals)
        $user2 = User::factory()->professor()->create(['pq' => true]);
        $this->createProductions($user2, 1, 'A1', 2022); // 1 * 100 = 100 score, but only 1 journal

        // Case 3: Failing everything -> Not Accredited
        $user3 = User::factory()->professor()->create(['pq' => false]);
        $this->createProductions($user3, 1, 'B1', 2022); // 1 * 40 = 40 score, 0 A1-A4

        // Case 4: Meets score but fails journals -> Not Accredited
        $user4 = User::factory()->professor()->create(['pq' => false]);
        $this->createProductions($user4, 10, 'B1', 2022); // 10 * 40 = 400 score, but 0 A1-A4

        $ranking = $this->service->getAccreditationRanking(2020, 2024);

        $this->assertTrue($ranking->where('user_id', $user1->id)->first()->is_accredited, "User 1 should be accredited (score/journals)");
        $this->assertTrue($ranking->where('user_id', $user2->id)->first()->is_accredited, "User 2 should be accredited (is PQ)");
        $this->assertFalse($ranking->where('user_id', $user3->id)->first()->is_accredited, "User 3 should NOT be accredited");
        $this->assertFalse($ranking->where('user_id', $user4->id)->first()->is_accredited, "User 4 should NOT be accredited (fails journals)");
    }

    private function createProductions($user, $count, $qualisCode, $year)
    {
        $qualis = StratumQualis::where('code', $qualisCode)->first();
        if (!$qualis) {
            $qualis = StratumQualis::create([
                'code' => $qualisCode,
                'score' => $qualisCode === 'A1' ? 100 : 40,
            ]);
        }

        for ($i = 0; $i < $count; $i++) {
            $publisher = Publisher::factory()->create(['stratum_qualis_id' => $qualis->id]);
            $production = Production::factory()->create([
                'publisher_id' => $publisher->id,
                'year' => $year
            ]);
            $user->writerOf()->attach($production->id);
        }
    }
}
