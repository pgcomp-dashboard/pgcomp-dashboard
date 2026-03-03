<?php

namespace Tests\Feature;

use App\Models\Production;
use App\Models\User;
use App\Services\ProductionService;
use App\Domain\Lattes\LattesZipXml;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;
use Mockery;

class SyncProductionsTest extends TestCase
{
    use DatabaseTransactions;

    /**
     * @runInSeparateProcess
     * @preserveGlobalState disabled
     */
    public function test_import_from_lattes_syncs_productions_correctly()
    {
        // 1. Setup User and existing productions
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // Production exclusive to $user (should be deleted)
        $exclusiveProd = Production::factory()->create(['title' => 'Exclusive Production']);
        $user->writerOf()->attach($exclusiveProd->id);

        // Production shared between $user and $otherUser (should be detached)
        $sharedProd = Production::factory()->create(['title' => 'Shared Production']);
        $user->writerOf()->attach($sharedProd->id);
        $otherUser->writerOf()->attach($sharedProd->id);

        // 2. Mock LattesZipXml to return 1 NEW production
        $mock = Mockery::mock('alias:' . LattesZipXml::class);
        $mock->shouldReceive('extractProductions')
            ->once()
            ->andReturn([
                'productions' => [
                    [
                        'title' => 'New Production from XML',
                        'year' => 2024,
                        'nature' => 'COMPLETO',
                        'doi' => '10.1234/new-prod',
                        'publisher_type' => 'journal',
                    ]
                ],
                'lattes_updated_at' => '2024-01-01 00:00:00'
            ]);

        // 3. Run the import
        $service = new ProductionService();
        $service->importFromLattes($user, 'dummy_path.zip');

        // 4. Assertions
        // Exclusive production should be deleted
        $this->assertDatabaseMissing('productions', ['id' => $exclusiveProd->id]);

        // Shared production should still exist but be detached from $user
        $this->assertDatabaseHas('productions', ['id' => $sharedProd->id]);
        $this->assertDatabaseMissing('users_productions', [
            'users_id' => $user->id,
            'productions_id' => $sharedProd->id
        ]);
        $this->assertDatabaseHas('users_productions', [
            'users_id' => $otherUser->id,
            'productions_id' => $sharedProd->id
        ]);

        // New production should be associated with $user
        $this->assertDatabaseHas('productions', ['title' => 'New Production from XML']);
        $newProd = Production::where('title', 'New Production from XML')->first();
        $this->assertDatabaseHas('users_productions', [
            'users_id' => $user->id,
            'productions_id' => $newProd->id
        ]);

        // User should have exactly 1 production now
        $this->assertEquals(1, $user->writerOf()->count());
    }
}
