<?php

namespace Tests\Feature\Admin;

use App\Enums\UserType;
use App\Models\Configuration;
use App\Models\User;
use App\Services\Admin\AccreditationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccreditationTest extends TestCase
{
    use RefreshDatabase;

    protected AccreditationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new AccreditationService();
    }

    public function test_senior_user_is_accredited_when_senior_rule_is_active()
    {
        // 1. Setup rules
        Configuration::set('accreditation', 'rules', [
            'is_senior_required' => true,
            'initial_year' => date("Y") - 1,
            'final_year' => date("Y"),
            'min_score' => 100, // Very high to ensure it wouldn't be accredited otherwise
            'min_journals' => 10,
        ]);

        // 2. Create a senior user
        $user = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_senior' => true,
            'is_approved' => true,
        ]);

        // 3. Check ranking
        $ranking = $this->service->getAccreditationRanking();
        $userData = $ranking->firstWhere('user_id', $user->id);

        $this->assertTrue($userData->is_accredited);

        // 4. Check user details
        $details = $this->service->getAccreditationUserDetails($user->id);
        $this->assertTrue($details['is_accredited']);
    }

    public function test_senior_user_is_not_accredited_by_senior_rule_when_it_is_inactive()
    {
        // 1. Setup rules - senior rule INACTIVE
        Configuration::set('accreditation', 'rules', [
            'is_senior_required' => false,
            'initial_year' => date("Y") - 1,
            'final_year' => date("Y"),
            'min_score' => 100,
            'min_journals' => 10,
        ]);

        // 2. Create a senior user with low score
        $user = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_senior' => true,
            'is_approved' => true,
        ]);

        // 3. Check ranking
        $ranking = $this->service->getAccreditationRanking();
        $userData = $ranking->firstWhere('user_id', $user->id);

        $this->assertFalse($userData->is_accredited);
        // "Não é docente sênior" should NOT be in reasons because the rule is inactive
        $this->assertNotContains('Não é docente sênior', $userData->reasons);
    }

    public function test_qualis_breakdown_only_includes_a1_a4_journals()
    {
        // 1. Create a user
        $user = User::factory()->create([
            'type' => UserType::PROFESSOR,
            'is_approved' => true,
        ]);

        // 2. Setup years for rules
        $year = (int) date("Y");
        Configuration::set('accreditation', 'rules', [
            'initial_year' => $year,
            'final_year' => $year,
        ]);

        // 3. Create stratum qualis
        $a1 = \App\Models\StratumQualis::create(['code' => 'A1', 'score' => 10, 'type' => 'periodico']);
        $b1 = \App\Models\StratumQualis::create(['code' => 'B1', 'score' => 5, 'type' => 'periodico']);

        // 4. Create publishers
        $journalA1 = \App\Models\Publishers::factory()->create(['publisher_type' => 'journal', 'stratum_qualis_id' => $a1->id]);
        $journalB1 = \App\Models\Publishers::factory()->create(['publisher_type' => 'journal', 'stratum_qualis_id' => $b1->id]);
        $conferenceA1 = \App\Models\Publishers::factory()->create(['publisher_type' => 'conference', 'stratum_qualis_id' => $a1->id]);

        // 5. Create productions and link to user
        $p1 = \App\Models\Production::factory()->create(['year' => $year, 'publisher_id' => $journalA1->id]);
        $p2 = \App\Models\Production::factory()->create(['year' => $year, 'publisher_id' => $journalB1->id]);
        $p3 = \App\Models\Production::factory()->create(['year' => $year, 'publisher_id' => $conferenceA1->id]);

        $user->writerOf()->attach([$p1->id, $p2->id, $p3->id]);

        // 6. Check ranking
        $ranking = $this->service->getAccreditationRanking();
        $userData = $ranking->firstWhere('user_id', $user->id);

        $this->assertArrayHasKey('A1', $userData->qualis_breakdown);
        $this->assertEquals(1, $userData->qualis_breakdown['A1']);
        $this->assertArrayNotHasKey('B1', $userData->qualis_breakdown);
        $this->assertCount(1, $userData->qualis_breakdown);

        // 7. Check details
        $details = $this->service->getAccreditationUserDetails($user->id);
        $this->assertArrayHasKey('A1', $details['qualis_breakdown']);
        $this->assertEquals(1, $details['qualis_breakdown']['A1']);
        $this->assertArrayNotHasKey('B1', $details['qualis_breakdown']);
        $this->assertCount(1, $details['qualis_breakdown']);
    }
}
