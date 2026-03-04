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
}
